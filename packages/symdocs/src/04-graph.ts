/* eslint-disable */
import { promises as fs } from "fs";
import * as path from "path";

import { listFilesRec } from "@promethean/utils";
import { openLevelCache } from "@promethean/level-cache";
import type { SymbolInfo } from "./types.js";

type Pkg = {
  name: string; // npm name, e.g. @promethean/foo
  folder: string; // folder under packages/, e.g. foo  OR apps/web
  dir: string; // absolute dir
  manifest: any; // package.json
  declaredDeps: Set<string>; // internal deps declared in package.json
  importDeps: Set<string>; // internal deps referenced in source imports
  domain: string; // computed domain (e.g., "apps" for apps/web; "_root" for top-level)
};

const args = parseArgs({
  "--root": "packages",
  "--out": "docs/packages",
  "--ext": ".ts,.tsx,.js,.jsx",
  "--include-imports": "true", // analyze imports in source files
  "--respect-manifest": "true", // include package.json deps as edges
  "--render-domain-graphs": "true",
  "--domain-depth": "1", // how many path segments under packages/ define a domain
  "--rdeps-table": "true",
  "--max-rdeps-list": "12", // show up to N dependents in the table cells
  "--cache": ".cache/symdocs.level",
});

const ROOT = path.resolve(String(args["--root"]));
const OUT_ROOT = path.resolve(String(args["--out"]));
const EXTS = new Set(
  String(args["--ext"])
    .split(",")
    .map((s) => s.trim().toLowerCase()),
);
const INCLUDE_IMPORTS = String(args["--include-imports"]) === "true";
const RESPECT_MANIFEST = String(args["--respect-manifest"]) === "true";
const RENDER_DOMAIN_GRAPHS = String(args["--render-domain-graphs"]) === "true";
const DOMAIN_DEPTH = Math.max(
  1,
  parseInt(String(args["--domain-depth"]), 10) || 1,
);
const RDEPS_TABLE = String(args["--rdeps-table"]) === "true";
const MAX_RDEPS_LIST = Math.max(
  0,
  parseInt(String(args["--max-rdeps-list"]), 10) || 0,
);
const CACHE_PATH = path.resolve(String(args["--cache"]));

const GLOBAL_START = "<!-- SYMPKG:BEGIN -->";
const GLOBAL_END = "<!-- SYMPKG:END -->";
const PKG_START = "<!-- SYMPKG:PKG:BEGIN -->";
const PKG_END = "<!-- SYMPKG:PKG:END -->";

