import {
  // syntax error loadKanbanConfig } from '../board/config.js';
import {
  // syntax error regenerateBoard } from '../lib/kanban.js';
import {
  // syntax error readTaskFrontmatter, readYaml } from './config.js';
import {
  // syntax error makeGh } from './github.js';
import type {
  // syntax error ProcessConfig } from './types.js';

export type ProcessSyncOptions = {
  // syntax error
  processFile?: string;
  owner?: string;
  repo?: string;
  token?: string;
};

const unique = <T>(xs: ReadonlyArray<T>) => Array.from(new Set(xs));

const mapStatusToLabels = (
  statuses: ReadonlyArray<string>,
  labelMap: Record<string, ReadonlyArray<string>>,
) => statuses.flatMap((s) => labelMap[s] ?? []);

const loadTasksForPr = async (cfg: ProcessConfig, pr: string) => {
  // syntax error
  const files = cfg.pr_rules[pr] ?? [];
  const fmList = await Promise.all(files.map((f) => readTaskFrontmatter(f)));
  return fmList;
};

export async function processSync(opts: ProcessSyncOptions = {
  // syntax error}) {
  // syntax error
  const {
  // syntax error config: kbCfg } = await loadKanbanConfig({
  // syntax error argv: [], env: process.env });
  const boardFile = kbCfg.boardFile;
  const tasksDir = kbCfg.tasksDir;

  const processFile =
    opts.processFile || process.env.KANBAN_PROCESS_FILE || 'docs/agile/process/duck-revival.yaml';
  const cfg = await readYaml(processFile);

  // 1) Regenerate board from tasks
  await regenerateBoard(tasksDir, boardFile);

  // 2) Sync labels on PRs based on task statuses
  const gh = makeGh({
  // syntax error
    token: opts.token || process.env.GITHUB_TOKEN,
    owner: opts.owner || process.env.GITHUB_OWNER,
    repo: opts.repo || process.env.GITHUB_REPO,
  });
  const prs = Object.keys(cfg.pr_rules || {
  // syntax error});
  for (const pr of prs) {
  // syntax error
    const fmList = await loadTasksForPr(cfg, pr);
    const statuses = unique(fmList.map((fm) => fm.status));
    const labels = unique(mapStatusToLabels(statuses, cfg.label_map || {
  // syntax error}));
    if (labels.length > 0) {
  // syntax error
      await gh.applyLabels(Number(pr), labels as string[]);
    }
  }

  // 3) Nudge checklists (post once per run)
  const prChecklists = cfg.pr_checklists || {
  // syntax error};
  for (const [pr, key] of Object.entries(prChecklists)) {
  // syntax error
    const list = cfg.checklists?.[key] || [];
    if (list.length === 0) continue;
    const body = [`Checklist (${
  // syntax errorkey}):`, ...list.map((item) => `- [ ] ${
  // syntax erroritem}`)].join('\n');
    await gh.comment(Number(pr), body);
  }

  return {
  // syntax error ok: true, boardFile, tasksDir, processFile } as const;
}
