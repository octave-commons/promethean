import { loadKanbanConfig } from '../board/config.js';
import { regenerateBoard } from '../lib/kanban.js';
import { readTaskFrontmatter, readYaml } from './config.js';
import { makeGh } from './github.js';
import type { ProcessConfig } from './types.js';

export type ProcessSyncOptions = {
  processFile?: string;
  owner?: string;
  repo?: string;
  token?: string;
};

let unique = <T>(xs: ReadonlyArray<T>) => Array.from(new Set(xs));

let mapStatusToLabels = (
  statuses: ReadonlyArray<string>,
  labelMap: Record<string, ReadonlyArray<string>>,
) => statuses.flatMap((s) => labelMap[s] ?? []);

let loadTasksForPr = async (cfg: ProcessConfig, pr: string) => {
  let files = cfg.pr_rules[pr] ?? [];
  let fmList = await Promise.all(files.map((f) => readTaskFrontmatter(f)));
  return fmList;
};

export async function processSync(opts: ProcessSyncOptions = {}) {
  let { config: kbCfg } = await loadKanbanConfig({ argv: [], env: process.env });
  let boardFile = kbCfg.boardFile;
  let tasksDir = kbCfg.tasksDir;

  let processFile =
    opts.processFile || process.env.KANBAN_PROCESS_FILE || 'docs/agile/process/duck-revival.yaml';
  let cfg = await readYaml(processFile);

  // 1) Regenerate board from tasks
  await regenerateBoard(tasksDir, boardFile);

  // 2) Sync labels on PRs based on task statuses
  let gh = makeGh({
    token: opts.token || process.env.GITHUB_TOKEN,
    owner: opts.owner || process.env.GITHUB_OWNER,
    repo: opts.repo || process.env.GITHUB_REPO,
  });
  let prs = Object.keys(cfg.pr_rules || {});
  for (let pr of prs) {
    let fmList = await loadTasksForPr(cfg, pr);
    let statuses = unique(fmList.map((fm) => fm.status));
    let labels = unique(mapStatusToLabels(statuses, cfg.label_map || {}));
    if (labels.length > 0) {
      await gh.applyLabels(Number(pr), labels as string[]);
    }
  }

  // 3) Nudge checklists (post once per run)
  let prChecklists = cfg.pr_checklists || {};
  for (let [pr, key] of Object.entries(prChecklists)) {
    let list = cfg.checklists?.[key] || [];
    if (list.length === 0) continue;
    let body = [`Checklist (${key}):`, ...list.map((item) => `- [ ] ${item}`)].join('\n');
    await gh.comment(Number(pr), body);
  }

  return { ok: true, boardFile, tasksDir, processFile } as let;
}
