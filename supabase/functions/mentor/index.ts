import { parseInput, generate } from "../_shared/mentor.ts";
import { cors, verifiedUser, adminRequest, readBody } from "../_shared/http.ts";
Deno.serve(async (req) => {
  const headers = cors(req),
    reply = (body: unknown, status = 200) =>
      Response.json(body, { status, headers });
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const user = await verifiedUser(req);
    if (!user) return reply({ error: "Authentication required" }, 401);
    let input;
    try {
      input = parseInput(await readBody(req));
    } catch {
      return reply({ error: "Invalid mentor request" }, 400);
    }
    const config = {
      provider: Deno.env.get("AI_PROVIDER") ?? "gemini",
      model: Deno.env.get("AI_MODEL") ?? "",
      key: Deno.env.get("AI_API_KEY") ?? "",
    };
    if (!config.model || !config.key)
      return reply({ error: "Live AI is not configured" }, 503);
    const budget = await adminRequest(
      "/rest/v1/rpc/consume_mentor_budget",
      "POST",
      { p_user: user.id },
    );
    if (!budget.ok) return reply({ error: "Mentor budget unavailable" }, 503);
    if ((await budget.json()) !== true)
      return reply({ error: "Mentor request budget reached. Try later." }, 429);
    try { return reply(await generate(input, config)); }
    catch {
      const key = Deno.env.get("GROQ_FALLBACK_KEY") ?? "";
      const model = Deno.env.get("GROQ_FALLBACK_MODEL") ?? "";
      if (config.provider !== "gemini" || !key || !model) throw new Error("Provider unavailable");
      // Charge the same global and user budgets for the one permitted fallback call.
      const fallbackBudget = await adminRequest("/rest/v1/rpc/consume_mentor_budget", "POST", { p_user: user.id });
      if (!fallbackBudget.ok || (await fallbackBudget.json()) !== true) return reply({error:"Mentor request budget reached. Try later."},429);
      return reply(await generate(input,{provider:"groq",key,model}));
    }
  } catch {
    return reply(
      {
        error: "Live AI is unavailable. Use the authored guide and try later.",
      },
      503,
    );
  }
});
