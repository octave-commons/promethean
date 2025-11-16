import * as path from 'path';
import { pathToFileURL } from 'url';

import { openLevelCache } from '@promethean-os/level-cache';
import { embedEntities, createPipelineProgram } from '@promethean-os/pipeline-core';

import type { CodeBlock } from './types.js';

export type EmbedOptions = {
  blocks?: string;
  cache?: string;
  embedModel?: string;
  mixContext?: boolean;
};

export async function embedBlocks(options: EmbedOptions = {}): Promise<void> {
  const blocksPath = path.resolve(options.blocks ?? '.cache/codepack/blocks');
  const cachePath = path.resolve(options.cache ?? '.cache/codepack/embeds');
  const model = options.embedModel ?? 'nomic-embed-text:latest';
  const mix = options.mixContext ?? true;

  const blockCache = await openLevelCache<CodeBlock>({ path: blocksPath, namespace: 'blocks' });
  const blocks: CodeBlock[] = [];
  for await (const [, block] of blockCache.entries()) blocks.push(block);
  await blockCache.close();

  const wrote = await embedEntities({
    entities: blocks,
    getId: (block) => block.id,
    cachePath,
    namespace: 'embeds',
    model,
    formatter: (block) =>
      mix
        ? `FILE:${block.hintedName ?? ''}\nPATH:${block.relPath}\nLANG:${block.lang ?? ''}\nCONTEXT_BEFORE:\n${block.contextBefore}\nCODE:\n${block.code}\nCONTEXT_AFTER:\n${block.contextAfter}`
        : block.code,
  });

  console.log(`codepack: embedded ${wrote} blocks -> ${path.relative(process.cwd(), cachePath)}`);
}

async function runCli() {
  const program = createPipelineProgram('codepack-embed', 'Embed extracted code blocks');
  program
    .option('--blocks <path>', 'Source block cache path', '.cache/codepack/blocks')
    .option('--cache <path>', 'Embedding cache path', '.cache/codepack/embeds')
    .option('--embed-model <name>', 'Embedding model', 'nomic-embed-text:latest')
    .option('--no-mix-context', 'Embed using raw code only')
    .action(async (options: EmbedOptions & { mixContext?: boolean }) => {
      await embedBlocks({
        blocks: options.blocks,
        cache: options.cache,
        embedModel: options.embedModel,
        mixContext: options.mixContext ?? true,
      });
    });
  await program.parseAsync(process.argv);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runCli().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
