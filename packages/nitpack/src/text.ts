const stripCodeFences = (s: string): string =>
  s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ");

const stripPaths = (s: string): string =>
  s.replace(
    /(?:[A-Za-z]:\\|\.{1,2}\/|\/)?[\w./\\-]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|ya?ml)(?::\d+)?(?=[\s),.;:!?]|$)/g,
    " ",
  );

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
