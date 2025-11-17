import { promises as fs } from "fs";
import * as path from "path";

import { readJSON } from "./utils.js";
import type { ModSpecFile, ModSpec } from "./types.js";

const args = parseArgs({
  "--in": ".cache/codemods/specs.json",
  "--outDir": "codemods", // relative to repo root
});

function parseArgs<T extends Record<string, string>>(defaults: T): T {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!k?.startsWith("--")) continue;
    const next = a[i + 1];
    const v = next && !next.startsWith("--") ? (i++, next) : "true";
    out[k as keyof T] = v as T[keyof T];
  }
  return out;
}

function transformTemplate(spec: ModSpec) {
  return `/* AUTO-GENERATED: ${spec.clusterId} — ${spec.title}
   * Canonical: ${spec.canonical.name} @ ${spec.canonical.path}
   * Param order: ${spec.canonical.params?.join(", ") || "(unknown)"}
   * Duplicates: ${spec.duplicates
     .map((d) => d.name + " in " + d.file)
     .join(", ")}
   */
import { Project, SyntaxKind, Node } from "ts-morph";
import * as path from "path";
import { importPathRelative, ensureImport, removeImportIfUnused, replaceIdentifier } from "../packages/codemods/dist/utils.js";

const CANONICAL_PATH = ${JSON.stringify(spec.canonical.path)};
const CANONICAL_NAME = ${JSON.stringify(spec.canonical.name)};
const CANONICAL_PARAMS = ${JSON.stringify(spec.canonical.params ?? [])};

const DUPLICATES = ${JSON.stringify(
    spec.duplicates.map((d) => ({
      name: d.name,
      file: d.file,
      paramMap: d.paramMap ?? [],
    })),
  )};

function reorderArgs(textArgs: string[], paramMap: number[], haveCanonParams: boolean): string[] {
  if (!haveCanonParams || !paramMap.length) return textArgs;
  const out: string[] = new Array(paramMap.length).fill("undefined");
  for (let i=0;i<paramMap.length;i++) {
    const fromIx = paramMap[i];
    if (fromIx != null && fromIx >= 0 && fromIx < textArgs.length) out[i] = textArgs[fromIx];
  }
  // if canonical has more params than provided, trailing "undefined" stays (JS ok)
  return out;
}

export async function runTransform(project: Project, fileAbs: string) {
  const source = project.getSourceFile(fileAbs);
  if (!source) return { changed: false, notes: [] as string[] };

  const notes: string[] = [];
  let changed = false;

  const canonicalAbs = path.resolve(process.cwd(), CANONICAL_PATH);

  // For quick lookup of dup paramMaps by name
  const mapByName = new Map<string, number[]>();
  for (const d of DUPLICATES) mapByName.set(d.name, d.paramMap ?? []);

  // 1) Remove local duplicate declarations → import canonical
  for (const dup of DUPLICATES) {
    const name = dup.name;
    const funcs = source.getFunctions().filter(f => f.getName() === name);
    const vars = source.getVariableDeclarations().filter(v => v.getName() === name);
    if (funcs.length || vars.length) {
      funcs.forEach(f => f.remove());
      vars.forEach(v => { const st = v.getParent()?.getParent(); if (st) st.remove(); });
      const from = importPathRelative(fileAbs, canonicalAbs);
      ensureImport(source, { name: CANONICAL_NAME, from });
      replaceIdentifier(source, name, CANONICAL_NAME);
      changed = true;
      notes.push(\`removed local duplicate '\${name}' and imported canonical '\${CANONICAL_NAME}'\`);
    }
  }

  // Helper: rewrite a specific call expression from duplicate -> canonical with arg reordering
  function rewriteCall(call: import("ts-morph").CallExpression, dupName: string) {
    const args = call.getArguments().map(a => a.getText());
    const pm = mapByName.get(dupName) || [];
    const newArgs = reorderArgs(args, pm, CANONICAL_PARAMS.length > 0);
    call.getExpression().replaceWithText(CANONICAL_NAME);
    call.setArguments(newArgs);
    changed = true;
    notes.push(\`callsite updated \${dupName}(...) → \${CANONICAL_NAME}(\${newArgs.join(", ")})\`);
  }

  // 2) Calls to local duplicates (declared in this file)
  for (const dup of DUPLICATES) {
    const calls = source.getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter(c => c.getExpression().getKind() === SyntaxKind.Identifier && c.getExpression().getText() === dup.name);
    if (calls.length) {
      const from = importPathRelative(fileAbs, canonicalAbs);
      ensureImport(source, { name: CANONICAL_NAME, from });
      for (const call of calls) rewriteCall(call, dup.name);
    }
  }

  // 3) Imports that bring in duplicates from elsewhere → repoint import + rewrite calls
  for (const imp of source.getImportDeclarations()) {
    for (const ni of imp.getNamedImports()) {
      const imported = ni.getName();
      const alias = ni.getAliasNode()?.getText();
      const local = alias || imported;
      if (mapByName.has(local)) {
        const fromOld = imp.getModuleSpecifierValue();
        ni.remove();
        if (imp.getNamedImports().length === 0 && !imp.getDefaultImport() && !imp.getNamespaceImport()) imp.remove();

        const fromNew = importPathRelative(fileAbs, canonicalAbs);
        ensureImport(source, { name: CANONICAL_NAME, from: fromNew });

        // rewrite calls that use 'local(...)'
        const calls = source.getDescendantsOfKind(SyntaxKind.CallExpression)
          .filter(c => c.getExpression().getKind() === SyntaxKind.Identifier && c.getExpression().getText() === local);
        for (const call of calls) rewriteCall(call, local);

        // finally rename any remaining identifiers (safe)
        replaceIdentifier(source, local, CANONICAL_NAME);

        changed = true;
        notes.push(\`repointed import \${local} (from '\${fromOld}') → \${CANONICAL_NAME} (from '\${fromNew}')\`);
      }
    }
  }

  // 4) Clean dead imports named like duplicates
  for (const dup of DUPLICATES) removeImportIfUnused(source, dup.name);

  if (changed) await source.save();
  return { changed, notes };
}
`;
}

async function main() {
  const IN = path.resolve(args["--in"]);
  const OUT_DIR = path.resolve(args["--outDir"]);
  const data = await readJSON<ModSpecFile>(IN, { specs: [] });

  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const spec of data.specs) {
    const dir = path.join(OUT_DIR, spec.clusterId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, "transform.ts"),
      transformTemplate(spec),
      "utf-8",
    );

    const md = [
      `# ${spec.title}`,
      "",
      `- Canonical: \`${spec.canonical.name}\` @ \`${spec.canonical.path}\``,
      `- Canonical params: ${
        spec.canonical.params?.length
          ? "`" + spec.canonical.params.join(", ") + "`"
          : "_unknown_"
      }`,
      `- Duplicates:`,
      ...spec.duplicates.map(
        (d) =>
          `  - \`${d.name}\` — \`${d.file}\`${
            d.params?.length ? " (params: `" + d.params.join(", ") + "`)" : ""
          }${d.paramMap?.length ? " (map " + d.paramMap.join(",") + ")" : ""}`,
      ),
      "",
    ].join("\n");
    await fs.writeFile(path.join(dir, "README.md"), md, "utf-8");
  }
  console.log(
    `codemods:02-generate → wrote ${
      data.specs.length
    } transforms in ${path.relative(process.cwd(), OUT_DIR)}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
