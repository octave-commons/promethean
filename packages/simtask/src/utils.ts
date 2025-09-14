import { promises as fs } from "fs";
import * as path from "path";
export { sha1 } from "@promethean/utils";

import * as ts from "typescript";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(defaults: Record<string, string>) {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (typeof k !== "string" || !k.startsWith("--")) continue;
    const next = a[i + 1];
    let v: string;
    if (typeof next === "string" && !next.startsWith("--")) {
      v = next;
      i++;
    } else {
      v = "true";
    }
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
        if (
          [
            "node_modules",
            "dist",
            "build",
            "coverage",
            ".turbo",
            ".next",
          ].includes(e.name)
        )
          continue;
        await walk(p);
      } else if (exts.has(path.extname(p).toLowerCase())) out.push(p);
    }
  }
  await walk(root);
  return out;
}

export function relFromRepo(abs: string) {
  return path.relative(process.cwd(), abs).replace(/\\/g, "/");
}

export function makeProgram(rootFiles: string[], tsconfigPath?: string) {
  let options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    strict: true,
  };
  if (tsconfigPath) {
    const cfg = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
      cfg.config,
      ts.sys,
      path.dirname(tsconfigPath),
    );
    options = { ...parsed.options, ...options };
  }
  return ts.createProgram(rootFiles, options);
}

export function posToLine(sf: ts.SourceFile, pos: number) {
  return sf.getLineAndCharacterOfPosition(pos).line + 1;
}

export function getJsDocText(node: ts.Node): string | undefined {
  const jsdocs = ts.getJSDocCommentsAndTags(node) ?? [];
  if (jsdocs.length === 0) return undefined;
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
  let dot = 0,
    na = 0,
    nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const av = a[i]!;
    const bv = b[i]!;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
