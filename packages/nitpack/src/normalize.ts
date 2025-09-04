export type Args = Readonly<Record<string, string>>;

const parsePair = (s: string): [string, string] | null =>
  s.startsWith("--") ? [s, "true"] : null;

export const normalizeArgs = (a: readonly string[]): Args => {
  const out: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    const k = a[i]!;
    if (!k.startsWith("--")) continue;
    const n = a[i + 1];
    const v = n && !n.startsWith("--") ? a[++i]! : "true";
    out[k.replace(/^--/, "")] = v;
  }
  return out;
};
