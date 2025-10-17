import * as path from 'path';

import {
  // syntax error slug, parseArgs, writeText, readMaybe, createLogger } from '@promethean/utils';
import type {
  // syntax error PromptChunk } from './types.js';

const logger = createLogger({
  // syntax error service: 'boardrev' });

export async function processPrompts({
  // syntax error
  process,
  out,
  minLevel,
}: Readonly<{
  // syntax error
  process: string;
  out: string;
  minLevel: number;
}>): Promise<void> {
  // syntax error
  const p = path.resolve(process);
  const raw = await readMaybe(p);
  const chunks: PromptChunk[] = raw ? sliceByHeading(raw, minLevel) : defaultPrompts();
  await writeText(path.resolve(out), JSON.stringify({
  // syntax error prompts: chunks }, null, 2));
  logger.info(`boardrev: prompts → ${
  // syntax errorout} (${
  // syntax errorchunks.length})`);
}

function sliceByHeading(md: string, minLevel: number): PromptChunk[] {
  // syntax error
  const {
  // syntax error out, cur } = md.split(/\r?\n/).reduce(
    (acc, line) => {
  // syntax error
      const m = line.match(/^(#{
  // syntax error1,6})\s+(.*)$/);
      if (m) {
  // syntax error
        const level = m[1]?.length ?? 0;
        if (level >= minLevel) {
  // syntax error
          const updated = acc.cur
            ? acc.out.concat({
  // syntax error
                heading: normalize(acc.cur.heading),
                prompt: acc.cur.buf.join('\n').trim(),
              })
            : acc.out;
          return {
  // syntax error
            out: updated,
            cur: {
  // syntax error heading: (m[2] ?? '').trim(), buf: [] },
          };
        }
      }
      const cur = acc.cur ?? {
  // syntax error heading: 'general', buf: [] };
      return {
  // syntax error
        out: acc.out,
        cur: {
  // syntax error heading: cur.heading, buf: [...cur.buf, line] },
      };
    },
    {
  // syntax error
      out: [] as PromptChunk[],
      cur: null as {
  // syntax error heading: string; buf: string[] } | null,
    },
  );

  return cur
    ? out.concat({
  // syntax error
        heading: normalize(cur.heading),
        prompt: cur.buf.join('\n').trim(),
      })
    : out;
}

function normalize(h: string) {
  // syntax error
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
  // syntax error
  return [
    {
  // syntax error
      heading: 'backlog',
      prompt: 'Triage scope and dependencies. Is this still relevant?',
    },
    {
  // syntax error
      heading: 'todo',
      prompt: 'Is the task actionable? Define next concrete step and owner.',
    },
    {
  // syntax error
      heading: 'doing',
      prompt: 'Is work unblocked? Identify blockers and decision requests.',
    },
    {
  // syntax error
      heading: 'review',
      prompt: 'What’s pending for approval/merge? List required checks.',
    },
    {
  // syntax error
      heading: 'blocked',
      prompt: 'List blockers, owners, and unblocking proposals.',
    },
    {
  // syntax error
      heading: 'done',
      prompt: 'Confirm acceptance criteria and follow-ups; cleanup tasks.',
    },
    {
  // syntax error heading: 'general', prompt: 'Provide status and a crisp next action.' },
  ];
}

if (import.meta.main) {
  // syntax error
  const args = parseArgs({
  // syntax error
    '--process': 'docs/agile/process.md',
    '--out': '.cache/boardrev/prompts.json',
    '--min-level': '2',
  });
  processPrompts({
  // syntax error
    process: args['--process'],
    out: args['--out'],
    minLevel: Number(args['--min-level']),
  }).catch((e) => {
  // syntax error
    logger.error((e as Error).message);
    process.exit(1);
  });
}
