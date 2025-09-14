import { promises as fs } from "fs";
import * as path from "path";

import type * as ts from "typescript";
import tsModule from "typescript";

// Normalize TypeScript import for both ESM and CJS builds.
const tsc: typeof ts = ((tsModule as unknown as { default?: typeof ts })
  .default ?? tsModule) as typeof ts;
import {
  getJsDocText,
  getNodeText,
  posToLine,
  relFromRepo,
  listFilesRec,
} from "@promethean/utils";

import {
  parseArgs,
  makeProgram,
  sha1,
  getLangFromExt,
  signatureForFunction,
  typeToString,
} from "./utils.js";
import type { SymKind, SymbolInfo, ScanResult } from "./types.js";

const args = parseArgs({
  "--root": "packages",
  "--tsconfig": "",
  "--ext": ".ts,.tsx,.js,.jsx",
  "--out": ".cache/symdocs/symbols.json",
});

const ROOT = path.resolve(String(args["--root"]));
const EXTS = new Set(
  String(args["--ext"])
    .split(",")
    .map((s) => s.trim().toLowerCase()),
);
const OUT = path.resolve(String(args["--out"]));
const repoRoot = process.cwd();

/* eslint-disable-next-line max-lines-per-function */
async function main() {
  const files = await listFilesRec(ROOT, EXTS);
  if (files.length === 0) {
    console.log("No files found.");
    return;
  }

  const program = makeProgram(files, args["--tsconfig"] || undefined);
  const checker = program.getTypeChecker();

  const symbols: SymbolInfo[] = [];

  for (const sf of program.getSourceFiles()) {
    const fileAbs = path.resolve(sf.fileName);
    if (!fileAbs.startsWith(ROOT)) continue;
    const src = sf.getFullText();

    const rel = relFromRepo(fileAbs);
    const bits = rel.split("/"); // packages/<pkg>/...
    if (bits[0] !== "packages" || bits.length < 2) continue;
    const pkg = bits[1] ?? "";
    const moduleRel = bits.slice(2).join("/");

    /* eslint-disable-next-line max-params */
    function pushSymbol(
      kind: SymKind,
      name: string,
      node: ts.Node,
      exported: boolean,
      signature?: string,
    ) {
      const startLine = posToLine(sf, node.getStart());
      const endLine = posToLine(sf, node.getEnd());
      const snippet = getNodeText(src, node);
      const lang = getLangFromExt(fileAbs);
      const jsdoc = getJsDocText(node);
      const id = sha1(
        [pkg, moduleRel, kind, name, signature ?? "", startLine, endLine].join(
          "|",
        ),
      );

      symbols.push({
        id,
        pkg,
        fileAbs,
        fileRel: rel,
        moduleRel,
        lang,
        name,
        kind,
        exported,
        jsdoc,
        signature,
        startLine,
        endLine,
        snippet,
      });
    }

    /* eslint-disable-next-line max-lines-per-function */
    const visit = (node: ts.Node) => {
      // Function declarations
      if (tsc.isFunctionDeclaration(node) && node.name) {
        const exported = hasExport(node);
        const sig = signatureForFunction(checker, node);
        pushSymbol("function", node.name.text, node, exported, sig);
      }

      // Class declarations
      if (tsc.isClassDeclaration(node) && node.name) {
        const exported = hasExport(node);
        pushSymbol(
          "class",
          node.name.text,
          node,
          exported,
          `class ${node.name.text}`,
        );
      }

      // Type aliases
      if (tsc.isTypeAliasDeclaration(node)) {
        const exported = hasExport(node);
        pushSymbol(
          "type",
          node.name.text,
          node,
          exported,
          `type ${node.name.text} = ${
            typeToString(checker, node.type) ?? "..."
          }`,
        );
      }

      // Interfaces (treat as 'type')
      if (tsc.isInterfaceDeclaration(node)) {
        const exported = hasExport(node);
        pushSymbol(
          "type",
          node.name.text,
          node,
          exported,
          `interface ${node.name.text}`,
        );
      }

      // Variables
      if (tsc.isVariableStatement(node)) {
        const exported = hasExport(node);
        for (const decl of node.declarationList.declarations) {
          const name = decl.name.getText();
          pushSymbol(
            "variable",
            name,
            decl,
            exported,
            typeToString(checker, decl) ?? undefined,
          );
        }
      }

      tsc.forEachChild(node, visit);
    };

    visit(sf);
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const payload: ScanResult = { symbols };
  await fs.writeFile(OUT, JSON.stringify(payload, null, 2), "utf-8");
  console.log(
    `Scanned ${symbols.length} symbols → ${path.relative(repoRoot, OUT)}`,
  );
}

function hasExport(node: ts.Node): boolean {
  const m = tsc.getCombinedModifierFlags(node as unknown as ts.Declaration);
  return (
    (m & tsc.ModifierFlags.Export) !== 0 ||
    (m & tsc.ModifierFlags.Default) !== 0
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
