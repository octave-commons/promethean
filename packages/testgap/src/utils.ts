import { promises as fs } from "fs";
import * as path from "path";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

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

export async function ollamaJSON(model: string, prompt: string) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0 },
      format: "json",
    }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const data: any = await res.json();
  const raw =
    typeof data.response === "string"
      ? data.response
      : JSON.stringify(data.response);
  return JSON.parse(
    raw
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .trim(),
  );
}
