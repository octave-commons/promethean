import * as path from 'path';
import { pathToFileURL } from 'url';

import { z } from 'zod';
import { openLevelCache } from '@promethean-os/level-cache';
import { createPipelineProgram } from '@promethean-os/pipeline-core';
import { ollamaJSON } from '@promethean-os/utils';

import type { CodeBlock, Cluster, NamedGroup } from './types.js';

export type NameOptions = {
  blocks?: string;
  clusters?: string;
  out?: string;
  genModel?: string;
  baseDir?: string;
};

const GroupSchema = z.object({
  dir: z.string().min(1),
  files: z
    .array(
      z.object({
        id: z.string().min(1),
        filename: z.string().min(1),
      }),
    )
    .min(1),
  readme: z.string().min(1),
});

export async function assignNames(options: NameOptions = {}): Promise<void> {
  const blocksPath = path.resolve(options.blocks ?? '.cache/codepack/blocks');
  const clustersPath = path.resolve(options.clusters ?? '.cache/codepack/clusters');
  const outPath = path.resolve(options.out ?? '.cache/codepack/names');
  const model = options.genModel ?? 'qwen3:4b';
  const baseDir = options.baseDir ?? 'packages';

  const blockCache = await openLevelCache<CodeBlock>({ path: blocksPath, namespace: 'blocks' });
  const blocks: CodeBlock[] = [];
  for await (const [, block] of blockCache.entries()) blocks.push(block);
  await blockCache.close();

  const clusterCache = await openLevelCache<Cluster>({ path: clustersPath, namespace: 'clusters' });
  const clusters: Cluster[] = [];
  for await (const [, cluster] of clusterCache.entries()) clusters.push(cluster);
  await clusterCache.close();

  const byId = new Map(blocks.map((block) => [block.id, block]));
  const groups: NamedGroup[] = [];

  for (const c of clusters) {
    const items = c.memberIds
      .map((id, i) => {
        const block = byId.get(id)!;
        const hint = block.hintedName ? `HINT:${block.hintedName}` : '';
        return [
          `### ITEM ${i + 1}`,
          `ID: ${id}`,
          `LANG: ${block.lang ?? ''}`,
          hint ? `${hint}` : '',
          `SRC: ${block.relPath}:${block.startLine}-${block.endLine}`,
          `CONTEXT_BEFORE:\n${block.contextBefore.trim()}`,
          `CODE:\n${block.code.trim().slice(0, 4000)}`,
          `CONTEXT_AFTER:\n${block.contextAfter.trim()}`,
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n\n');

    const sys = [
      'You group code blocks into a coherent folder and filenames.',
      `Return ONLY JSON: { dir, files:[{id, filename}], readme }`,
      `dir MUST be a POSIX path relative to '${baseDir}', no leading slash.`,
      'Use lowercase kebab or package conventions. Filenames should be valid for the language.',
      'If two blocks belong to same file, pick one filename and include both ids under that filename with -partN suffixes (we will stitch later).',
    ].join('\n');

    const prompt = `SYSTEM:\n${sys}\n\nUSER:\nCLUSTER: ${c.id}\n${items}\n\nReturn JSON for this cluster.`;

    let obj: unknown;
    try {
      obj = await ollamaJSON(model, prompt);
    } catch {
      obj = {
        dir: `${baseDir}/group-${c.id}`,
        files: c.memberIds.map((id, index) => ({
          id,
          filename: `file-${index + 1}.txt`,
        })),
        readme: `# ${c.id}\n\nAuto grouped.\n`,
      } satisfies NamedGroup;
    }

    const fallbackGroup: Omit<NamedGroup, 'clusterId'> = {
      dir: `${baseDir}/group-${c.id}`,
      files: c.memberIds.map((id, index) => ({ id, filename: `file-${index + 1}.txt` })),
      readme: `# ${c.id}\n\nAuto grouped.\n`,
    };
    const parsed = GroupSchema.safeParse(obj);
    const normalized = parsed.success ? parsed.data : fallbackGroup;
    groups.push({ clusterId: c.id, ...normalized });
  }

  const nameCache = await openLevelCache<NamedGroup>({ path: outPath, namespace: 'names' });
  await nameCache.batch(
    groups.map((group) => ({ type: 'put' as const, key: group.clusterId, value: group })),
  );
  await nameCache.close();
  console.log(`named ${groups.length} groups -> ${path.relative(process.cwd(), outPath)}`);
}

async function runCli() {
  const program = createPipelineProgram(
    'codepack-name',
    'Generate directory and filename suggestions',
  );
  program
    .option('--blocks <path>', 'Block cache path', '.cache/codepack/blocks')
    .option('--clusters <path>', 'Cluster cache path', '.cache/codepack/clusters')
    .option('--out <path>', 'Output name cache path', '.cache/codepack/names')
    .option('--gen-model <name>', 'Generation model', 'qwen3:4b')
    .option('--base-dir <path>', 'Base directory for suggestions', 'packages')
    .action(async (options: Required<NameOptions>) => {
      await assignNames({
        blocks: options.blocks,
        clusters: options.clusters,
        out: options.out,
        genModel: options.genModel,
        baseDir: options.baseDir,
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
