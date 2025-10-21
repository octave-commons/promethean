import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { z } from 'zod';
import { openLevelCache } from '@promethean/level-cache';
import { ollamaJSON } from '@promethean/utils';

import { parseArgs } from './utils.js';
import type { FunctionInfo, Cluster, Plan } from './types.js';

export type PlanArgs = {
  '--scan'?: string;
  '--clusters'?: string;
  '--out'?: string;
  '--model'?: string;
  '--base-dir'?: string;
  '--force'?: string;
};

const PlanSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  canonicalPath: z.string().min(1),
  canonicalName: z.string().min(1),
  proposedSignature: z.string().optional(),
  risks: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
  acceptance: z.array(z.string()).optional(),
});

export async function plan(args: PlanArgs): Promise<void> {
  const SCAN = path.resolve(args['--scan'] ?? '.cache/simtasks/functions');
  const CLS = path.resolve(args['--clusters'] ?? '.cache/simtasks/clusters.json');
  const OUT = path.resolve(args['--out'] ?? '.cache/simtasks/plans.json');
  const model = args['--model'] ?? 'qwen3:4b';
  const baseDir = args['--base-dir'] ?? 'packages';
  const force = args['--force'] === 'true';

  const fnCache = await openLevelCache<FunctionInfo[]>({ path: SCAN });
  const functions = (await fnCache.get('functions')) ?? [];
  await fnCache.close();
  const clusters = JSON.parse(await fs.readFile(CLS, 'utf-8')) as Cluster[];

  const byId = new Map(functions.map((f) => [f.id, f]));
  const existing = ((await readJSON(OUT)) as Record<string, Plan> | undefined) || {};
  const plans: Record<string, Plan> = { ...existing };

  for (const c of clusters) {
    if (!force && plans[c.id]) continue;

    const members = c.memberIds.map((id) => byId.get(id)!);
    const bullets = members
      .map((m, i) =>
        [
          `### ITEM ${i + 1}`,
          `NAME: ${m.className ? m.className + '.' : ''}${m.name}`,
          `PACKAGE: ${m.pkgName}`,
          `FILE: ${m.fileRel}:${m.startLine}-${m.endLine}`,
          m.signature ? `SIGNATURE: ${m.signature}` : '',
          m.jsdoc ? `JSDOC:\n${m.jsdoc}` : '',
          `SNIPPET:\n${m.snippet.slice(0, 3000)}`,
        ]
          .filter(Boolean)
          .join('\n'),
      )
      .join('\n\n');

    const sys = [
      'You are designing a consolidation refactor task for duplicate/similar functions.',
      'Return ONLY JSON with keys: title, summary, canonicalPath, canonicalName, proposedSignature?, risks?, steps?, acceptance?',
      `canonicalPath MUST be a POSIX path under '${baseDir}' and end with a reasonable filename (e.g., packages/libs/core/src/strings/format.ts).`,
      'Make steps actionable and incremental. Keep risks short. Acceptance criteria 3-7 bullets.',
    ].join('\n');

    const prompt = `SYSTEM:\n${sys}\n\nUSER:\nCLUSTER ${c.id} (maxSim=${c.maxSim}, avgSim=${c.avgSim})\n\n${bullets}`;

    let obj: unknown;
    try {
      obj = await ollamaJSON(model, prompt);
    } catch {
      obj = {
        title: `Consolidate similar functions (${c.id})`,
        summary: 'Create a canonical implementation and replace callers.',
        canonicalPath: `${baseDir}/core/src/utility/${c.id}.ts`,
        canonicalName: 'canonicalFunction',
        risks: ['behavior drift', 'hidden callsites'],
        steps: ['create canonical file', 'write tests', 'migrate usages', 'remove duplicates'],
        acceptance: ['all tests pass', 'no duplicate definitions', 'callers use canonical api'],
      };
    }

    const parsed = PlanSchema.safeParse(obj);
    const plan = parsed.success
      ? (obj as Plan)
      : {
          title: `Consolidate ${c.id}`,
          summary: 'Consolidate similar functions into a single canonical implementation.',
          canonicalPath: `${baseDir}/core/src/${c.id}.ts`,
          canonicalName: 'canonicalFunction',
        };

    plans[c.id] = { clusterId: c.id, ...plan };
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(plans, null, 2), 'utf-8');
  console.log(
    `simtasks: planned ${Object.keys(plans).length} clusters -> ${path.relative(
      process.cwd(),
      OUT,
    )}`,
  );
}

async function readJSON(p: string): Promise<unknown | undefined> {
  try {
    return JSON.parse(await fs.readFile(p, 'utf-8'));
  } catch {
    return undefined;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = parseArgs({
    '--scan': '.cache/simtasks/functions',
    '--clusters': '.cache/simtasks/clusters.json',
    '--out': '.cache/simtasks/plans.json',
    '--model': 'qwen3:4b',
    '--base-dir': 'packages',
    '--force': 'false',
  });
  plan(args).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
