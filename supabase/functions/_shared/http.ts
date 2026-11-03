export function cors(req: Request) {
  const allowed = (
    Deno.env.get("ALLOWED_ORIGINS") ?? "https://shadabur-rahaman.github.io"
  ).split(",");
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin)
      ? origin
      : allowed[0],
    Vary: "Origin",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
export async function readBody(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("Missing body");
  let size = 0,
    text = "";
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 12000) {
      await reader.cancel();
      throw new Error("Input too large");
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return JSON.parse(text);
}
export async function verifiedUser(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const response = await fetch(Deno.env.get("SUPABASE_URL") + "/auth/v1/user", {
    headers: {
      Authorization: authorization,
      apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return null;
  const user = await response.json();
  return typeof user.id === "string" ? user : null;
}
export async function adminRequest(
  path: string,
  method: string,
  body?: unknown,
) {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return fetch(Deno.env.get("SUPABASE_URL") + path, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
}
