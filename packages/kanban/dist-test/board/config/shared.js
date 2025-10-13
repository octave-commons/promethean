import path from 'node:path';
export const DEFAULT_CONFIG_BASENAME = 'promethean.kanban.json';
export const CONFIG_SEARCH_PATHS = Object.freeze([
    'docs/agile/tasks/promethean.kanban.json',
    'docs/agile/promethean.kanban.json',
    'docs/promethean.kanban.json',
    'promethean.kanban.json',
]);
export const MARKERS = Object.freeze(['pnpm-workspace.yaml', 'package.json', '.git']);
export const ENV_KEYS = {
    repo: 'KANBAN_REPO',
    config: 'KANBAN_CONFIG',
    tasksDir: 'KANBAN_TASKS_DIR',
    indexFile: 'KANBAN_INDEX_FILE',
    boardFile: 'KANBAN_BOARD_FILE',
    cachePath: 'KANBAN_CACHE_PATH',
    exts: 'KANBAN_EXTS',
    requiredFields: 'KANBAN_REQUIRED_FIELDS',
    statusValues: 'KANBAN_STATUS_VALUES',
    priorityValues: 'KANBAN_PRIORITY_VALUES',
};
export const ARG_KEYS = new Map([
    ['repo', 'repo'],
    ['config', 'config'],
    ['tasks-dir', 'tasksDir'],
    ['index-file', 'indexFile'],
    ['board-file', 'boardFile'],
    ['cache-path', 'cachePath'],
    ['exts', 'exts'],
    ['required-fields', 'requiredFields'],
    ['status-values', 'statusValues'],
    ['priority-values', 'priorityValues'],
]);
export const ARRAY_KEYS = Object.freeze(new Set(['exts', 'requiredFields', 'statusValues', 'priorityValues']));
export const resolveWithBase = (base, candidate) => path.isAbsolute(candidate) ? candidate : path.resolve(base, candidate);
export const parseList = (value) => typeof value === 'string'
    ? value
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    : [];
export const normalizeExts = (values) => values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => (value.startsWith('.') ? value.toLowerCase() : `.${value.toLowerCase()}`));
export const arrayHasKey = (key) => ARRAY_KEYS.has(key);
export const defaultConfigForRepo = (repo) => ({
    tasksDir: path.join(repo, 'docs', 'agile', 'tasks'),
    indexFile: path.join(repo, 'docs', 'agile', 'boards', 'index.jsonl'),
    boardFile: path.join(repo, 'docs', 'agile', 'boards', 'generated.md'),
    cachePath: path.join(repo, 'docs', 'agile', 'boards', '.cache'),
    exts: ['.md'],
    requiredFields: ['id', 'title', 'status', 'priority', 'owner', 'labels', 'created'],
    statusValues: ['open', 'doing', 'blocked', 'done', 'dropped'],
    priorityValues: ['low', 'medium', 'high', 'critical'],
    wipLimits: {
        icebox: 50,
        incoming: 10,
        accepted: 5,
        breakdown: 3,
        ready: 5,
        todo: 20,
        in_progress: 3,
        review: 2,
        document: 2,
        done: 100,
        rejected: 10,
    },
});
