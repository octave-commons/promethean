import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import * as yaml from "yaml";
import { parseArgs } from "./utils.js";
import type { DocMap, ScanResult, SymbolInfo } from "./types.js";

const args = parseArgs({
  "--scan": ".cache/symdocs/symbols.json",
  "--docs": ".cache/symdocs/docs.json",
  "--out": "docs/packages",
  "--granularity": "module" // "module" | "symbol"
});

const OUT_ROOT = path.resolve(args["--out"]);
const GRANULARITY = args["--granularity"] as "module" | "symbol";

type GroupKey = string; // pkg|moduleRel

function fm(obj: any) {
  return yaml.stringify(obj, { indent: 2, simpleKeys: true });
}

function startMark() { return "<!-- SYMDOCS:BEGIN -->"; }
function endMark() { return "<!-- SYMDOCS:END -->"; }

async function main() {
  const scan: ScanResult = JSON.parse(await fs.readFile(path.resolve(args["--scan"]), "utf-8"));
  const docs: DocMap = JSON.parse(await fs.readFile(path.resolve(args["--docs"]), "utf-8"));

  if (GRANULARITY === "symbol") {
    await writeOnePerSymbol(scan.symbols, docs);
  } else {
    await writeOnePerModule(scan.symbols, docs);
  }
  console.log("Write complete.");
}

async function writeOnePerModule(symbols: SymbolInfo[], docs: DocMap) {
  // group by module
  const groups = new Map<GroupKey, SymbolInfo[]>();
  for (const s of symbols) {
    const key = `${s.pkg}|${s.moduleRel}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(s);
  }

  for (const [key, syms] of groups) {
    const [pkg, moduleRel] = key.split("|");
    const outPath = path.join(OUT_ROOT, pkg, moduleRel.replace(/\.(ts|tsx|js|jsx)$/i, ".md"));
    await fs.mkdir(path.dirname(outPath), { recursive: true });

    const fmHeader = {
      package: pkg,
      module: moduleRel,
      generated_at: new Date().toISOString()
    };

    // existing content (preserve anything above marker)
    const existing = await readMaybe(outPath);
    const gm = existing ? matter(existing) : { content: "", data: {} };
    const preserved = stripBetween(gm.content, startMark(), endMark());

    const sections = syms.map((s) => renderSymbolSection(s, docs[s.id])).join("\n\n");

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
      ""
    ].join("\n");

    const final = matter.stringify(body, { ...gm.data, ...fmHeader }, { language: "yaml" });
    await fs.writeFile(outPath, final, "utf-8");
  }
}

async function writeOnePerSymbol(symbols: SymbolInfo[], docs: DocMap) {
  for (const s of symbols) {
    const outPath = path.join(
      OUT_ROOT,
      s.pkg,
      s.moduleRel.replace(/\.(ts|tsx|js|jsx)$/i, ""),
      "__symbols",
      `${s.name}-${s.kind}.md`
    );
    await fs.mkdir(path.dirname(outPath), { recursive: true });

    const fmHeader = {
      package: s.pkg,
      module: s.moduleRel,
      symbol: s.name,
      kind: s.kind,
      exported: s.exported,
      generated_at: new Date().toISOString()
    };

    const section = renderSymbolSection(s, docs[s.id]);
    const final = matter.stringify(section + "\n", fmHeader, { language: "yaml" });
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
    pitfalls?.length ? `\n**Pitfalls:**\n${pitfalls.map((p) => `- ${p}`).join("\n")}\n` : "",
    tags?.length ? `**Tags:** ${tags.join(", ")}` : "",
    mermaid ? `\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n` : "",
    "<details><summary>Source</summary>\n\n```" + s.lang + `\n${s.snippet.trim()}\n\`\`\`\n\n</details>`
  ].filter(Boolean);

  return lines.join("\n");
}

function ensureCodeFence(block: string, lang: string) {
  const trimmed = block.trim();
  if (/^```/.test(trimmed)) return trimmed;
  return `\`\`\`${lang}\n${trimmed}\n\`\`\``;
}

function slug(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function readMaybe(p: string) {
  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
}

function stripBetween(text: string, start: string, end: string) {
  const si = text.indexOf(start);
  const ei = text.indexOf(end);
  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
  return text.trimEnd();
}

main().catch((e) => { console.error(e); process.exit(1); });