async function main() {
  const symDb = await openLevelCache<SymbolInfo>({
    path: CACHE_PATH,
    namespace: "symbols",
  });
  const symbolPkgs = new Set<string>();
  for await (const [, sym] of symDb.entries()) symbolPkgs.add(sym.pkg);
  await symDb.close();

  const pkgs = (await findWorkspacePackages(ROOT, DOMAIN_DEPTH)).filter((p) =>
    symbolPkgs.has(p.folder.replace(/\\/g, "/")),
  );
  if (pkgs.length === 0) {
    console.log("No packages found under", ROOT);
    return;
  }

  // Map npm name -> Pkg
  const byName = new Map<string, Pkg>(pkgs.map((p) => [p.name, p]));
  const internalNames = new Set(pkgs.map((p) => p.name));

  // import analysis
  if (INCLUDE_IMPORTS) {
    await Promise.all(
      pkgs.map(async (p) => {
        const files = await listFilesRec(p.dir, EXTS);
        const specs = new Set<string>();
        for (const f of files) {
          const src = await fs.readFile(f, "utf-8");
          for (const spec of extractImportSpecifiers(src)) {
            const top = topLevelPackageName(spec);
            if (top && internalNames.has(top) && top !== p.name) specs.add(top);
          }
        }
        p.importDeps = specs;
      }),
    );
  }

  // Build edges
  type Edge = { from: string; to: string; kind: "manifest" | "import" };
  const edges: Edge[] = [];

  for (const p of pkgs) {
    if (RESPECT_MANIFEST) {
      for (const to of p.declaredDeps) {
        if (internalNames.has(to) && to !== p.name)
          edges.push({ from: p.name, to, kind: "manifest" });
      }
    }
    if (INCLUDE_IMPORTS) {
      for (const to of p.importDeps) {
        if (internalNames.has(to) && to !== p.name)
          edges.push({ from: p.name, to, kind: "import" });
      }
    }
  }

  // Deduplicate edges preferring 'manifest' over 'import'
  const uniq = new Map<string, Edge>();
  for (const e of edges) {
    const k = `${e.from}::${e.to}`;
    const prev = uniq.get(k);
    if (!prev) uniq.set(k, e);
    else if (prev.kind !== "manifest" && e.kind === "manifest") uniq.set(k, e);
  }
  const edgeList = Array.from(uniq.values());

  // Compute deps/dependees
  const deps = new Map<string, Set<string>>();
  const rdeps = new Map<string, Set<string>>();
  for (const p of pkgs) {
    deps.set(p.name, new Set());
    rdeps.set(p.name, new Set());
  }
  for (const { from, to } of edgeList) {
    deps.get(from)!.add(to);
    rdeps.get(to)!.add(from);
  }

  await fs.mkdir(OUT_ROOT, { recursive: true });

  // 1) Global README with big graph + index + (optional) reverse-dep table + (optional) domain graphs
  const globalReadme = path.join(OUT_ROOT, "README.md");
  const existingGlobal = await readMaybe(globalReadme);
  const preservedTop = stripBetween(
    existingGlobal ?? "",
    GLOBAL_START,
    GLOBAL_END,
  );

  const nodeIds = new Map<string, string>(); // npm name -> mermaid id
  pkgs.forEach((p, i) => nodeIds.set(p.name, `n${i + 1}`));

  const globalGraph = buildMermaidGlobal(pkgs, edgeList, nodeIds, (name) =>
    path.join("./", byName.get(name)!.folder, "README.md").replace(/\\/g, "/"),
  );

  const indexLines: string[] = [
    "## Packages",
    "",
    ...pkgs
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => {
        const d = deps.get(p.name)!.size;
        const r = rdeps.get(p.name)!.size;
        const href = `./${p.folder}/README.md`;
        return `- [${p.name}](${href}) — deps: ${d}, dependents: ${r}`;
      }),
  ];

  const rdepsTable = RDEPS_TABLE
    ? renderReverseDepTable(pkgs, rdeps, (name) =>
        `./${byName.get(name)!.folder}/README.md`.replace(/\\/g, "/"),
      )
    : "";

  const domainSection = RENDER_DOMAIN_GRAPHS
    ? renderDomainGraphs(pkgs, edgeList, byName, (name, fromFolder) =>
        path
          .relative(
            path.join(OUT_ROOT, fromFolder),
            path.join(OUT_ROOT, byName.get(name)!.folder, "README.md"),
          )
          .replace(/\\/g, "/"),
      )
    : "";

  const globalBody = [
    preservedTop.trimEnd(),
    "",
    GLOBAL_START,
    "# Workspace Package Graph",
    "",
    "> _Auto-generated. Do not edit between markers._",
    "",
    "```mermaid",
    globalGraph.trim(),
    "```",
    "",
    ...indexLines,
    "",
    rdepsTable ? "## Reverse dependency table" : "",
    rdepsTable ? rdepsTable : "",
    domainSection ? "## Domain graphs" : "",
    domainSection ? domainSection : "",
    GLOBAL_END,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  await fs.writeFile(globalReadme, globalBody, "utf-8");

  // 2) Per-package README with local graph + lists
  for (const p of pkgs) {
    const pkgReadme = path.join(OUT_ROOT, p.folder, "README.md");
    await fs.mkdir(path.dirname(pkgReadme), { recursive: true });
    const existing = await readMaybe(pkgReadme);
    const preserved = stripBetween(existing ?? "", PKG_START, PKG_END);

    const ds = Array.from(deps.get(p.name)!).sort();
    const rs = Array.from(rdeps.get(p.name)!).sort();

    const localGraph = buildMermaidLocal(p.name, ds, rs, (name) =>
      path
        .relative(
          path.dirname(pkgReadme),
          path.join(OUT_ROOT, byName.get(name)!.folder, "README.md"),
        )
        .replace(/\\/g, "/"),
    );

    const body = [
      preserved.trimEnd(),
      "",
      PKG_START,
      `# ${p.name}`,
      "",
      `**Folder:** \`packages/${p.folder}\`  `,
      `**Version:** \`${p.manifest.version ?? "0.0.0"}\`  `,
      `**Domain:** \`${p.domain}\``,
      "",
      "```mermaid",
      localGraph.trim(),
      "```",
      "",
      "## Dependencies",
      "",
      ds.length
        ? ds
            .map(
              (n) =>
                `- [${n}](${relativeToPkgReadmeLink(
                  p.folder,
                  byName.get(n)!.folder,
                )})`,
            )
            .join("\n")
        : "- _None_",
      "",
      "## Dependents",
      "",
      rs.length
        ? rs
            .map(
              (n) =>
                `- [${n}](${relativeToPkgReadmeLink(
                  p.folder,
                  byName.get(n)!.folder,
                )})`,
            )
            .join("\n")
        : "- _None_",
      PKG_END,
      "",
    ]
      .filter(Boolean)
      .join("\n");

    await fs.writeFile(pkgReadme, body, "utf-8");
  }

  console.log(
    `Wrote package graphs to ${path.relative(process.cwd(), OUT_ROOT)}`,
  );
}

