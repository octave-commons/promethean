/* eslint-disable */
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import matter from "gray-matter";

import { openLevelCache, type Cache } from "@promethean-os/level-cache";
import { parseArgs } from "./utils.js";
import type { DocMap, DocDraft, SymbolInfo } from "./types.js";

export type WriteOptions = {
  cache?: string;
  out?: string;
  granularity?: "module" | "symbol";
};

type GroupKey = string; // pkg|moduleRel

function startMark() {
  return "<!-- SYMDOCS:BEGIN -->";
}
function endMark() {
  return "<!-- SYMDOCS:END -->";
}

export async function runWrite(opts: WriteOptions = {}) {
  const OUT_ROOT = path.resolve(opts.out ?? "docs/packages");
  const GRANULARITY = opts.granularity ?? "module";
  const cachePath = path.resolve(opts.cache ?? ".cache/symdocs.level");

  const db = await openLevelCache({ path: cachePath });
  const symCache = db.withNamespace("symbols") as Cache<SymbolInfo>;
  const docCache = db.withNamespace("docs") as Cache<DocDraft>;

  const symbols: SymbolInfo[] = [];
  for await (const [, sym] of symCache.entries()) symbols.push(sym);

  const docs: DocMap = Object.create(null);
  for await (const [id, draft] of docCache.entries()) {
    docs[id] = draft as any;
  }

  if (GRANULARITY === "symbol") {
    await writeOnePerSymbol(OUT_ROOT, symbols, docs);
  } else {
    await writeOnePerModule(OUT_ROOT, symbols, docs);
  }
  await db.close();
  console.log("Write complete.");
}

async function writeOnePerModule(
  OUT_ROOT: string,
  symbols: SymbolInfo[],
  docs: DocMap,
) {
  // group by module
  const groups = new Map<GroupKey, SymbolInfo[]>();
  for (const s of symbols) {
    const key = `${s.pkg}|${s.moduleRel}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(s);
  }

  for (const [key, syms] of groups) {
    const [pkgRaw, moduleRelRaw] = key.split("|");
    const pkg = pkgRaw ?? "";
    const moduleRel = moduleRelRaw ?? "";
    const outPath = path.join(
      OUT_ROOT,
      pkg,
      moduleRel.replace(/\.(ts|tsx|js|jsx)$/i, ".md"),
    );
    await fs.mkdir(path.dirname(outPath), { recursive: true });

    const fmHeader = {
      package: pkg,
      module: moduleRel,
      generated_at: new Date().toISOString(),
    };

    // existing content (preserve anything above marker)
    const existing = await readMaybe(outPath);
    const gm = existing ? matter(existing) : { content: "", data: {} };
    const preserved = stripBetween(gm.content, startMark(), endMark());

    const sections = syms
      .map((s) => renderSymbolSection(s, docs[s.id]))
      .join("\n\n");

    const body = [
      preserved.trimEnd(),
      "",
      startMark(),
      `# ${pkg}/${moduleRel}`,
      "",
      "## Symbols",
      "",
      ...syms.map((s) => `- [${s.name}](#${slug(s.name)}-${s.kind})`),
      "",
      sections,
      endMark(),
      "",
    ].join("\n");

    const final = matter.stringify(
      body,
      { ...gm.data, ...fmHeader },
      { language: "yaml" },
    );
    await fs.writeFile(outPath, final, "utf-8");
  }
}

async function writeOnePerSymbol(
  OUT_ROOT: string,
  symbols: SymbolInfo[],
  docs: DocMap,
) {
  for (const s of symbols) {
    const outPath = path.join(
      OUT_ROOT,
      s.pkg,
      s.moduleRel.replace(/\.(ts|tsx|js|jsx)$/i, ""),
      "__symbols",
      `${s.name}-${s.kind}.md`,
    );
    await fs.mkdir(path.dirname(outPath), { recursive: true });

    const fmHeader = {
      package: s.pkg,
      module: s.moduleRel,
      symbol: s.name,
      kind: s.kind,
      exported: s.exported,
      generated_at: new Date().toISOString(),
    };

    const section = renderSymbolSection(s, docs[s.id]);
    const final = matter.stringify(section + "\n", fmHeader, {
      language: "yaml",
    });
    await fs.writeFile(outPath, final, "utf-8");
  }
}

function renderSymbolSection(s: SymbolInfo, d?: any): string {
  const title = d?.title ?? `${s.name} (${s.kind})`;
  const summary = d?.summary ?? (s.signature || "");
  const usage = d?.usage ? ensureCodeFence(d.usage, s.lang) : undefined;
  const details = d?.details;
  const pitfalls = d?.pitfalls as string[] | undefined;
  const tags = (d?.tags as string[] | undefined)?.slice(0, 10);
  const mermaid = d?.mermaid;

  const lines: string[] = [
    `### ${title} {: #${slug(s.name)}-${s.kind}}`,
    "",
    summary ? `> ${summary}` : "",
    s.signature ? `\n**Signature:** \`${s.signature}\`\n` : "",
    usage ? `${usage}\n` : "",
    details ?? "",
    pitfalls?.length
      ? `\n**Pitfalls:**\n${pitfalls.map((p) => `- ${p}`).join("\n")}\n`
      : "",
    tags?.length ? `**Tags:** ${tags.join(", ")}` : "",
    mermaid ? `\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n` : "",
    "<details><summary>Source</summary>\n\n```" +
      s.lang +
      `\n${s.snippet.trim()}\n\`\`\`\n\n</details>`,
  ].filter(Boolean);

  return lines.join("\n");
}

function ensureCodeFence(block: string, lang: string) {
  const trimmed = block.trim();
  if (/^```/.test(trimmed)) return trimmed;
  return `\`\`\`${lang}\n${trimmed}\n\`\`\``;
}

function slug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}

function stripBetween(text: string, start: string, end: string) {
  const si = text.indexOf(start);
  const ei = text.indexOf(end);
  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
  return text.trimEnd();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    "--cache": ".cache/symdocs.level",
    "--out": "docs/packages",
    "--granularity": "module",
  });
  runWrite({
    cache: String(args["--cache"]),
    out: String(args["--out"]),
    granularity: String(args["--granularity"]) as "module" | "symbol",
  }).catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
}
