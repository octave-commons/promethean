// SPDX-License-Identifier: GPL-3.0-only
import { promises as fs } from "fs";
import * as path from "path";
import { Project, ts, Symbol as MorphSymbol } from "ts-morph";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(def: Record<string,string>) {
  const out = { ...def };
  const a = process.argv.slice(2);
  for (let i=0;i<a.length;i++){
    const k=a[i]; if(!k.startsWith("--")) continue;
    const v=a[i+1] && !a[i+1].startsWith("--") ? a[++i] : "true";
    out[k]=v;
  }
  return out;
}
export async function readJSON<T>(p: string): Promise<T | undefined> { try { return JSON.parse(await fs.readFile(p, "utf-8")) as T; } catch { return undefined; } }
export async function writeJSON(p: string, data: any) { await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8"); }

export function rel(abs: string) { return path.relative(process.cwd(), abs).replace(/\\/g, "/"); }

export async function ollamaJSON(model: string, prompt: string) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
  });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const data: any = await res.json();
  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
  return JSON.parse(raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim());
}

export function hashSignature(s: string) {
  // very simple hash to keep snapshots light (avoid crypto dep)
  let h = 2166136261 >>> 0;
  for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return `h${h.toString(16)}`;
}