/* ---------------- helpers ---------------- */

function parseArgs(defaults: Record<string, string>) {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i] ?? "";
    if (!k.startsWith("--")) continue;
    const next = a[i + 1] ?? "";
    const v = next && !next.startsWith("--") ? a[++i] ?? "true" : "true";
    out[k] = v;
  }
  return out;
}

async function listDirs(p: string): Promise<string[]> {
  const ents = await fs.readdir(p, { withFileTypes: true });
  return ents.filter((e) => e.isDirectory()).map((e) => path.join(p, e.name));
}

async function findWorkspacePackages(
  root: string,
  domainDepth: number,
): Promise<Pkg[]> {
  const dirs = await listDirs(root);
  const out: Pkg[] = [];

  async function pushIfPkg(dir: string) {
    const pkgJson = path.join(dir, "package.json");
    try {
      const raw = await fs.readFile(pkgJson, "utf-8");
      const manifest = JSON.parse(raw);
      if (manifest.name) {
        const folder = dir
          .split(path.sep)
          .slice(dir.split(path.sep).indexOf(path.basename(root)) + 1)
          .join(path.sep);
        const domain = inferDomain(folder, domainDepth);
        out.push({
          name: manifest.name,
          folder: folder || path.basename(dir),
          dir,
          manifest,
          declaredDeps: collectDeclaredDeps(manifest),
          importDeps: new Set<string>(),
          domain,
        });
      }
    } catch {
      /* not a package */
    }
  }

  for (const d of dirs) {
    await pushIfPkg(d);
    const sub = await listDirs(d);
    for (const sd of sub) await pushIfPkg(sd);
  }
  return out;
}

function inferDomain(folder: string, depth: number): string {
  const parts = folder.split(/[\\/]/).filter(Boolean);
  // If only 1 segment (top-level like packages/foo), put into _root domain.
  if (parts.length < 2) return "_root";
  return parts
    .slice(0, Math.min(depth, parts.length - 0))
    .slice(0, depth)
    .join("/");
}

function collectDeclaredDeps(pkg: any): Set<string> {
  const names = new Set<string>();
  for (const key of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    const o = pkg[key] || {};
    for (const k of Object.keys(o)) names.add(k);
  }
  return names;
}

