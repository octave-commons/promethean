import { promises as fs } from "fs";
import * as path from "path";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export async function writeJSON<T>(p: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

export async function readJSON<T>(p: string): Promise<T> {
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw) as T;
}

export async function readMaybe(p: string): Promise<string | undefined> {
  return fs.readFile(p, "utf-8").catch(() => undefined);
}

export async function ollamaJSON(
  model: string,
  prompt: string,
  fetchFn: typeof fetch = fetch,
): Promise<unknown> {
  const res = await fetchFn(`${OLLAMA_URL}/api/generate`, {
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
  const data: unknown = await res.json();
  if (typeof data !== "object" || data === null || !("response" in data)) {
    throw new Error("ollama invalid response");
  }

  const response = (data as { response: unknown }).response;
  const raw =
    typeof response === "string" ? response : JSON.stringify(response);

  const normalized = raw
    .replace(/```json\s*/g, "")
    .replace(/```\s*$/g, "")
    .trim();

  return JSON.parse(normalized) as unknown;
}
export function rel(p: string): string {
  return p.replace(process.cwd().replace(/\\/g, "/") + "/", "");
}
