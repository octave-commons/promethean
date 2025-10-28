import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { STATUS_ORDER, headerToStatus } from "@promethean-os/markdown/statuses.js";
import { loadKanbanConfig } from "./config.js";
const DEFAULT_SETTINGS_BLOCK = [
    "%% kanban:settings",
    "```",
    '{"kanban-plugin":"board","list-collapse":[false,false,true,false,false,false,false,false,false,false,false,true,false,false,false],"new-note-template":"docs/agile/templates/task.stub.template.md","new-note-folder":"docs/agile/tasks","metadata-keys":[{"metadataKey":"tags","label":"","shouldHideLabel":false,"containsMarkdown":false},{"metadataKey":"hashtags","label":"","shouldHideLabel":false,"containsMarkdown":false}]}',
    "```",
    "%%",
].join("\n");
const normalizeStatus = (rawStatus) => {
    const trimmed = rawStatus.trim();
    if (trimmed.length === 0) {
        return "#todo";
    }
    const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
    const normalized = withoutHash.trim().replace(/\s+/g, "-").toLowerCase();
    return `#${normalized}`;
};
const slugify = (value) => value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
const formatLabelTags = (labels) => labels
    .map(slugify)
    .filter((slug) => slug.length > 0)
    .filter((slug, index, all) => all.indexOf(slug) === index)
    .map((slug) => `#${slug}`);
