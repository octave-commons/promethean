/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import * as ts from "typescript";
import { parseArgs, listFilesRec, makeProgram, posToLine, getJsDocText, getNodeText, relFromRepo, sha1 } from "./utils.js";
import type { FunctionInfo, ScanResult, FnKind } from "./types.js";

const args = parseArgs({
  "--root": "packages",
  "--ext": ".ts,.tsx,.js,.jsx",
  "--tsconfig": "",
  "--out": ".cache/simtasks/functions.json"
});

const ROOT = path.resolve(args["--root"]);
const EXTS = new Set(args["--ext"].split(",").map((s) => s.trim().toLowerCase()));
const OUT = path.resolve(args["--out"]);

async function main() {
  const files = await listFilesRec(ROOT, EXTS);
  const program = makeProgram(files, args["--tsconfig"] || undefined);
  const checker = program.getTypeChecker();

  const functions: FunctionInfo[] = [];

  for (const sf of program.getSourceFiles()) {
    const fileAbs = path.resolve(sf.fileName);
    if (!fileAbs.startsWith(ROOT)) continue;
    const src = sf.getFullText();
    const fileRel = relFromRepo(fileAbs);

    const bits = fileRel.split("/");
    if (bits[0] !== "packages" || bits.length < 2) continue;
    const pkgFolder = bits[1];
    const pkgRoot = path.join(process.cwd(), "packages", pkgFolder);
    const pkgJson = JSON.parse(await fs.readFile(path.join(pkgRoot, "package.json"), "utf-8"));
    const pkgName = pkgJson.name as string;
    const moduleRel = bits.slice(2).join("/");

    const visit = (node: ts.Node) => {
      // Named function declarations
      if (ts.isFunctionDeclaration(node) && node.name) {
        push("function", node.name.text, node, hasExport(node), signatureFromDecl(node));
      }

      // Variable => function/arrow
      if (ts.isVariableStatement(node)) {
        const exported = hasExport(node);
        for (const decl of node.declarationList.declarations) {
          const name = decl.name.getText();
          const init = (decl as any).initializer as ts.Node | undefined;
          if (!init) continue;
          if (ts.isFunctionExpression(init)) {
            push("function", name, decl, exported, signatureFromFuncExpr(init));
          } else if (ts.isArrowFunction(init)) {
            push("arrow", name, decl, exported, signatureFromArrow(init));
          }
        }
      }

      // Class methods
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.text;
        for (const m of node.members) {
          if (ts.isMethodDeclaration(m) && m.name && ts.isIdentifier(m.name)) {
            const exported = hasExport(node); // class export implies method export context
            push("method", m.name.text, m, exported, signatureFromMethod(m), className);
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    const push = (kind: FnKind, name: string, node: ts.Node, exported: boolean, signature?: string, className?: string) => {
      const startLine = posToLine(sf, node.getStart());
      const endLine = posToLine(sf, node.getEnd());
      const jsdoc = getJsDocText(node);
      const snippet = getNodeText(src, node);
      const id = sha1([pkgName, moduleRel, kind, className ?? "", name, signature ?? "", startLine, endLine].join("|"));
      functions.push({
        id, pkgName, pkgFolder, fileAbs, fileRel, moduleRel, name, kind, className,
        exported, signature, jsdoc, startLine, endLine, snippet
      });
    };

    const signatureFromDecl = (d: ts.FunctionDeclaration) => {
      const sig = checker.getSignatureFromDeclaration(d);
      return sig ? checker.signatureToString(sig) : undefined;
    };
    const signatureFromFuncExpr = (d: ts.FunctionExpression) => {
      const sig = checker.getSignatureFromDeclaration(d);
      return sig ? checker.signatureToString(sig) : undefined;
    };
    const signatureFromArrow = (d: ts.ArrowFunction) => {
      const sig = checker.getSignatureFromDeclaration(d as any);
      return sig ? checker.signatureToString(sig) : undefined;
    };
    const signatureFromMethod = (d: ts.MethodDeclaration) => {
      const sig = checker.getSignatureFromDeclaration(d);
      return sig ? checker.signatureToString(sig) : undefined;
    };

    const hasExport = (node: ts.Node) => {
      const m = ts.getCombinedModifierFlags(node as any);
      return (m & ts.ModifierFlags.Export) !== 0 || (m & ts.ModifierFlags.Default) !== 0;
    };

    visit(sf);
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const payload: ScanResult = { functions };
  await fs.writeFile(OUT, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`simtasks: scanned ${functions.length} functions -> ${path.relative(process.cwd(), OUT)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
