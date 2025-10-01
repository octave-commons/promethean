import { promises as fs } from "fs";
import path from "path";

export async function readText(p: string): Promise<string> {
  return fs.readFile(p, "utf-8");
}

export async function writeText(p: string, s: string): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, "utf-8");
}

export async function readMaybe(p: string): Promise<string | undefined> {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}