const extractHeaderLabels = (existing) => existing
    .split(/\r?\n/)
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim())
    .filter((header) => header.length > 0)
    .reduce((acc, header) => {
    const status = headerToStatus(header);
    if (status.length === 0) {
        return acc;
    }
    return { ...acc, [status]: header };
}, {});
const extractSettingsBlock = (existing) => {
    if (existing.length === 0) {
        return undefined;
    }
    const lines = existing.split(/\r?\n/);
    const start = lines.findIndex((line) => {
        const normalized = line.trim().toLowerCase();
        return (normalized.startsWith("%%") && normalized.includes("kanban:settings"));
    });
    if (start < 0) {
        return undefined;
    }
    const endRelative = lines
        .slice(start + 1)
        .findIndex((line) => line.trim() === "%%");
    const end = endRelative >= 0 ? start + 1 + endRelative : undefined;
    const blockLines = typeof end === "number" ? lines.slice(start, end + 1) : lines.slice(start);
    const suffix = existing.endsWith("\n") ? "\n" : "";
    return `${blockLines.join("\n")}${suffix}`;
};
const headerForStatus = (status, headerLabels) => {
    const existing = headerLabels[status];
    if (typeof existing === "string" && existing.length > 0) {
        return existing;
    }
    const label = status
        .slice(1)
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    return label.length > 0 ? label : "Todo";
};
const formatTaskLine = (task, status) => {
    const segments = task.path.split(/\\|\//);
    const fileName = segments.at(-1) ?? task.path;
    const displayTitle = task.title.trim().length > 0
        ? task.title.trim()
        : fileName.replace(/\.md$/iu, "");
    const tags = [status, ...formatLabelTags(task.labels)];
    return `- [ ] [[${fileName}|${displayTitle}]] ${tags.join(" ")}`;
};
const groupTasks = (tasks) => tasks.reduce((acc, task) => {
    const status = normalizeStatus(task.status);
    const existing = acc[status] ?? [];
    return {
        ...acc,
        [status]: [...existing, task],
    };
}, {});
const compareTasks = (left, right) => left.title.localeCompare(right.title, undefined, {
    sensitivity: "base",
    numeric: true,
});
const insertTaskSorted = (acc, task) => {
    const index = acc.findIndex((candidate) => compareTasks(task, candidate) < 0);
    return index < 0
        ? [...acc, task]
        : [...acc.slice(0, index), task, ...acc.slice(index)];
};
const sortTasksList = (items) => items.reduce(insertTaskSorted, []);
const sortGroupedTasks = (grouped) => Object.keys(grouped).reduce((acc, status) => {
    const sorted = sortTasksList(grouped[status] ?? []);
    return { ...acc, [status]: sorted };
}, {});
const insertStringSorted = (acc, value) => {
    const index = acc.findIndex((candidate) => value.localeCompare(candidate) < 0);
    return index < 0
        ? [...acc, value]
        : [...acc.slice(0, index), value, ...acc.slice(index)];
};
const sortStrings = (values) => values.reduce(insertStringSorted, []);
const orderedStatuses = (grouped) => {
    const keys = Object.keys(grouped);
    const primary = STATUS_ORDER.filter((status) => keys.includes(status));
    const extras = sortStrings(keys.filter((status) => !STATUS_ORDER.includes(status)));
    return [...primary, ...extras];
};
const buildSections = (statuses, grouped, headerLabels) => statuses.flatMap((status) => {
    const items = grouped[status] ?? [];
    if (items.length === 0) {
        return [];
    }
    const header = `## ${headerForStatus(status, headerLabels)}`;
    const lines = items.map((task) => formatTaskLine(task, status));
    return [header, "", ...lines, ""];
});
const buildBoard = (tasks, existingBoard) => {
    const headerLabels = extractHeaderLabels(existingBoard);
    const grouped = sortGroupedTasks(groupTasks(tasks));
    const statuses = orderedStatuses(grouped);
    const sections = buildSections(statuses, grouped, headerLabels);
    const settings = extractSettingsBlock(existingBoard) ?? DEFAULT_SETTINGS_BLOCK;
    const lines = [
        "---",
        "",
        "kanban-plugin: board",
        "",
        "---",
        "",
        ...sections,
        settings.trimEnd(),
    ];
    return `${lines.join("\n")}\n`;
};
const readIndex = async (indexFile) => {
    const data = await readFile(indexFile, "utf8").catch(() => "");
    return data
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line));
};
const readBoard = async (boardFile) => readFile(boardFile, "utf8").catch(() => "");
const ensureBoardDir = async (boardFile) => {
    const dir = path.dirname(boardFile);
    await mkdir(dir, { recursive: true });
};
const toJson = (value) => JSON.stringify(value, null, 2);
const applyBoard = async ({ board, existingBoard, tasks, boardFile, repoRoot, }) => {
    const relativeBoard = path.relative(repoRoot, boardFile);
    if (board === existingBoard) {
        console.log(toJson({
            applied: false,
            reason: "board-up-to-date",
            boardFile: relativeBoard,
            tasks: tasks.length,
        }));
        return;
    }
    await ensureBoardDir(boardFile);
    await writeFile(boardFile, board, "utf8");
    console.log(toJson({
        applied: true,
        boardFile: relativeBoard,
        tasks: tasks.length,
    }));
};
const runDry = (board, tasks, boardFile, repoRoot) => {
    const relativeBoard = path.relative(repoRoot, boardFile);
    process.stdout.write(board);
    console.error(toJson({
        dryRun: true,
        boardFile: relativeBoard,
        tasks: tasks.length,
    }));
};
const runProjector = async (apply, config) => {
    const tasks = await readIndex(config.indexFile);
    if (tasks.length === 0) {
        console.error("No index found. Run: pnpm tsx packages/kanban/src/board/indexer.ts --write");
        process.exit(1);
    }
    const existingBoard = await readBoard(config.boardFile);
    const board = buildBoard(tasks, existingBoard);
    if (apply) {
        await applyBoard({
            board,
            existingBoard,
            tasks,
            boardFile: config.boardFile,
            repoRoot: config.repo,
        });
        return;
    }
    runDry(board, tasks, config.boardFile, config.repo);
};
const main = async () => {
    const { config, restArgs } = await loadKanbanConfig();
    const apply = restArgs.includes("--apply");
    await runProjector(apply, config);
};
main().catch((error) => {
    const message = error instanceof Error ? error : new Error(String(error));
    console.error(message);
    process.exit(1);
});
//# sourceMappingURL=projector.js.map