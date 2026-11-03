// Isolated handler tests with mocked network boundaries, not hosted integration tests.
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}
Deno.test(
  "Edge handlers authenticate, bound input, enforce quotas and delete only the verified caller",
  async () => {
    const originalServe = Deno.serve,
      originalFetch = globalThis.fetch;
    let handler: (r: Request) => Promise<Response> = async () => new Response();
    Deno.serve = ((h: unknown) => {
      handler = h as typeof handler;
      return {};
    }) as typeof Deno.serve;
    const envNames = [
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "AI_MODEL",
      "AI_API_KEY",
      "GROQ_FALLBACK_KEY",
      "GROQ_FALLBACK_MODEL",
    ];
    const old = envNames.map((k) => Deno.env.get(k));
    for (const k of envNames)
      Deno.env.set(
        k,
        k === "SUPABASE_URL" ? "https://test.invalid" : "test-value",
      );
    const request = (body: unknown, token = true) =>
      new Request("https://function.invalid", {
        method: "POST",
        headers: token
          ? {
              Authorization: "Bearer user-token",
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    try {
      await import("./mentor/index.ts");
      const mentor = handler;
      let allowed = false,
        calls: string[] = [];
      globalThis.fetch = (async (url) => {
        calls.push(String(url));
        if (String(url).endsWith("/auth/v1/user"))
          return Response.json({ id: "verified-user" });
        if (String(url).includes("consume_mentor_budget"))
          return Response.json(allowed);
        return Response.json({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      question: "What changed?",
                      hint: "Inspect the counts.",
                      limitation: "Synthetic evidence only.",
                    }),
                  },
                ],
              },
            },
          ],
        });
      }) as typeof fetch;
      assert(
        (await mentor(request({ role: "tutor", prompt: "help" }, false)))
          .status === 401,
        "missing token rejected",
      );
      assert(calls.length === 0, "no provider call before authentication");
      assert(
        (await mentor(request({ role: "admin", prompt: "help" }))).status ===
          400,
        "unknown role rejected",
      );
      assert(
        (await mentor(request({ role: "tutor", prompt: "help" }))).status ===
          429,
        "quota enforced",
      );
      assert(
        !calls.some((x) => x.includes("googleapis")),
        "quota blocks provider",
      );
      allowed = true;
      assert(
        (
          await mentor(
            request({
              role: "reviewer",
              prompt: "help",
              context: { mean: 10 },
            }),
          )
        ).status === 200,
        "validated provider reply returned",
      );
      assert(
        (await mentor(request({ role: "tutor", prompt: "x".repeat(15000) })))
          .status === 400,
        "oversized request rejected",
      );
      let charges = 0, primaryCalls = 0, fallbackCalls = 0;
      globalThis.fetch = (async (url) => {
        const endpoint=String(url);
        if(endpoint.endsWith("/auth/v1/user")) return Response.json({id:"verified-user"});
        if(endpoint.includes("consume_mentor_budget")) {charges++;return Response.json(true);}
        if(endpoint.includes("googleapis")) {primaryCalls++;return new Response("unavailable",{status:503});}
        fallbackCalls++;
        return Response.json({choices:[{message:{content:JSON.stringify({question:"Which line failed?",hint:"Inspect the supplied traceback.",limitation:"I did not execute your code."})}}]});
      }) as typeof fetch;
      assert((await mentor(request({role:"debugger",prompt:"Help with this error",context:{error:"NameError"}}))).status===200,"optional fallback returns validated guidance");
      assert(charges===2 && primaryCalls===1 && fallbackCalls===1,"fallback is bounded and consumes a second budget slot");
      globalThis.fetch = (async (url) => {
        const endpoint=String(url);
        if(endpoint.endsWith("/auth/v1/user")) return Response.json({id:"verified-user"});
        if(endpoint.includes("consume_mentor_budget")) return Response.json(true);
        return new Response("down",{status:503});
      }) as typeof fetch;
      assert((await mentor(request({role:"navigator",prompt:"What next?"}))).status===503,"both provider failures return honest unavailability");
      await import("./delete-account/index.ts");
      const deletion = handler;
      let deleteUrl = "";
      globalThis.fetch = (async (url, init) => {
        if (String(url).endsWith("/auth/v1/user"))
          return Response.json({ id: "verified-user" });
        if (init?.method === "DELETE") deleteUrl = String(url);
        return Response.json({});
      }) as typeof fetch;
      assert(
        (await deletion(request({ confirmation: "DELETE MY ACCOUNT" }, false)))
          .status === 401,
        "unauthenticated deletion rejected",
      );
      assert(
        (
          await deletion(
            request({ confirmation: "DELETE MY ACCOUNT", owner: "victim" }),
          )
        ).status === 400,
        "owner injection rejected",
      );
      assert(!deleteUrl, "invalid request does not delete");
      assert(
        (await deletion(request({ confirmation: "DELETE MY ACCOUNT" })))
          .status === 200,
        "confirmed deletion succeeds",
      );
      assert(
        deleteUrl.endsWith("/auth/v1/admin/users/verified-user"),
        "deletion is bound to verified caller",
      );
    } finally {
      Deno.serve = originalServe;
      globalThis.fetch = originalFetch;
      envNames.forEach((k, i) =>
        old[i] === undefined ? Deno.env.delete(k) : Deno.env.set(k, old[i]!),
      );
    }
  },
);