const IMPORT_RE = [
  /import\s+[\s\S]*?\sfrom\s+['"]([^'"]+)['"]/g,
  /import\s*['"]([^'"]+)['"]/g,
  /require\(\s*['"]([^'"]+)['"]\s*\)/g,
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function extractImportSpecifiers(src: string): string[] {
  const specs: string[] = [];
  for (const re of IMPORT_RE) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src)) !== null) {
      const s = m[1];
      if (!s || s.startsWith(".") || s.startsWith("/")) continue; // ignore relative
      specs.push(s);
    }
  }
  return specs;
}

function topLevelPackageName(spec: string): string | null {
  if (!spec) return null;
  if (spec.startsWith("@")) {
    const parts = spec.split("/");
    if (parts.length >= 2) return parts.slice(0, 2).join("/");
    return null;
  } else {
    const parts = spec.split("/");
    return parts[0] || null;
  }
}

function stripBetween(text: string, start: string, end: string) {
  if (!text) return "";
  const si = text.indexOf(start);
  const ei = text.indexOf(end);
  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
  return text.trimEnd();
}

async function readMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}

function relativeToPkgReadmeLink(fromFolder: string, toFolder: string) {
  return path
    .relative(
      path.join(OUT_ROOT, fromFolder),
      path.join(OUT_ROOT, toFolder, "README.md"),
    )
    .replace(/\\/g, "/");
}

