import { promises as fs } from "fs";
import path from "path";

export async function readJSON<T>(
  p: string,
  fallback?: T,
): Promise<T | undefined> {
  try {
    return JSON.parse(await fs.readFile(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON(p: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}
