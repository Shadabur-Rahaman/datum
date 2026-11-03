function compact(value: unknown, limit: number, depth = 0): unknown {
  if (typeof value === "string") return value.slice(0, limit);
  if (value === null || typeof value === "number" || typeof value === "boolean")
    return value;
  if (depth >= 3) return "Additional context omitted";
  if (Array.isArray(value))
    return value.slice(0, 5).map((v) => compact(v, limit, depth + 1));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 10)
        .map(([k, v]) => [k.slice(0, 80), compact(v, limit, depth + 1)]),
    );
  return null;
}
export function selectMentorContext(
  context: unknown,
  turns: { question: string; hint: string }[],
  hintLevel: number,
) {
  let current = compact(context, 650);
  for (const limit of [300, 100, 30])
    if (JSON.stringify(current).length > 3000)
      current = compact(context, limit);
  if (JSON.stringify(current).length > 3000)
    current = { excerpt: JSON.stringify(current).slice(0, 1000) };
  return {
    current,
    recent: turns
      .slice(-2)
      .map((t) => ({
        question: t.question.slice(0, 100),
        hint: t.hint.slice(0, 200),
      })),
    hintLevel,
  };
}
