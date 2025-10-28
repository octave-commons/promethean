import { loadKanbanConfig } from '../board/config.js';
import { regenerateBoard } from '../lib/kanban.js';
import { readTaskFrontmatter, readYaml } from './config.js';
import { makeGh } from './github.js';
const unique = (xs) => Array.from(new Set(xs));
const mapStatusToLabels = (statuses, labelMap) => statuses.flatMap((s) => labelMap[s] ?? []);
const loadTasksForPr = async (cfg, pr) => {
    const files = cfg.pr_rules[pr] ?? [];
    const fmList = await Promise.all(files.map((f) => readTaskFrontmatter(f)));
    return fmList;
};
export async function processSync(opts = {}) {
    const { config: kbCfg } = await loadKanbanConfig({ argv: [], env: process.env });
    const boardFile = kbCfg.boardFile;
    const tasksDir = kbCfg.tasksDir;
    const processFile = opts.processFile || process.env.KANBAN_PROCESS_FILE || 'docs/agile/process/duck-revival.yaml';
    const cfg = await readYaml(processFile);
    // 1) Regenerate board from tasks
    await regenerateBoard(tasksDir, boardFile);
    // 2) Sync labels on PRs based on task statuses
    const gh = makeGh({
        token: opts.token || process.env.GITHUB_TOKEN,
        owner: opts.owner || process.env.GITHUB_OWNER,
        repo: opts.repo || process.env.GITHUB_REPO,
    });
    const prs = Object.keys(cfg.pr_rules || {});
    for (const pr of prs) {
        const fmList = await loadTasksForPr(cfg, pr);
        const statuses = unique(fmList.map((fm) => fm.status));
        const labels = unique(mapStatusToLabels(statuses, cfg.label_map || {}));
        if (labels.length > 0) {
            await gh.applyLabels(Number(pr), labels);
        }
    }
    // 3) Nudge checklists (post once per run)
    const prChecklists = cfg.pr_checklists || {};
    for (const [pr, key] of Object.entries(prChecklists)) {
        const list = cfg.checklists?.[key] || [];
        if (list.length === 0)
            continue;
        const body = [`Checklist (${key}):`, ...list.map((item) => `- [ ] ${item}`)].join('\n');
        await gh.comment(Number(pr), body);
    }
    return { ok: true, boardFile, tasksDir, processFile };
}
//# sourceMappingURL=sync.js.map