import { promises as fs } from "fs";
import * as path from "path";

export async function writeJSON(p: string, data: any) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}
export async function readJSON<T>(p: string): Promise<T> {
  return JSON.parse(await fs.readFile(p, "utf-8"));
}
export async function readMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}
export function rel(p: string) {
  return p.replace(process.cwd().replace(/\\/g, "/") + "/", "");
}
