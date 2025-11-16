import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { openLevelCache } from '@promethean-os/level-cache';
import { createPipelineProgram } from '@promethean-os/pipeline-core';

import { ensureDir } from './utils.js';
import type { CodeBlock, NamedGroup } from './types.js';

export type MaterializeOptions = {
  blocks?: string;
  names?: string;
  out?: string;
  dryRun?: boolean;
};

function safeJoin(...parts: string[]) {
  const p = path.join(...parts).replace(/\\/g, '/');
  if (p.includes('..')) throw new Error('refusing to write paths with ..');
  return p;
}

export async function materialize(options: MaterializeOptions = {}): Promise<void> {
  const blocksPath = path.resolve(options.blocks ?? '.cache/codepack/blocks');
  const namesPath = path.resolve(options.names ?? '.cache/codepack/names');
  const outRoot = path.resolve(options.out ?? 'out/code_groups');
  const dry = options.dryRun ?? false;

  const blockCache = await openLevelCache<CodeBlock>({ path: blocksPath, namespace: 'blocks' });
  const byId = new Map<string, CodeBlock>();
  for await (const [id, block] of blockCache.entries()) {
    byId.set(id, block);
  }
  await blockCache.close();

  const nameCache = await openLevelCache<NamedGroup>({ path: namesPath, namespace: 'names' });
  const groups: NamedGroup[] = [];
  for await (const [, group] of nameCache.entries()) groups.push(group);
  await nameCache.close();

  for (const group of groups) {
    const dirAbs = safeJoin(outRoot, group.dir);
    if (!dry) await ensureDir(dirAbs);

    const readmeAbs = path.join(dirAbs, 'README.md');
    if (!dry) await fs.writeFile(readmeAbs, group.readme, 'utf-8');

    for (const file of group.files) {
      const block = byId.get(file.id);
      if (!block) {
        console.warn(`codepack: missing block ${file.id}`);
        continue;
      }
      const fileAbs = path.join(dirAbs, file.filename);
      if (!dry) await ensureDir(path.dirname(fileAbs));
      const header = `<!-- Source: ${block.relPath}:${block.startLine}-${block.endLine} -->\n`;
      const content = `${header}\n${block.code}`;
      if (!dry) await fs.writeFile(fileAbs, content, 'utf-8');
    }
  }

  console.log(
    dry
      ? `codepack: dry-run materialization -> ${path.relative(process.cwd(), outRoot)}`
      : `codepack: materialized ${groups.length} groups -> ${path.relative(process.cwd(), outRoot)}`,
  );
}

async function runCli() {
  const program = createPipelineProgram('codepack-materialize', 'Write named groups to disk');
  program
    .option('--blocks <path>', 'Block cache path', '.cache/codepack/blocks')
    .option('--names <path>', 'Names cache path', '.cache/codepack/names')
    .option('--out <path>', 'Output directory', 'out/code_groups')
    .option('--dry-run', 'Preview without writing files')
    .action(async (options: MaterializeOptions) => {
      await materialize({
        blocks: options.blocks,
        names: options.names,
        out: options.out,
        dryRun: options.dryRun ?? false,
      });
    });
  await program.parseAsync(process.argv);
}

if (import.meta.url === new URL(import.meta.url).href) {
  runCli().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
