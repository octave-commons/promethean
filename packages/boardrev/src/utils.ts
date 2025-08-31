import { promises as fs } from "fs";
import * as path from "path";
import { globby } from "globby";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(defaults: Record<string,string>) {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i=0;i<a.length;i++){
    const k=a[i]; if(!k.startsWith("--")) continue;
    const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true";
    out[k]=v;
  }
  return out;
}

export async function listTaskFiles(dir: string) {
  return globby([`${dir.replace(/\\/g,"/")}/**/*.md`, "!**/README.md"]);
}

export async function readText(p: string) { return fs.readFile(p, "utf-8"); }
export async function writeText(p: string, s: string) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, s, "utf-8"); }
export async function readMaybe(p: string) { try { return await fs.readFile(p, "utf-8"); } catch { return undefined; } }

export function slug(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}

export function normStatus(s: string) {
  const t = (s||"").toLowerCase();
  if (/backlog/.test(t)) return "backlog";
  if (/todo|to[-\s]?do/.test(t)) return "todo";
  if (/doing|in[-\s]?progress/.test(t)) return "doing";
  if (/review|pr|code[-\s]?review/.test(t)) return "review";
  if (/block/.test(t)) return "blocked";
  if (/done|complete/.test(t)) return "done";
  return "todo";
}

export function relFromRepo(abs: string) { return path.relative(process.cwd(), abs).replace(/\\/g, "/"); }

export async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text })
  });
  if (!res.ok) throw new Error(`ollama embeddings ${res.status}`);
  const data: any = await res.json();
  return data.embedding as number[];
}

export async function ollamaJSON(model: string, prompt: string): Promise<any> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
  });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const data: any = await res.json();
  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
  return JSON.parse(raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
}

export function cosine(a: number[], b: number[]) {
  let dot=0, na=0, nb=0, n=Math.min(a.length,b.length);
  for (let i=0;i<n;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
  return !na||!nb ? 0 : dot/(Math.sqrt(na)*Math.sqrt(nb));
}
