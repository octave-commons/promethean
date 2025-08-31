import { promises as fs } from "fs";
import * as path from "path";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(def: Record<string,string>) {
  const out = { ...def }; const a = process.argv.slice(2);
  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
    const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
  return out;
}

export async function readMaybe(p: string) { try { return await fs.readFile(p, "utf-8"); } catch { return undefined; } }
export async function writeJSON(p: string, data: any) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8"); }
export async function writeText(p: string, s: string) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, s, "utf-8"); }

export function slug(s: string) { return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }

export async function ollamaJSON(model: string, prompt: string): Promise<any> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
  });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const data: unknown = await res.json();
  const response = (data as any)?.response;
  const raw = typeof response === "string" ? response : JSON.stringify(response);
  return JSON.parse(String(raw).replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
}
