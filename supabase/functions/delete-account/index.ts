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
    const body = await readBody(req);
    if (
      body?.confirmation !== "DELETE MY ACCOUNT" ||
      Object.keys(body).length !== 1
    )
      return reply({ error: "Explicit confirmation required" }, 400);
    // Identity comes only from Auth, never a caller-supplied owner ID.
    const result = await adminRequest(
      "/auth/v1/admin/users/" + encodeURIComponent(user.id),
      "DELETE",
    );
    if (!result.ok)
      return reply({ error: "Account deletion failed; retry later" }, 503);
    return reply({ deleted: true });
  } catch {
    return reply({ error: "Account deletion unavailable" }, 503);
  }
});
