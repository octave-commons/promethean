/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import globby from "globby";
import { Project } from "ts-morph";
import { parseArgs, writeJSON, rel } from "./utils.js";
import type { ExportScan, ExportSymbol } from "./types.js";

const args = parseArgs({
  "--root": "packages",
  "--out": ".cache/testgap/exports.json"
});

async function main() {
  const ROOT = path.resolve(args["--root"]);
  const pkgs = (await fs.readdir(ROOT, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name);
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const symbols: ExportSymbol[] = [];

  for (const dir of pkgs) {
    const pkgRoot = path.join(ROOT, dir);
    const pkgJson = JSON.parse(await fs.readFile(path.join(pkgRoot, "package.json"), "utf-8"));
    const pkgName = pkgJson.name ?? dir;
    const files = await globby([`${pkgRoot.replace(/\\/g,"/")}/**/*.{ts,tsx,js,jsx}`, "!**/node_modules/**", "!**/dist/**", "!**/build/**"]);
    files.forEach(f => project.addSourceFileAtPathIfExists(f));

    for (const sf of project.getSourceFiles().filter(s => s.getFilePath().startsWith(pkgRoot))) {
      const file = rel(sf.getFilePath().replace(/\\/g,"/"));
      for (const [name, decls] of sf.getExportedDeclarations()) {
        const d = decls[0]; const kind = (d.getKindName() || "").replace("Declaration","").toLowerCase();
        const pos = d.getStartLineNumber ? { startLine: d.getStartLineNumber(), endLine: d.getEndLineNumber?.() ?? d.getEndLineNumber?.() ?? (d as any).getEndLineNumber?.() ?? 0 } : { startLine: 1, endLine: 1 };
        symbols.push({ pkg: pkgName, file, kind: (["function","class","variable","interface","type","enum"].includes(kind) ? (kind as any) : "variable"), name, startLine: pos.startLine, endLine: pos.endLine });
      }
    }
  }

  const out: ExportScan = { scannedAt: new Date().toISOString(), symbols };
  await writeJSON(path.resolve(args["--out"]), out);
  console.log(`testgap: scanned exports → ${args["--out"]} (${symbols.length} symbols)`);
}
main().catch(e => { console.error(e); process.exit(1); });
