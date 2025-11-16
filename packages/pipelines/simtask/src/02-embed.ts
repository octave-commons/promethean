import * as path from 'path';
import { pathToFileURL } from 'url';

import { openLevelCache } from '@promethean-os/level-cache';
import { embedEntities, createPipelineProgram } from '@promethean-os/pipeline-core';

import type { FunctionInfo } from './types.js';

export type EmbedArgs = {
  input?: string;
  out?: string;
  embedModel?: string;
  includeJsdoc?: boolean;
  includeSnippet?: boolean;
};

export async function embed(args: Readonly<EmbedArgs>): Promise<void> {
  const IN = path.resolve(args.input ?? '.cache/simtasks/functions');
  const CACHE_PATH = path.resolve(args.out ?? '.cache/simtasks/embeddings');
  const model = args.embedModel ?? 'nomic-embed-text:latest';
  const includeJsdoc = args.includeJsdoc ?? true;
  const includeSnippet = args.includeSnippet ?? true;

  const scanCache = await openLevelCache<FunctionInfo[]>({ path: IN });
  const functions = (await scanCache.get('functions')) ?? [];
  await scanCache.close();

  const wrote = await embedEntities({
    entities: functions,
    getId: (fn) => fn.id,
    cachePath: CACHE_PATH,
    model,
    formatter: (fn) =>
      [
        `NAME: ${fn.className ? fn.className + '.' : ''}${fn.name}`,
        `KIND: ${fn.kind}  EXPORTED: ${fn.exported}`,
        fn.signature ? `SIGNATURE: ${fn.signature}` : '',
        `PACKAGE: ${fn.pkgName}  FILE: ${fn.fileRel}:${fn.startLine}-${fn.endLine}`,
        includeJsdoc && fn.jsdoc ? `JSDOC:\n${fn.jsdoc}` : '',
        includeSnippet ? `CODE:\n${fn.snippet}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
  });

  console.log(
    `simtasks: embedded ${wrote} functions -> ${path.relative(process.cwd(), CACHE_PATH)}`,
  );
}

async function runCli() {
  const program = createPipelineProgram('simtasks-embed', 'Embed scanned functions');
  program
    .option('--input <path>', 'Path to scan cache', '.cache/simtasks/functions')
    .option('--out <path>', 'Embedding cache directory', '.cache/simtasks/embeddings')
    .option('--embed-model <model>', 'Embedding model', 'nomic-embed-text:latest')
    .option('--no-jsdoc', 'Exclude JSDoc from embedding context')
    .option('--no-snippet', 'Exclude code snippets from embedding context')
    .action(async (options: Record<string, unknown>) => {
      await embed({
        input: options.input as string | undefined,
        out: options.out as string | undefined,
        embedModel: options.embedModel as string | undefined,
        includeJsdoc: options.jsdoc !== false,
        includeSnippet: options.snippet !== false,
      });
    });
  await program.parseAsync(process.argv);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runCli().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
