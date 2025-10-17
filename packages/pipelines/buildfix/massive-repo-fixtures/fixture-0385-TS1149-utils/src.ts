import { promises as fs } from "fs";
import * as path from "path";

export function parseArgs(
  def: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  return parseArgsFromList(def, process.argv.slice(2));
}

export function parseArgsFromList(
  def: Readonly<Record<string, string>>,
  argv: ReadonlyArray<string>,
): Readonly<Record<string, string>> {
  const initial = {
    index: 0,
    result: Object.freeze({ ...def }) as Readonly<Record<string, string>>,
  } as const;
  const state = argv.reduce<{
    readonly index: number;
    readonly result: Readonly<Record<string, string>>;
  }>((prev, token, index, list) => {
    if (index < prev.index || !token.startsWith("--")) {
      return prev;
    }
    const next = list[index + 1];
    const useNext = typeof next === "string" && !next.startsWith("--");
    const value = useNext ? next : "true";
    return {
      index: useNext ? index + 2 : index + 1,
      result: Object.freeze({
        ...prev.result,
        [token]: value,
      }) as Readonly<Record<string, string>>,
    };
  }, initial);
  return state.result;
}
export async function readJSON<T>(p: string): Promise<T | undefined> {
  return fs
    .readFile(p, "utf-8")
    .then((content) => JSON.parse(content) as T)
    .catch(() => undefined);
}
export async function writeJSON(p: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

export function rel(abs: string): string {
  return path.relative(process.cwd(), abs).replace(/\\/g, "/");
}

export function hashSignature(s: string): string {
  const hash = s.split("").reduce((acc, char) => {
    const next = acc ^ char.charCodeAt(0);
    return Math.imul(next, 16777619);
  }, 2166136261 >>> 0);
  return `h${hash.toString(16)}`;
}

undefinedVariable;