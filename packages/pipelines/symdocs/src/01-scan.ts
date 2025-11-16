/* eslint-disable */
import * as path from 'path';
import { fileURLToPath } from 'url';

import * as ts from 'typescript';
import { getJsDocText, getNodeText, posToLine, relFromRepo } from '@promethean-os/utils';
import { scanFiles } from '@promethean-os/file-indexer';
import { collectAbsolutePaths, createPipelineProgram } from '@promethean-os/pipeline-core';

import { makeProgram, sha1, getLangFromExt, signatureForFunction, typeToString } from './utils.js';
import type { SymKind, SymbolInfo } from './types.js';
import { openLevelCache } from '@promethean-os/level-cache';

export type ScanOptions = {
  root?: string;
  tsconfig?: string;
  ext?: string;
  cache?: string;
  files?: readonly string[];
};

export async function collectSourceFiles(root: string, exts: Set<string>): Promise<string[]> {
  return collectAbsolutePaths({ root, extensions: Array.from(exts), scanner: scanFiles });
}

export async function runScan(opts: ScanOptions = {}) {
  const ROOT = path.resolve(opts.root ?? 'packages');
  const EXTS = new Set(
    (opts.ext ?? '.ts,.tsx,.js,.jsx').split(',').map((s) => s.trim().toLowerCase()),
  );
  const CACHE_PATH = path.resolve(opts.cache ?? '.cache/symdocs.level');
  const repoRoot = process.cwd();

  const files =
    opts.files && opts.files.length > 0
      ? opts.files.map((f) => path.resolve(f))
      : await collectSourceFiles(ROOT, EXTS);
  if (files.length === 0) {
    console.log('No files found.');
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
    const bits = rel.split('/'); // packages/<pkg>/...
    if (bits[0] !== 'packages' || bits.length < 2) continue;
    const pkg = bits[1] ?? '';
    const moduleRel = bits.slice(2).join('/');

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
      const id = sha1([pkg, moduleRel, kind, name, signature ?? '', startLine, endLine].join('|'));

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
        pushSymbol('function', node.name.text, node, exported, sig);
      }

      // Class declarations
      if (ts.isClassDeclaration(node) && node.name) {
        const exported = hasExport(node);
        pushSymbol('class', node.name.text, node, exported, `class ${node.name.text}`);
      }

      // Type aliases
      if (ts.isTypeAliasDeclaration(node)) {
        const exported = hasExport(node);
        pushSymbol(
          'type',
          node.name.text,
          node,
          exported,
          `type ${node.name.text} = ${typeToString(checker, node.type) ?? '...'}`,
        );
      }

      // Interfaces (treat as 'type')
      if (ts.isInterfaceDeclaration(node)) {
        const exported = hasExport(node);
        pushSymbol('type', node.name.text, node, exported, `interface ${node.name.text}`);
      }

      // Variables
      if (ts.isVariableStatement(node)) {
        const exported = hasExport(node);
        for (const decl of node.declarationList.declarations) {
          const name = decl.name.getText();
          pushSymbol('variable', name, decl, exported, typeToString(checker, decl) ?? undefined);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sf);
  }

  const cache = await openLevelCache<SymbolInfo>({
    path: CACHE_PATH,
    namespace: 'symbols',
  });
  for (const s of symbols) {
    await cache.set(s.id, s);
  }
  await cache.close();
  console.log(`Scanned ${symbols.length} symbols → ${path.relative(repoRoot, CACHE_PATH)}`);
}

function hasExport(node: ts.Node): boolean {
  const m = ts.getCombinedModifierFlags(node as any);
  return (m & ts.ModifierFlags.Export) !== 0 || (m & ts.ModifierFlags.Default) !== 0;
}

async function runCli() {
  const program = createPipelineProgram('symdocs-scan', 'Scan packages for symbols');
  program
    .option('--root <path>', 'Root directory to scan', 'packages')
    .option('--tsconfig <path>', 'Optional tsconfig path', '')
    .option('--ext <list>', 'Comma-separated extensions', '.ts,.tsx,.js,.jsx')
    .option('--cache <path>', 'Cache directory', '.cache/symdocs.level')
    .action(async (options: { root: string; tsconfig?: string; ext: string; cache: string }) => {
      await runScan({
        root: options.root,
        tsconfig: options.tsconfig || undefined,
        ext: options.ext,
        cache: options.cache,
      });
    });
  await program.parseAsync(process.argv);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCli().catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
}
