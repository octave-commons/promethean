import { promises as fs } from "fs";
import * as path from "path";

import type { ReadonlyDeep } from "type-fest";

export { sha1 } from "@promethean/utils";

export function parseArgs(
  defaults: Readonly<Record<string, string>>,
  argv: ReadonlyArray<string> = process.argv,
): ReadonlyDeep<Record<string, string>> {
  const parsed = argv.slice(2).reduce<Record<string, string>>(
    (out, cur, idx, arr) => {
      if (!cur.startsWith("--")) return out;
      const next = arr[idx + 1];
      const val = next && !next.startsWith("--") ? next : "true";
      return { ...out, [cur]: val };
    },
    { ...defaults },
  );
  return Object.freeze(parsed) as ReadonlyDeep<Record<string, string>>;
}

export async function writeJSON(
  p: string,
  data: ReadonlyDeep<unknown>,
): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

export async function readJSON<T>(
  p: string,
): Promise<ReadonlyDeep<T> | undefined> {
  return fs
    .readFile(p, "utf-8")
    .then((contents) => JSON.parse(contents) as T)
    .then((parsed) => Object.freeze(parsed) as ReadonlyDeep<T>)
    .catch(() => undefined);
}

export const SONAR_URL = process.env.SONAR_HOST_URL ?? "http://localhost:9000";
export const SONAR_TOKEN = process.env.SONAR_TOKEN ?? "";

export function authHeader(
  token = SONAR_TOKEN,
): ReadonlyDeep<Record<string, string>> {
  if (!token) throw new Error("SONAR_TOKEN env is required");
  const b = Buffer.from(`${token}:`).toString("base64");
  return Object.freeze({ Authorization: `Basic ${b}` }) as ReadonlyDeep<
    Record<string, string>
  >;
}

export function severityToPriority(
  s: string,
): "P0" | "P1" | "P2" | "P3" | "P4" {
  switch (s) {
    case "BLOCKER":
      return "P0";
    case "CRITICAL":
      return "P1";
    case "MAJOR":
      return "P2";
    case "MINOR":
      return "P3";
    default:
      return "P4";
  }
}

export function pathPrefix(file: string, depth = 2): string {
  const parts = file.split("/");
  return parts.slice(0, Math.min(parts.length, depth)).join("/");
}
