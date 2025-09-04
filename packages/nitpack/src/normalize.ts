export type Args = Readonly<Record<string, string>>;

export const normalizeArgs = (a: readonly string[]): Args => {
  const out: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    const tok = a[i]!;
    if (!tok.startsWith("--")) continue;
    const [rawKey, inlineVal] = tok.split("=", 2) as [string, string?];
    const key = rawKey.replace(/^--/, "");
    if (inlineVal !== undefined) {
      out[key] = inlineVal;
      continue;
    }
    const next = a[i + 1];
    if (next && !next.startsWith("--")) {
      out[key] = next;
      i++;
    } else {
      out[key] = "true";
    }
  }
  return Object.freeze(out) as Args;
};
