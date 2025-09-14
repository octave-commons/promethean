import * as path from "path";
export { readJSON, writeJSON } from "@promethean/utils";

export function parseArgs(def: Record<string, string>) {
  const out = { ...def };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i]!;
    if (!k.startsWith("--")) continue;
    const next = a[i + 1];
    const useNext = !!next && !next.startsWith("--");
    const v = useNext ? next : "true";
    if (useNext) i++;
    out[k] = v;
  }
  return out as Record<string, string>;
}

export function rel(abs: string) {
  return path.relative(process.cwd(), abs).replace(/\\/g, "/");
}

export function hashSignature(s: string) {
  // very simple hash to keep snapshots light (avoid crypto dep)
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `h${h.toString(16)}`;
}
