import { promises as fs } from "fs";
import * as path from "path";
export { sha1 } from "@promethean/utils";

export function parseArgs(
  defaults: Readonly<Record<string, string>>,
): Record<string, string> {
  return process.argv.slice(2).reduce<Record<string, string>>(
    (out, cur, idx, arr) => {
      if (!cur.startsWith("--")) return out;
      const next = arr[idx + 1];
      const val = next && !next.startsWith("--") ? next : "true";
      return { ...out, [cur]: val };
    },
    { ...defaults },
  );
}

export async function writeJSON(p: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

export async function readJSON<T>(p: string): Promise<T | undefined> {
  try {
    return JSON.parse(await fs.readFile(p, "utf-8")) as T;
  } catch {
    return undefined;
  }
}

export const SONAR_URL = process.env.SONAR_HOST_URL ?? "http://localhost:9000";
export const SONAR_TOKEN = process.env.SONAR_TOKEN ?? "";

export function authHeader(): Record<string, string> {
  if (!SONAR_TOKEN) throw new Error("SONAR_TOKEN env is required");
  const b = Buffer.from(`${SONAR_TOKEN}:`).toString("base64");
  return { Authorization: `Basic ${b}` };
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