/* ---------- Mermaid builders ---------- */

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildMermaidGlobal(
  pkgs: Pkg[],
  edges: Array<{ from: string; to: string; kind: "manifest" | "import" }>,
  idOf: Map<string, string>,
  hrefOf: (name: string) => string,
) {
  const nodeLines = pkgs
    .map((p) => `${idOf.get(p.name)}["${esc(p.name)}"]`)
    .join("\n  ");

  const edgeLines = edges
    .map((e) => {
      const a = idOf.get(e.from)!;
      const b = idOf.get(e.to)!;
      return e.kind === "manifest" ? `${a} --> ${b}` : `${a} -.-> ${b}`;
    })
    .join("\n  ");

  const clickLines = pkgs
    .map(
      (p) =>
        `click ${idOf.get(p.name)} "${hrefOf(p.name)}" "${esc(p.name)} docs"`,
    )
    .join("\n  ");

  return [
    "graph LR",
    `  ${nodeLines}`,
    edgeLines ? `  ${edgeLines}` : "",
    clickLines ? `  ${clickLines}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMermaidLocal(
  name: string,
  deps: string[],
  rdeps: string[],
  hrefOf: (name: string) => string,
) {
  const center = "A";
  const nodes = [`${center}["${esc(name)}"]`];

  const depNodes = deps.map((n, i) => `D${i + 1}["${esc(n)}"]`);
  const rdepNodes = rdeps.map((n, i) => `R${i + 1}["${esc(n)}"]`);

  const edges: string[] = [];
  depNodes.forEach((d) => edges.push(`${center} --> ${d}`));
  rdepNodes.forEach((r) => edges.push(`${r} --> ${center}`));

  const clicks: string[] = [];
  deps.forEach((n, i) =>
    clicks.push(`click D${i + 1} "${hrefOf(n)}" "${esc(n)}"`),
  );
  rdeps.forEach((n, i) =>
    clicks.push(`click R${i + 1} "${hrefOf(n)}" "${esc(n)}"`),
  );

  return [
    "graph LR",
    `  ${nodes.join("\n  ")}`,
    depNodes.length ? `  ${depNodes.join("\n  ")}` : "",
    rdepNodes.length ? `  ${rdepNodes.join("\n  ")}` : "",
    edges.length ? `  ${edges.join("\n  ")}` : "",
    clicks.length ? `  ${clicks.join("\n  ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMermaidDomain(
  domain: string,
  pkgs: Pkg[],
  edges: Array<{ from: string; to: string; kind: "manifest" | "import" }>,
  hrefOf: (name: string) => string,
) {
  const ids = new Map<string, string>();
  pkgs.forEach((p, i) =>
    ids.set(
      p.name,
      `d${Math.abs(hash(domain + p.name)).toString(36)}_${i + 1}`,
    ),
  );

  const nodeLines = pkgs
    .map((p) => `${ids.get(p.name)}["${esc(p.name)}"]`)
    .join("\n  ");
  const names = new Set(pkgs.map((p) => p.name));

  const edgeLines = edges
    .filter((e) => names.has(e.from) && names.has(e.to))
    .map((e) => {
      const a = ids.get(e.from)!;
      const b = ids.get(e.to)!;
      return e.kind === "manifest" ? `${a} --> ${b}` : `${a} -.-> ${b}`;
    })
    .join("\n  ");

  const clickLines = pkgs
    .map(
      (p) =>
        `click ${ids.get(p.name)} "${hrefOf(p.name)}" "${esc(p.name)} docs"`,
    )
    .join("\n  ");

  return [
    "graph LR",
    `  %% domain: ${domain}`,
    `  ${nodeLines}`,
    edgeLines ? `  ${edgeLines}` : "",
    clickLines ? `  ${clickLines}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/* ---------- Renderers ---------- */

function renderReverseDepTable(
  pkgs: Pkg[],
  rdeps: Map<string, Set<string>>,
  hrefOf: (name: string) => string,
): string {
  const rows = pkgs
    .map((p) => ({
      name: p.name,
      deps: rdeps.get(p.name) ?? new Set<string>(),
    }))
    .sort((a, b) => b.deps.size - a.deps.size);

  const lines: string[] = [];
  lines.push("| Package | Dependents | Top dependents |");
  lines.push("|---|---:|---|");
  for (const r of rows) {
    const list = Array.from(r.deps).sort();
    const shown = MAX_RDEPS_LIST > 0 ? list.slice(0, MAX_RDEPS_LIST) : list;
    const extra =
      MAX_RDEPS_LIST > 0 && list.length > MAX_RDEPS_LIST
        ? `, +${list.length - MAX_RDEPS_LIST} more`
        : "";
    const links =
      shown.map((n) => `[${n}](${hrefOf(n)})`).join(", ") +
      (extra ? extra : "");
    lines.push(
      `| [${r.name}](${hrefOf(r.name)}) | ${list.length} | ${
        links || "_None_"
      } |`,
    );
  }
  return lines.join("\n");
}

function renderDomainGraphs(
  pkgs: Pkg[],
  edges: Array<{ from: string; to: string; kind: "manifest" | "import" }>,
  _byName: Map<string, Pkg>,
  hrefOfRelTo: (name: string, fromFolder: string) => string,
): string {
  const byDomain = new Map<string, Pkg[]>();
  for (const p of pkgs)
    (byDomain.get(p.domain) ?? byDomain.set(p.domain, []).get(p.domain)!).push(
      p,
    );

  const sections: string[] = [];
  for (const [domain, list] of Array.from(byDomain.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const baseFolder = list[0]?.folder ?? "";
    const mermaid = buildMermaidDomain(domain, list, edges, (name) =>
      hrefOfRelTo(name, baseFolder),
    );
    const cross = crossDomainEdges(
      domain,
      list.map((p) => p.name),
      edges,
    );

    sections.push(
      `### ${domain === "_root" ? "root (packages/*)" : domain}`,
      "",
      "```mermaid",
      mermaid.trim(),
      "```",
      cross.length ? "**Cross-domain edges touching this domain:**" : "",
      cross.length ? cross.map((c) => `- ${c}`).join("\n") : "",
      "",
    );
  }
  return sections.filter(Boolean).join("\n");
}

function crossDomainEdges(
  _domain: string,
  members: string[],
  edges: { from: string; to: string }[],
) {
  const set = new Set(members);
  const out: string[] = [];
  for (const e of edges) {
    const inFrom = set.has(e.from);
    const inTo = set.has(e.to);
    if (inFrom && !inTo) out.push(`${e.from} → ${e.to}`);
    if (!inFrom && inTo) out.push(`${e.from} → ${e.to}`);
  }
  // de-dup
  return Array.from(new Set(out)).sort();
}

/* ---------- misc ---------- */

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
