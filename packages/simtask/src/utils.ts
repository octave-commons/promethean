import { promises as fs } from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as ts from "typescript";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

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

export async function listFilesRec(root: string, exts: Set<string>) {
  const out: string[] = [];
  async function walk(d: string) {
    const ents = await fs.readdir(d, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (["node_modules", "dist", "build", "coverage", ".turbo", ".next"].includes(e.name)) continue;
        await walk(p);
      } else if (exts.has(path.extname(p).toLowerCase())) out.push(p);
    }
  }
  await walk(root);
  return out;
}

export function sha1(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

export function relFromRepo(abs: string) {
  return path.relative(process.cwd(), abs).replace(/\\/g, "/");
}

export function makeProgram(rootFiles: string[], tsconfigPath?: string) {
  let options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    strict: true
  };
  if (tsconfigPath) {
    const cfg = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, path.dirname(tsconfigPath));
    options = { ...parsed.options, ...options };
  }
  return ts.createProgram(rootFiles, options);
}

export function posToLine(sf: ts.SourceFile, pos: number) {
  return sf.getLineAndCharacterOfPosition(pos).line + 1;
}

export function getJsDocText(node: ts.Node): string | undefined {
  const jsdocs = ts.getJSDocCommentsAndTags(node);
  if (!jsdocs?.length) return undefined;
  const texts: string[] = [];
  for (const d of jsdocs) {
    // @ts-ignore
    const c = (d as any).comment;
    if (typeof c === "string") texts.push(c);
  }
  return texts.join("\n\n").trim() || undefined;
}

export function getNodeText(src: string, node: ts.Node): string {
  return src.slice(node.getFullStart(), node.getEnd());
}

export function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
