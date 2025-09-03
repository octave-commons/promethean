// SPDX-License-Identifier: GPL-3.0-only
import { promises as fs } from "fs";
import * as path from "path";
import * as crypto from "crypto";

export function parseArgs(defaults: Record<string, string>) {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!k.startsWith("--")) continue;
    const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
    out[k] = v;
  }
  return out;
}

export function sha1(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

export async function writeJSON(p: string, data: any) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}
export async function readJSON<T>(p: string): Promise<T | undefined> {
  try { return JSON.parse(await fs.readFile(p, "utf-8")); } catch { return undefined; }
}

export const SONAR_URL = process.env.SONAR_HOST_URL ?? "http://localhost:9000";
export const SONAR_TOKEN = process.env.SONAR_TOKEN ?? "";
export function authHeader() {
  if (!SONAR_TOKEN) throw new Error("SONAR_TOKEN env is required");
  const b = Buffer.from(`${SONAR_TOKEN}:`).toString("base64");
  return { Authorization: `Basic ${b}` };
}

export function severityToPriority(s: string): "P0"|"P1"|"P2"|"P3"|"P4" {
  switch (s) {
    case "BLOCKER": return "P0";
    case "CRITICAL": return "P1";
    case "MAJOR": return "P2";
    case "MINOR": return "P3";
    default: return "P4";
  }
}

export function pathPrefix(file: string, depth = 2) {
  const parts = file.split("/");
  return parts.slice(0, Math.min(parts.length, depth)).join("/");
}
