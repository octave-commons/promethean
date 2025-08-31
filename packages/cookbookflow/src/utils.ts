import { promises as fs } from "fs";
import * as path from "path";
import { exec as _exec } from "child_process";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(def: Record<string, string>) {
  const out = { ...def }; const a = process.argv.slice(2);
  for (let i=0;i<a.length;i++){ const k=a[i]; if(!k.startsWith("--")) continue;
    const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true"; out[k]=v; }
  return out;
}
export async function readMaybe(p: string) { try { return await fs.readFile(p, "utf-8"); } catch { return undefined; } }
export async function writeJSON(p: string, data: any) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8"); }
export async function writeText(p: string, s: string) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, s, "utf-8"); }

export function slug(s: string) { return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
export function sha1(s: string) { let h=2166136261>>>0; for (let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return "h"+h.toString(16); }
export function uuid() { // Node 18+
  // @ts-ignore
  return globalThis.crypto?.randomUUID?.() ?? (require("crypto").randomUUID());
}

export async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, prompt: text }) });
  if (!res.ok) throw new Error(`ollama embeddings ${res.status}`);
  const data: unknown = await res.json();
  const embedding = (data as any)?.embedding;
  if (!Array.isArray(embedding)) throw new Error("invalid embeddings response");
  return embedding as number[];
}
export async function ollamaJSON(model: string, prompt: string): Promise<any> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, { method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ model, prompt, stream:false, options:{ temperature:0 }, format:"json" }) });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const data: unknown = await res.json();
  const response = (data as any)?.response;
  const raw = typeof response === "string" ? response : JSON.stringify(response);
  return JSON.parse(String(raw).replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
}
export function cosine(a: number[], b: number[]) { let dot=0, na=0, nb=0, n=Math.min(a.length,b.length); for (let i=0;i<n;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; } return !na||!nb?0:dot/(Math.sqrt(na)*Math.sqrt(nb)); }

export async function execShell(cmd: string, cwd: string) {
  return new Promise<{ code: number|null; stdout: string; stderr: string }>((resolve) => {
    const child = _exec(cmd, { cwd, maxBuffer: 1024*1024*64, env: { ...process.env } }, (err, stdout, stderr) => {
      resolve({ code: err ? (err as any).code ?? 1 : 0, stdout: String(stdout), stderr: String(stderr) });
    });
    child.on("error", () => resolve({ code: 127, stdout: "", stderr: "spawn error" }));
  });
}
