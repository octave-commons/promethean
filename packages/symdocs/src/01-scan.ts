import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import * as ts from "typescript";
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

export type ScanOptions = {
  root?: string;
  tsconfig?: string;
  ext?: string;
  out?: string;
  files?: readonly string[];
};

export async function runScan(opts: ScanOptions = {}) {
  const ROOT = path.resolve(opts.root ?? "packages");
  const EXTS = new Set(
    (opts.ext ?? ".ts,.tsx,.js,.jsx")
      .split(",")
      .map((s) => s.trim().toLowerCase()),
  );
  const OUT = path.resolve(opts.out ?? ".cache/symdocs/symbols.json");
  const repoRoot = process.cwd();

  const files =
    opts.files && opts.files.length > 0
      ? opts.files.map((f) => path.resolve(f))
      : await listFilesRec(ROOT, EXTS);
  if (files.length === 0) {
    console.log("No files found.");
    return;
  }

  const program = makeProgram(files, opts.tsconfig);
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
        pushSymbol(
          "class",
          node.name.text,
          node,
          exported,
          `class ${node.name.text}`,
        );
      }

      // Type aliases
      if (ts.isTypeAliasDeclaration(node)) {
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
      if (ts.isInterfaceDeclaration(node)) {
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
      if (ts.isVariableStatement(node)) {
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

      ts.forEachChild(node, visit);
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
  const m = ts.getCombinedModifierFlags(node as any);
  return (
    (m & ts.ModifierFlags.Export) !== 0 || (m & ts.ModifierFlags.Default) !== 0
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    "--root": "packages",
    "--tsconfig": "",
    "--ext": ".ts,.tsx,.js,.jsx",
    "--out": ".cache/symdocs/symbols.json",
  });
  runScan({
    root: String(args["--root"]),
    tsconfig: args["--tsconfig"] || undefined,
    ext: String(args["--ext"]),
    out: String(args["--out"]),
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
