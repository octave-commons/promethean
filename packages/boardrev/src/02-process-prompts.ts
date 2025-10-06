import * as path from 'path';

import { slug, parseArgs, writeText, readMaybe, createLogger } from '@promethean/utils';
import type { PromptChunk } from './types.js';

const logger = createLogger({ service: 'boardrev' });

export async function processPrompts({
  process,
  out,
  minLevel,
}: Readonly<{
  process: string;
  out: string;
  minLevel: number;
}>): Promise<void> {
  const p = path.resolve(process);
  const raw = await readMaybe(p);
  const chunks: PromptChunk[] = raw ? sliceByHeading(raw, minLevel) : defaultPrompts();
  await writeText(path.resolve(out), JSON.stringify({ prompts: chunks }, null, 2));
  logger.info(`boardrev: prompts → ${out} (${chunks.length})`);
}

function sliceByHeading(md: string, minLevel: number): PromptChunk[] {
  const { out, cur } = md.split(/\r?\n/).reduce(
    (acc, line) => {
      const m = line.match(/^(#{1,6})\s+(.*)$/);
      if (m) {
        const level = m[1]?.length ?? 0;
        if (level >= minLevel) {
          const updated = acc.cur
            ? acc.out.concat({
                heading: normalize(acc.cur.heading),
                prompt: acc.cur.buf.join('\n').trim(),
              })
            : acc.out;
          return {
            out: updated,
            cur: { heading: (m[2] ?? '').trim(), buf: [] },
          };
        }
      }
      const cur = acc.cur ?? { heading: 'general', buf: [] };
      return {
        out: acc.out,
        cur: { heading: cur.heading, buf: [...cur.buf, line] },
      };
    },
    {
      out: [] as PromptChunk[],
      cur: null as { heading: string; buf: string[] } | null,
    },
  );

  return cur
    ? out.concat({
        heading: normalize(cur.heading),
        prompt: cur.buf.join('\n').trim(),
      })
    : out;
}

function normalize(h: string) {
  const t = slug(h);
  if (/backlog/.test(t)) return 'backlog';
  if (/todo|to-do|to_do/.test(t)) return 'todo';
  if (/doing|in-progress/.test(t)) return 'doing';
  if (/review|pr/.test(t)) return 'review';
  if (/block/.test(t)) return 'blocked';
  if (/done|complete/.test(t)) return 'done';
  return t || 'general';
}

function defaultPrompts(): PromptChunk[] {
  return [
    {
      heading: 'backlog',
      prompt: 'Triage scope and dependencies. Is this still relevant?',
    },
    {
      heading: 'todo',
      prompt: 'Is the task actionable? Define next concrete step and owner.',
    },
    {
      heading: 'doing',
      prompt: 'Is work unblocked? Identify blockers and decision requests.',
    },
    {
      heading: 'review',
      prompt: 'What’s pending for approval/merge? List required checks.',
    },
    {
      heading: 'blocked',
      prompt: 'List blockers, owners, and unblocking proposals.',
    },
    {
      heading: 'done',
      prompt: 'Confirm acceptance criteria and follow-ups; cleanup tasks.',
    },
    { heading: 'general', prompt: 'Provide status and a crisp next action.' },
  ];
}

if (import.meta.main) {
  const args = parseArgs({
    '--process': 'docs/agile/process.md',
    '--out': '.cache/boardrev/prompts.json',
    '--min-level': '2',
  });
  processPrompts({
    process: args['--process'],
    out: args['--out'],
    minLevel: Number(args['--min-level']),
  }).catch((e) => {
    logger.error((e as Error).message);
    process.exit(1);
  });
}
