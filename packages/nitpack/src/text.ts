const stripCodeFences = (s: string): string =>
  s.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]*`/g, " ");

const stripPaths = (s: string): string =>
  s.replace(/\b\S+\.(ts|tsx|js|jsx|json|yaml|yml)(:\d+)?\b/g, " ");

const clean = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeComments = (
  bodies: readonly string[],
): readonly string[] =>
  bodies.map((x) => clean(stripPaths(stripCodeFences(x)))).filter(Boolean);
