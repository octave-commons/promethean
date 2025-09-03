// SPDX-License-Identifier: GPL-3.0-only
import { promises as fs } from "fs";
import * as path from "path";
import * as ts from "typescript";
import { parseArgs, listFilesRec, makeProgram, getJsDocText, getNodeText, posToLine, sha1, relFromRepo, getLangFromExt, signatureForFunction, typeToString } from "./utils.js";
import type { SymKind, SymbolInfo, ScanResult } from "./types.js";

const args = parseArgs({
  "--root": "packages",
  "--tsconfig": "",
  "--ext": ".ts,.tsx,.js,.jsx",
  "--out": ".cache/symdocs/symbols.json"
});

const ROOT = path.resolve(args["--root"]);
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
const OUT = path.resolve(args["--out"]);
const repoRoot = process.cwd();

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
    const pkg = bits[1];
    const moduleRel = bits.slice(2).join("/");

    function pushSymbol(kind: SymKind, name: string, node: ts.Node, exported: boolean, signature?: string) {
      const startLine = posToLine(sf, node.getStart());
      const endLine = posToLine(sf, node.getEnd());
      const snippet = getNodeText(src, node);
      const lang = getLangFromExt(fileAbs);
      const jsdoc = getJsDocText(node);
      const id = sha1([pkg, moduleRel, kind, name, signature ?? "", startLine, endLine].join("|"));

      symbols.push({
        id, pkg, fileAbs, fileRel: rel, moduleRel, lang,
        name, kind, exported, jsdoc, signature, startLine, endLine, snippet
      });
    }

    const visit = (node: ts.Node) => {
      // Function declarations
      if (ts.isFunctionDeclaration(node) && node.name) {
        const exported = hasExport(node);
        const sig = signatureForFunction(checker, node);
        pushSymbol("function", node.name.text, node, exported, sig);
      }

      // Class declarations
      if (ts.isClassDeclaration(node) && node.name) {
        const exported = hasExport(node);
        pushSymbol("class", node.name.text, node, exported, `class ${node.name.text}`);
      }

      // Type aliases
      if (ts.isTypeAliasDeclaration(node)) {
        const exported = hasExport(node);
        pushSymbol("type", node.name.text, node, exported, `type ${node.name.text} = ${typeToString(checker, node.type) ?? "..."}`);
      }

      // Interfaces (treat as 'type')
      if (ts.isInterfaceDeclaration(node)) {
        const exported = hasExport(node);
        pushSymbol("type", node.name.text, node, exported, `interface ${node.name.text}`);
      }

      // Variables
      if (ts.isVariableStatement(node)) {
        const exported = hasExport(node);
        for (const decl of node.declarationList.declarations) {
          const name = decl.name.getText();
          pushSymbol("variable", name, decl, exported, typeToString(checker, decl) ?? undefined);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sf);
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const payload: ScanResult = { symbols };
  await fs.writeFile(OUT, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`Scanned ${symbols.length} symbols → ${path.relative(repoRoot, OUT)}`);
}

function hasExport(node: ts.Node): boolean {
  const m = ts.getCombinedModifierFlags(node as any);
  return (m & ts.ModifierFlags.Export) !== 0 || (m & ts.ModifierFlags.Default) !== 0;
}

main().catch((e) => { console.error(e); process.exit(1); });
