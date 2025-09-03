// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import { parseArgs, writeText, readMaybe, slug } from "./utils.js";
import type { PromptChunk } from "./types.js";

const args = parseArgs({
  "--process": "docs/agile/Process.md",
  "--out": ".cache/boardrev/prompts.json",
  "--min-level": "2"
});

async function main() {
  const p = path.resolve(args["--process"]);
  const raw = await readMaybe(p);
  const chunks: PromptChunk[] = raw ? sliceByHeading(raw, Number(args["--min-level"])) : defaultPrompts();
  await writeText(path.resolve(args["--out"]), JSON.stringify({ prompts: chunks }, null, 2));
  console.log(`boardrev: prompts → ${args["--out"]} (${chunks.length})`);
}

function sliceByHeading(md: string, minLevel: number): PromptChunk[] {
  const lines = md.split(/\r?\n/);
  const out: PromptChunk[] = [];
  let cur: { heading: string; buf: string[] } | null = null;

  const flush = () => { if (cur) out.push({ heading: normalize(cur.heading), prompt: cur.buf.join("\n").trim() }); };

  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      const level = m[1].length;
      if (level >= minLevel) { flush(); cur = { heading: m[2].trim(), buf: [] }; continue; }
    }
    if (!cur) { cur = { heading: "general", buf: [] }; }
    cur.buf.push(line);
  }
  flush();
  return out;
}

function normalize(h: string) {
  const t = slug(h);
  if (/backlog/.test(t)) return "backlog";
  if (/todo|to-do|to_do/.test(t)) return "todo";
  if (/doing|in-progress/.test(t)) return "doing";
  if (/review|pr/.test(t)) return "review";
  if (/block/.test(t)) return "blocked";
  if (/done|complete/.test(t)) return "done";
  return t || "general";
}

function defaultPrompts(): PromptChunk[] {
  return [
    { heading: "backlog", prompt: "Triage scope and dependencies. Is this still relevant?" },
    { heading: "todo",    prompt: "Is the task actionable? Define next concrete step and owner." },
    { heading: "doing",   prompt: "Is work unblocked? Identify blockers and decision requests." },
    { heading: "review",  prompt: "What’s pending for approval/merge? List required checks." },
    { heading: "blocked", prompt: "List blockers, owners, and unblocking proposals." },
    { heading: "done",    prompt: "Confirm acceptance criteria and follow-ups; cleanup tasks." },
    { heading: "general", prompt: "Provide status and a crisp next action." }
  ];
}

main().catch(e => { console.error(e); process.exit(1); });
