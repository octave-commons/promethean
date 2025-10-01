import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { parseFrontmatter as parseMarkdownFrontmatter } from "@promethean/markdown/frontmatter";
import { loadKanbanConfig } from "../board/config.js";
import { refreshTaskIndex } from "../board/indexer.js";
import type { Board, ColumnData, Task } from "./types.js";

const NOW_ISO = () => new Date().toISOString();

const stripDiacritics = (value: string): string =>
  value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

const sanitizeFileNameBase = (value: string): string => {
  const normalized = stripDiacritics(value)
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/[<>:"/\\|?*]/g, " ")
    .replace(/\r?\n/g, " ")
    .trim();
  const singleSpaced = normalized.replace(/\s{2,}/g, " ");
  return singleSpaced.replace(/\.$/, "");
};

const STOPWORDS = new Set<string>([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "using",
  "your",
  "their",
  "about",
  "after",
  "before",
  "into",
  "onto",
  "under",
  "over",
  "todo",
  "task",
  "auto",
]);

const stripTrailingCount = (value: string): string =>
  value.replace(/\s*\(\s*\d+\s*\)\s*$/g, "").trim();

const normalizeColumnDisplayName = (value: string): string => {
  const trimmed = stripTrailingCount(value.trim());
  return trimmed.length > 0 ? trimmed : "Todo";
};

const columnKey = (name: string): string =>
  normalizeColumnDisplayName(name)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const tokenizeForLabels = (text: string): ReadonlyArray<string> =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));

const generateAutoLabels = (
  title: string,
  body: string | undefined,
  limit = 4,
): ReadonlyArray<string> => {
  const tokens = new Map<string, number>();
  const addTokens = (source: string, weight: number) => {
    for (const token of tokenizeForLabels(source)) {
      tokens.set(token, (tokens.get(token) ?? 0) + weight);
    }
  };
  addTokens(title, 3);
  if (body) {
    addTokens(body.slice(0, 500), 1);
  }
  const sorted = Array.from(tokens.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token.replace(/\s+/g, "-"));
  return sorted.slice(0, limit);
};

const ensureLabelsPresent = (task: Task, body: string | undefined): Task => {
  if (task.labels && task.labels.length > 0) {
    return task;
  }
  const generated = generateAutoLabels(task.title ?? "", body);
  if (generated.length === 0) {
    return task;
  }
  return { ...task, labels: [...generated] };
};

const FALLBACK_SLUG_REGEX = /^task [0-9a-f]{8}(?: \d+)?$/i;

const isFallbackSlug = (slug: string, uuid: string): boolean => {
  const normalizedSlug = slug.trim().toLowerCase();
  const normalizedUuid = uuid.replace(/[^0-9a-f]/gi, "").toLowerCase();
  return (
    FALLBACK_SLUG_REGEX.test(normalizedSlug) ||
    normalizedSlug.replace(/\s+/g, "") === normalizedUuid
  );
};

const fallbackFileBase = (uuid: string): string => `Task ${uuid.slice(0, 8)}`;

const resolveTaskSlug = (task: Task, baseName: string): string => {
  const sanitizedBase = sanitizeFileNameBase(baseName);
  const explicitSlug =
    typeof task.slug === "string" && task.slug.trim().length > 0
      ? task.slug.trim()
      : undefined;
  const fallbackSource =
    sanitizedBase.length > 0 ? sanitizedBase : task.title ?? sanitizedBase;
  const slugSource = explicitSlug ?? fallbackSource;
  const normalized = sanitizeFileNameBase(slugSource ?? "");
  if (normalized.length > 0) {
    return normalized;
  }
  return fallbackFileBase(task.uuid);
};

const deriveFileBaseFromTask = (task: Task): string => {
  const fromSlug =
    typeof task.slug === "string" ? sanitizeFileNameBase(task.slug) : "";
  if (fromSlug.length > 0 && !isFallbackSlug(fromSlug, task.uuid)) {
    return fromSlug;
  }
  const fromTitle = sanitizeFileNameBase(task.title ?? "");
  if (fromTitle.length > 0) {
    return fromTitle;
  }
  return fallbackFileBase(task.uuid);
};

const ensureTaskFileBase = (task: Task): string => {
  const base = deriveFileBaseFromTask(task);
  if (!task.slug || task.slug !== base) {
    task.slug = base;
  }
  return base;
};

const slugMatchesSourcePath = (task: Task): boolean => {
  if (!task.sourcePath) {
    return false;
  }
  const normalizedSlug =
    typeof task.slug === "string" && task.slug.length > 0
      ? sanitizeFileNameBase(task.slug)
      : "";
  if (normalizedSlug.length === 0) {
    return false;
  }
  const normalizedSource = sanitizeFileNameBase(
    path.basename(task.sourcePath, path.extname(task.sourcePath)),
  );
  return normalizedSource.length > 0 && normalizedSlug === normalizedSource;
};

const ensureUniqueFileBase = (
  base: string,
  used: Map<string, string>,
  uuid: string,
): string => {
  const initial = base.length > 0 ? base : fallbackFileBase(uuid);
  let candidate = initial;
  let attempt = 1;
  while (used.has(candidate) && used.get(candidate) !== uuid) {
    attempt += 1;
    candidate = `${initial} ${attempt}`;
  }
  return candidate;
};

const mergeColumnsCaseInsensitive = (columns: ColumnData[]): ColumnData[] => {
  const merged = new Map<string, ColumnData>();
  for (const column of columns) {
    const displayName = normalizeColumnDisplayName(column.name);
    const key = columnKey(column.name);
    const normalizedTasks = column.tasks.map((task) => ({
      ...task,
      status: displayName,
    }));
    const existing = merged.get(key);
    if (existing) {
      const seenTasks = new Set(existing.tasks.map((task) => task.uuid));
      for (const task of normalizedTasks) {
        if (!seenTasks.has(task.uuid)) {
          existing.tasks.push(task);
          seenTasks.add(task.uuid);
        }
      }
      existing.count = existing.tasks.length;
      if (existing.limit == null && column.limit != null) {
        existing.limit = column.limit;
      }
      if (existing.name.length === 0 && displayName.length > 0) {
        existing.name = displayName;
      }
    } else {
      merged.set(key, {
        name: displayName,
        count: normalizedTasks.length,
        limit: column.limit,
        tasks: [...normalizedTasks],
      });
    }
  }
  return Array.from(merged.values()).map((col) => ({
    ...col,
    name: normalizeColumnDisplayName(col.name),
    count: col.tasks.length,
  }));
};

const parseLimit = (header: string): number | null => {
  // look for "(limit 3)" or "[wip:3]" or "# wip=3"
  const match =
    header.match(/\((?:wip|limit)\s*[:=]\s*(\d+)\)/i) ??
    header.match(/\[\s*(?:wip|limit)\s*[:=]\s*(\d+)\s*\]/i) ??
    header.match(/(?:wip|limit)\s*[:=]\s*(\d+)/i);
  const numeric = match?.[1];
  return typeof numeric === "string" ? parseInt(numeric, 10) : null;
};

const parseColumnsFromMarkdown = (markdown: string): ColumnData[] => {
  const lines = markdown.split(/\r?\n/);

  const columns: ColumnData[] = [];
  let current: ColumnData | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (typeof line !== "string") {
      continue;
    }

    const headingMatch = /^##\s+(.+)$/.exec(line);
    const headingValue = headingMatch?.[1];
    if (typeof headingValue === "string") {
      const name = headingValue.trim();
      const limit = parseLimit(name);
      current = { name, count: 0, limit, tasks: [] };
      columns.push(current);
      continue;
    }

    if (!current) continue;

    // list item like "- [ ] Title #label (uuid:xxx)"
    const taskMatch = /^-\s+\[(x|\s)\]\s+(.+)$/.exec(line);
    const doneFlag = taskMatch?.[1];
    const rawTitle = taskMatch?.[2];
    if (typeof doneFlag === "string" && typeof rawTitle === "string") {
      const titlePart = rawTitle.trim();
      const uuidMatch = /\(uuid:([0-9a-fA-F-]{8,})\)/.exec(titlePart);
      const uuidCandidate = uuidMatch?.[1];
      const uuid =
        typeof uuidCandidate === "string" ? uuidCandidate : cryptoRandomUUID();
      const wikiMatch = /\[\[([^\]]+)\]\]/.exec(titlePart);
      let linkTarget: string | undefined;
      let displayFromWiki: string | undefined;
      if (wikiMatch) {
        const targetRaw = wikiMatch[1] ?? "";
        const [targetSlug, alias] = targetRaw.split("|", 2);
        const normalizedTarget = (targetSlug ?? "").trim();
        if (normalizedTarget.length > 0) {
          linkTarget = sanitizeFileNameBase(normalizedTarget);
        }
        const displayCandidate = (alias ?? targetSlug)?.trim();
        if (displayCandidate && displayCandidate.length > 0) {
          displayFromWiki = displayCandidate;
        }
      }
      const labels = Array.from(titlePart.matchAll(/#([\w-]+)/g))
        .map((match) => match[1])
        .filter(
          (label): label is string =>
            typeof label === "string" && label.length > 0,
        );
      const prioMatch = titlePart.match(/\bprio[:=]([^\s)]+)\b/i);
      const priority = prioMatch?.[1];
      const titleClean = titlePart
        .replace(/\(uuid:[^)]+\)/g, "")
        .replace(/\[\[[^\]]+\]\]/g, displayFromWiki ?? "")
        .replace(/#\w+/g, "")
        .replace(/\bprio[:=][^\s)]+\b/gi, "")
        .trim();
      const title =
        titleClean.length > 0
          ? titleClean
          : displayFromWiki ?? linkTarget ?? `Task ${uuid.slice(0, 8)}`;

      const done = doneFlag === "x";
      const status = done ? "Done" : current.name;

      const task: Task = {
        uuid,
        title,
        status,
        priority,
        labels,
        created_at: NOW_ISO(),
        estimates: {},
        content: "",
        slug: linkTarget,
      };
      current.tasks.push(task);
      current.count += 1;
      continue;
    }
  }
  return mergeColumnsCaseInsensitive(columns);
};

const cryptoRandomUUID = (): string => randomUUID();

type FM = Record<string, any>;

type CreateTaskInput = {
  title: string;
  content?: string;
  body?: string;
  labels?: string[];
  priority?: Task["priority"];
  estimates?: Task["estimates"];
  created_at?: string;
  uuid?: string;
  slug?: string;
  templatePath?: string;
  defaultTemplatePath?: string;
  blocking?: string[];
  blockedBy?: string[];
};

const parseFrontmatter = (text: string): { fm: FM; body: string } => {
  const res = parseMarkdownFrontmatter<FM>(text);
  return { fm: (res.data ?? {}) as FM, body: res.content || "" };
};

const coerceString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return undefined;
};

const pickString = (
  source: FM,
  keys: ReadonlyArray<string>,
): string | undefined => {
  for (const key of keys) {
    const candidate = coerceString((source as Record<string, unknown>)[key]);
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
};

const parseLabelList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => coerceString(entry))
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
  const text = coerceString(value);
  if (!text) {
    return [];
  }
  return text
    .split(/[,\s]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const mergeLabels = (...values: unknown[]): string[] => {
  const merged = new Set<string>();
  for (const value of values) {
    for (const entry of parseLabelList(value)) {
      merged.add(entry);
    }
  }
  return Array.from(merged);
};

const taskFromFM = (fm: FM, body: string): Task | null => {
  const uuid = pickString(fm, ["uuid", "id", "task-id", "task_id", "taskId"]);
  const title = pickString(fm, ["title", "name"]);
  if (!uuid || !title) return null;
  const slugValue = pickString(fm, ["slug"]);
  const t: Task = {
    uuid,
    title,
    status:
      pickString(fm, ["status", "state", "column"]) ??
      String(fm.status ?? "Todo"),
    priority:
      typeof fm.priority === "number"
        ? fm.priority
        : pickString(fm, ["priority", "prio"]),
    labels: mergeLabels(fm.labels, fm.tags, fm.hashtags),
    created_at:
      pickString(fm, ["created_at", "created", "txn"]) ??
      fm.created_at ??
      NOW_ISO(),
    estimates: fm.estimates ?? {},
    content: (body ?? "").trim() || undefined,
    slug: slugValue ? sanitizeFileNameBase(slugValue) : undefined,
  };
  return t;
};

const listFiles = async (dir: string): Promise<string[]> => {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => `${dir}/${e.name}`);
  } catch {
    return [];
  }
};

const readTasksFolder = async (dir: string): Promise<Task[]> => {
  const files = await listFiles(dir);
  const tasks: Task[] = [];
  for (const file of files) {
    if (!(file.endsWith(".md") || file.endsWith(".json"))) continue;
    const text = await fs.readFile(file, "utf8");
    if (file.endsWith(".json")) {
      try {
        const data = JSON.parse(text);
        if (data && data.uuid && data.title) {
          const parsed = data as Task;
          const enriched = ensureLabelsPresent(parsed, parsed.content);
          const baseName = path.basename(file, path.extname(file));
          const normalizedSlug = resolveTaskSlug(enriched, baseName);
          tasks.push({ ...enriched, slug: normalizedSlug, sourcePath: file });
        }
      } catch {}
    } else {
      try {
        const normalized = normalizeFrontmatterForParsing(text);
        const { fm, body } = parseFrontmatter(normalized);
        const parsedTask = taskFromFM(fm, body);
        if (parsedTask) {
          const enriched = ensureLabelsPresent(parsedTask, body);
          const baseName = path.basename(file, path.extname(file));
          const normalizedSlug = resolveTaskSlug(enriched, baseName);
          tasks.push({ ...enriched, slug: normalizedSlug, sourcePath: file });
        }
      } catch (error) {
        console.error(
          `Failed to parse frontmatter for ${file}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        const fallback = fallbackTaskFromRaw(file, text);
        if (fallback) {
          tasks.push(fallback);
        }
      }
    }
  }
  return tasks;
};

export const loadBoard = async (
  boardPath: string,
  tasksDir: string,
): Promise<Board> => {
  const md = await fs.readFile(boardPath, "utf8").catch(() => "");
  const columns = parseColumnsFromMarkdown(md);
  if (columns.length > 0) return { columns } as Board;

  // if the board is empty or missing, synthesize from tasks folder
  const tasks = await readTasksFolder(tasksDir);
  const statusGroups = new Map<string, { name: string; tasks: Task[] }>();
  for (const task of tasks) {
    const statusRaw = String(task.status || "Todo").trim();
    const displayName = normalizeColumnDisplayName(statusRaw);
    const key = columnKey(statusRaw);
    const existing = statusGroups.get(key);
    if (existing) {
      existing.tasks.push({ ...task, status: existing.name });
    } else {
      statusGroups.set(key, {
        name: displayName,
        tasks: [{ ...task, status: displayName }],
      });
    }
  }
  const cols: ColumnData[] = Array.from(statusGroups.values()).map(
    ({ name, tasks: ts }) => ({
      name,
      count: ts.length,
      limit: null,
      tasks: ts,
    }),
  );
  return { columns: cols };
};

export const countTasks = (board: Board, column?: string): number => {
  if (!column) return board.columns.reduce((acc, c) => acc + c.count, 0);
  const targetKey = columnKey(column);
  const c = board.columns.find((col) => columnKey(col.name) === targetKey);
  return c ? c.count : 0;
};

export const getColumn = (board: Board, column: string): ColumnData => {
  const targetKey = columnKey(column);
  const c = board.columns.find((col) => columnKey(col.name) === targetKey);
  if (c) {
    c.name = normalizeColumnDisplayName(c.name);
    return c;
  }
  return {
    name: normalizeColumnDisplayName(column),
    count: 0,
    limit: null,
    tasks: [],
  };
};

export const getTasksByColumn = (board: Board, column: string): Task[] =>
  getColumn(board, column).tasks;

export const findTaskById = (board: Board, uuid: string): Task | undefined => {
  for (const col of board.columns) {
    const t = col.tasks.find((t) => t.uuid === uuid);
    if (t) return t;
  }
  return undefined;
};

export const findTaskByTitle = (
  board: Board,
  title: string,
): Task | undefined => {
  const needle = title.trim().toLowerCase();
  for (const col of board.columns) {
    const t = col.tasks.find((t) => t.title.trim().toLowerCase() === needle);
    if (t) return t;
  }
  return undefined;
};

const ensureColumn = (board: Board, column: string): ColumnData => {
  const key = columnKey(column);
  let existing = board.columns.find((col) => columnKey(col.name) === key);
  if (!existing) {
    existing = {
      name: normalizeColumnDisplayName(column),
      count: 0,
      limit: null,
      tasks: [],
    };
    board.columns = [...board.columns, existing];
  } else if (existing.name !== normalizeColumnDisplayName(existing.name)) {
    existing.name = normalizeColumnDisplayName(existing.name);
  }
  return existing;
};

const locateTask = (
  board: Board,
  uuid: string,
): { column: ColumnData; index: number; task: Task } | undefined => {
  for (const column of board.columns) {
    const index = column.tasks.findIndex((task) => task.uuid === uuid);
    if (index >= 0) {
      return { column, index, task: column.tasks[index]! };
    }
  }
  return undefined;
};

const resolveTaskFilePath = async (
  task: Task | undefined,
  tasksDir: string,
): Promise<string | undefined> => {
  if (!task) return undefined;
  if (!tasksDir) return undefined;
  if (task.sourcePath) {
    return task.sourcePath;
  }
  if (task.slug) {
    const candidate = path.join(tasksDir, `${task.slug}.md`);
    try {
      await fs.access(candidate);
      return candidate;
    } catch {}
  }
  const tasks = await readTasksFolder(tasksDir).catch(() => [] as Task[]);
  const match = tasks.find((entry) => entry.uuid === task.uuid);
  return match?.sourcePath;
};

const assignStableSlugs = (columns: ColumnData[]): Map<string, string> => {
  const ordered: { task: Task; locked: boolean; order: number }[] = [];
  let order = 0;
  for (const column of columns) {
    for (const task of column.tasks) {
      ordered.push({ task, locked: slugMatchesSourcePath(task), order });
      order += 1;
    }
  }
  ordered.sort((a, b) => {
    if (a.locked === b.locked) {
      return a.order - b.order;
    }
    return a.locked ? -1 : 1;
  });
  const used = new Map<string, string>();
  const finalSlugs = new Map<string, string>();
  for (const entry of ordered) {
    const baseName = ensureTaskFileBase(entry.task);
    const uniqueBase = ensureUniqueFileBase(baseName, used, entry.task.uuid);
    finalSlugs.set(entry.task.uuid, uniqueBase);
    used.set(uniqueBase, entry.task.uuid);
  }
  return finalSlugs;
};

const serializeBoard = (board: Board): string => {
  const lines: string[] = ["---", "kanban-plugin: board", "---", ""];
  const columns = mergeColumnsCaseInsensitive(board.columns);
  const finalSlugs = assignStableSlugs(columns);
  for (const col of columns) {
    lines.push(`## ${col.name}`);
    lines.push("");
    for (const task of col.tasks) {
      const done = /done/i.test(col.name) ? "x" : " ";
      const linkTarget = finalSlugs.get(task.uuid) ?? ensureTaskFileBase(task);
      if (task.slug !== linkTarget) {
        task.slug = linkTarget;
      }
      const displayTitle =
        task.title.trim().length > 0 ? task.title.trim() : linkTarget;
      const wikiLink =
        displayTitle === linkTarget
          ? `[[${linkTarget}]]`
          : `[[${linkTarget}|${displayTitle}]]`;
      const labelSegment =
        (task.labels ?? []).length > 0
          ? (task.labels ?? []).map((label) => `#${label}`).join(" ")
          : "";
      const priorityValue =
        typeof task.priority === "number" || typeof task.priority === "string"
          ? String(task.priority).trim()
          : "";
      const prioritySegment =
        priorityValue.length > 0 ? `prio:${priorityValue}` : "";
      const segments = [`- [${done}]`, wikiLink];
      if (labelSegment.length > 0) {
        segments.push(labelSegment);
      }
      if (prioritySegment.length > 0) {
        segments.push(prioritySegment);
      }
      segments.push(`(uuid:${task.uuid})`);
      lines.push(segments.filter((segment) => segment.length > 0).join(" "));
    }
    lines.push("");
  }
  return lines.join("\n");
};

const KANBAN_SETTINGS_PATTERN = /^\s*%%\s*kanban:settings\b/m;
const DEFAULT_KANBAN_FOOTER = [
  "%% kanban:settings",
  "```",
  '{"kanban-plugin":"board","list-collapse":[false,false,true,false,false,false,false,false,false,false,false,true,false,false,false],"new-note-template":"docs/agile/templates/task.stub.template.md","new-note-folder":"docs/agile/tasks","metadata-keys":[{"metadataKey":"tags","label":"","shouldHideLabel":false,"containsMarkdown":false},{"metadataKey":"hashtags","label":"","shouldHideLabel":false,"containsMarkdown":false}]}',
  "```",
  "%%",
].join("\n");

const resolveKanbanFooter = async (boardPath: string): Promise<string> => {
  try {
    const existing = await fs.readFile(boardPath, "utf8");
    const idx = existing.search(KANBAN_SETTINGS_PATTERN);
    if (idx >= 0) {
      const footer = existing.slice(idx).trim();
      if (footer.length > 0) {
        return footer;
      }
    }
  } catch {}
  return DEFAULT_KANBAN_FOOTER;
};

const maybeRefreshIndex = async (tasksDir: string): Promise<void> => {
  try {
    const { config } = await loadKanbanConfig();
    const resolvedInput = path.resolve(tasksDir);
    const resolvedConfig = path.resolve(config.tasksDir);
    if (resolvedInput !== resolvedConfig) {
      return;
    }
    await refreshTaskIndex(config);
  } catch {
    // Ignore configuration/indexing errors when regeneration targets
    // ad-hoc directories outside the configured workspace.
  }
};

const writeBoard = async (boardPath: string, board: Board): Promise<void> => {
  const md = serializeBoard(board).trimEnd();
  const footer = await resolveKanbanFooter(boardPath);
  const segments: string[] = [];
  if (md.length > 0) {
    segments.push(md);
  }
  segments.push(footer.trimEnd());
  const output = `${segments.join("\n\n")}\n`;
  await fs
    .mkdir(boardPath.split("/").slice(0, -1).join("/"), { recursive: true })
    .catch(() => {});
  await fs.writeFile(boardPath, output, "utf8");
};

export const updateStatus = async (
  board: Board,
  uuid: string,
  newStatus: string,
  boardPath: string,
): Promise<Task | undefined> => {
  let found: Task | undefined;
  for (const col of board.columns) {
    const idx = col.tasks.findIndex((t) => t.uuid === uuid);
    if (idx >= 0) {
      [found] = col.tasks.splice(idx, 1);
      col.count -= 1;
      break;
    }
  }
  if (!found) return undefined;

  const normalizedStatus = normalizeColumnDisplayName(newStatus);
  found.status = normalizedStatus;
  let target = board.columns.find(
    (c) => columnKey(c.name) === columnKey(normalizedStatus),
  );
  if (!target) {
    target = { name: normalizedStatus, count: 0, limit: null, tasks: [] };
    board.columns.push(target);
  } else if (target.name !== normalizeColumnDisplayName(target.name)) {
    target.name = normalizeColumnDisplayName(target.name);
  }
  target.tasks = [...target.tasks, found];
  target.count += 1;

  await writeBoard(boardPath, board);
  return found;
};

export const moveTask = async (
  board: Board,
  uuid: string,
  delta: number,
  boardPath: string,
): Promise<{ uuid: string; column: string; rank: number } | undefined> => {
  for (const col of board.columns) {
    const idx = col.tasks.findIndex((t) => t.uuid === uuid);
    if (idx >= 0) {
      const newIdx = Math.max(0, Math.min(col.tasks.length - 1, idx + delta));
      if (newIdx !== idx) {
        const next = [...col.tasks];
        const [removed] = next.splice(idx, 1);
        if (!removed) {
          continue;
        }
        next.splice(newIdx, 0, removed);
        col.tasks = next;
      }
      await writeBoard(boardPath, board);
      return { uuid, column: col.name, rank: newIdx };
    }
  }
  return undefined;
};

const quoteYamlString = (value: string | undefined | null): string => {
  if (typeof value === "undefined" || value === null) {
    return '""';
  }
  return JSON.stringify(String(value));
};

const formatScalar = (value: unknown): string => {
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return '""';
};

const formatLabels = (labels: ReadonlyArray<string> | undefined): string =>
  labels && labels.length > 0
    ? `[${labels.map((label) => JSON.stringify(label)).join(", ")}]`
    : "[]";

const fallbackTaskFromRaw = (filePath: string, raw: string): Task | null => {
  if (!raw.startsWith("---")) {
    return null;
  }
  let cursor = 3;
  if (raw[cursor] === "\\r") {
    cursor += 1;
  }
  if (raw[cursor] === "\\n") {
    cursor += 1;
  }
  const closingIndexLF = raw.indexOf("\\n---", cursor);
  const closingIndexCRLF = raw.indexOf("\\r\\n---", cursor);
  let boundaryIndex = closingIndexLF;
  let newlineLength = 1;
  if (
    closingIndexCRLF !== -1 &&
    (closingIndexLF === -1 || closingIndexCRLF < closingIndexLF)
  ) {
    boundaryIndex = closingIndexCRLF;
    newlineLength = 2;
  }
  if (boundaryIndex === -1) {
    return null;
  }
  const frontmatterContent = raw.slice(cursor, boundaryIndex);
  const bodyContent = raw.slice(boundaryIndex + newlineLength + 3);
  const getValue = (key: string): string | undefined => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`^${escapedKey}\\s*:\\s*(.+)$`, "im");
    const valueMatch = frontmatterContent.match(pattern);
    if (!valueMatch || valueMatch[1] == null) {
      return undefined;
    }
    return valueMatch[1].trim().replace(/^['\"]|['\"]$/g, "");
  };
  const uuid = getValue("uuid");
  if (!uuid) {
    return null;
  }
  const baseName = path.basename(filePath, path.extname(filePath));
  const title = getValue("title") ?? sanitizeFileNameBase(baseName);
  const status = getValue("status") ?? "Todo";
  const priority = getValue("priority");
  const labelsRaw = getValue("labels");
  const labels = labelsRaw
    ? labelsRaw
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(/[,\s]+/)
        .map((entry) => entry.replace(/^['"]|['"]$/g, "").trim())
        .filter((entry) => entry.length > 0)
    : [];
  const partialTask: Task = {
    uuid,
    title,
    status,
    priority,
    labels,
    created_at: getValue("created_at") ?? NOW_ISO(),
    estimates: {},
    content: bodyContent.trim(),
  };
  const slug = resolveTaskSlug(partialTask, baseName);
  const baseTask: Task = {
    ...partialTask,
    slug,
    sourcePath: filePath,
  };
  return ensureLabelsPresent(baseTask, bodyContent);
};

const normalizeFrontmatterForParsing = (raw: string): string => raw;

const toFrontmatter = (t: Task): string => {
  const est = t.estimates ?? {};
  const lines: string[] = [
    "---",
    `uuid: ${quoteYamlString(t.uuid)}`,
    `title: ${quoteYamlString(t.title)}`,
  ];
  if (t.slug && t.slug.length > 0 && !isFallbackSlug(t.slug, t.uuid)) {
    lines.push(`slug: ${quoteYamlString(t.slug)}`);
  }
  lines.push(
    `status: ${quoteYamlString(t.status)}`,
    `priority: ${quoteYamlString(
      typeof t.priority === "number" ? String(t.priority) : t.priority,
    )}`,
    `labels: ${formatLabels(t.labels)}`,
    `created_at: ${quoteYamlString(t.created_at ?? NOW_ISO())}`,
    "estimates:",
    `  complexity: ${formatScalar(est.complexity)}`,
    `  scale: ${formatScalar(est.scale)}`,
    `  time_to_completion: ${formatScalar(est.time_to_completion)}`,
    "---",
    "",
    t.content ?? "",
  );
  return lines.join("\n") + "\n";
};

export const pullFromTasks = async (
  board: Board,
  tasksDir: string,
  boardPath: string,
): Promise<{ added: number; moved: number }> => {
  board.columns = mergeColumnsCaseInsensitive(board.columns);
  const tasks = await readTasksFolder(tasksDir);
  let added = 0,
    moved = 0;
  const byId = new Map<string, { col: ColumnData; idx: number }>();
  board.columns.forEach((col) =>
    col.tasks.forEach((t, idx) => byId.set(t.uuid, { col, idx })),
  );

  for (const t of tasks) {
    const normalizedStatus = normalizeColumnDisplayName(
      String(t.status || "Todo"),
    );
    const statusKey = columnKey(normalizedStatus);
    const normalizedTask = { ...t, status: normalizedStatus };
    const loc = byId.get(t.uuid);
    if (!loc) {
      let col = board.columns.find((c) => columnKey(c.name) === statusKey);
      if (!col) {
        col = { name: normalizedStatus, count: 0, limit: null, tasks: [] };
        board.columns.push(col);
      } else if (col.name !== normalizeColumnDisplayName(col.name)) {
        col.name = normalizeColumnDisplayName(col.name);
      }
      col.tasks = [...col.tasks, normalizedTask];
      col.count = col.tasks.length;
      added++;
    } else {
      const currentTask = loc.col.tasks[loc.idx];
      loc.col.tasks[loc.idx] = {
        ...currentTask,
        ...normalizedTask,
        status: loc.col.name,
      };
      const currentKey = columnKey(loc.col.name);
      if (currentKey !== statusKey) {
        // remove from old
        loc.col.tasks = loc.col.tasks.filter((x) => x.uuid !== t.uuid);
        loc.col.count = loc.col.tasks.length;
        // add to new
        let dest = board.columns.find((c) => columnKey(c.name) === statusKey);
        if (!dest) {
          dest = { name: normalizedStatus, count: 0, limit: null, tasks: [] };
          board.columns.push(dest);
        } else if (dest.name !== normalizeColumnDisplayName(dest.name)) {
          dest.name = normalizeColumnDisplayName(dest.name);
        }
        dest.tasks = [...dest.tasks, { ...normalizedTask, status: dest.name }];
        dest.count = dest.tasks.length;
        moved++;
      }
    }
  }
  await writeBoard(boardPath, board);
  return { added, moved };
};

export const pushToTasks = async (
  board: Board,
  tasksDir: string,
): Promise<{ added: number; moved: number }> => {
  let added = 0,
    moved = 0;
  const existingTasks = await readTasksFolder(tasksDir);
  const existingByUuid = new Map(
    existingTasks.map((task) => [task.uuid, task]),
  );
  const usedNames = new Map<string, string>();
  for (const task of existingTasks) {
    const base = ensureTaskFileBase(task);
    usedNames.set(base, task.uuid);
  }

  await fs.mkdir(tasksDir, { recursive: true }).catch(() => {});

  for (const col of board.columns) {
    for (const task of col.tasks) {
      const baseName = ensureTaskFileBase(task);
      const uniqueBase = ensureUniqueFileBase(baseName, usedNames, task.uuid);
      if (task.slug !== uniqueBase) {
        task.slug = uniqueBase;
      }
      usedNames.set(uniqueBase, task.uuid);
      const filename = `${uniqueBase}.md`;
      const targetPath = path.join(tasksDir, filename);
      const previous = existingByUuid.get(task.uuid);
      const previousPath = previous?.sourcePath;
      const content = toFrontmatter({ ...task, status: col.name });
      await fs.writeFile(targetPath, content, "utf8");
      if (!previous) {
        added += 1;
      } else {
        moved += 1;
        if (
          previousPath &&
          path.resolve(previousPath) !== path.resolve(targetPath)
        ) {
          await fs.unlink(previousPath).catch(() => {});
        }
      }
      existingByUuid.delete(task.uuid);
    }
  }
  return { added, moved };
};

const persistBoardAndTasks = async (
  board: Board,
  boardPath: string | undefined,
  tasksDir: string | undefined,
): Promise<void> => {
  if (boardPath) {
    await writeBoard(boardPath, board);
  }
  if (tasksDir) {
    await pushToTasks(board, tasksDir);
  }
};

const BLOCKED_BY_HEADING = "## ⛓️ Blocked By";
const BLOCKS_HEADING = "## ⛓️ Blocks";

const escapeRegExp = (value: string): string =>
  value.replace(/[\\/\-^$*+?.()|[\]{}]/g, "\\$&");

const formatSectionBlock = (
  heading: string,
  items: ReadonlyArray<string>,
): string => {
  const lines =
    items.length > 0 ? items.map((item) => `- ${item}`) : ["Nothing"];
  return `${heading}\n\n${lines.join("\n")}\n\n`;
};

const setSectionItems = (
  content: string,
  heading: string,
  items: ReadonlyArray<string>,
): string => {
  const block = formatSectionBlock(heading, items);
  const pattern = new RegExp(
    `^${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s+|$)`,
    "m",
  );
  if (pattern.test(content)) {
    return content.replace(pattern, () => block);
  }
  const trimmed = content.trimEnd();
  const prefix = trimmed.length > 0 ? `${trimmed}\n\n` : "";
  return `${prefix}${block}`;
};

const ensureSectionExists = (content: string, heading: string): string => {
  const pattern = new RegExp(`^${escapeRegExp(heading)}\\s*$`, "m");
  if (pattern.test(content)) {
    return content;
  }
  return setSectionItems(content, heading, []);
};

const parseSectionItems = (
  content: string,
  heading: string,
): ReadonlyArray<string> => {
  const pattern = new RegExp(
    `^${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s+|$)`,
    "m",
  );
  const match = pattern.exec(content);
  if (!match) return [];
  const sectionBody = match[1]?.trim() ?? "";
  if (sectionBody.length === 0 || /^nothing$/i.test(sectionBody)) {
    return [];
  }
  return sectionBody
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter((line) => line.length > 0);
};

const mergeSectionItems = (
  content: string,
  heading: string,
  additions: ReadonlyArray<string>,
): string => {
  const existing = parseSectionItems(content, heading);
  const merged = new Set(existing);
  for (const item of additions) {
    if (item.trim().length > 0) {
      merged.add(item.trim());
    }
  }
  return setSectionItems(content, heading, Array.from(merged));
};

const applyTemplateReplacements = (
  template: string,
  replacements: Record<string, string>,
): string =>
  template.replace(/{{\s*([\w-]+)\s*}}/g, (_match, key: string) => {
    const replacement = replacements[key];
    return typeof replacement === "string" ? replacement : "";
  });

const uniqueStrings = (values: ReadonlyArray<string> | undefined): string[] =>
  Array.from(
    new Set(
      (values ?? [])
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value) && value.length > 0),
    ),
  );

const wikiLinkForTask = (task: Task): string => {
  const base = ensureTaskFileBase(task);
  const display =
    task.title && task.title.trim().length > 0 ? task.title.trim() : base;
  return `[[${base}|${display}]]`;
};

const ensureTaskContent = (task: Task, fallback?: Task): string => {
  const baseContent =
    task.content && task.content.length > 0
      ? task.content
      : fallback?.content ?? "";
  const withBlocked = ensureSectionExists(baseContent, BLOCKED_BY_HEADING);
  return ensureSectionExists(withBlocked, BLOCKS_HEADING);
};

export const createTask = async (
  board: Board,
  column: string,
  input: CreateTaskInput,
  tasksDir: string,
  boardPath: string,
): Promise<Task> => {
  const uuid = input.uuid ?? cryptoRandomUUID();
  const baseTitle = input.title?.trim() ?? "";
  const title = baseTitle.length > 0 ? baseTitle : `Task ${uuid.slice(0, 8)}`;
  const targetColumn = ensureColumn(board, column);

  const existingTasks = await readTasksFolder(tasksDir);
  const existingById = new Map(existingTasks.map((task) => [task.uuid, task]));

  const boardIndex = new Map<
    string,
    { column: ColumnData; index: number; task: Task }
  >();
  board.columns.forEach((col) =>
    col.tasks.forEach((task, index) =>
      boardIndex.set(task.uuid, { column: col, index, task }),
    ),
  );

  const templatePath = input.templatePath ?? input.defaultTemplatePath;
  let templateContent: string | undefined;
  if (templatePath) {
    templateContent = await fs.readFile(templatePath, "utf8");
  }

  const bodyText = input.body ?? input.content ?? "";
  let contentFromTemplate =
    typeof templateContent === "string"
      ? applyTemplateReplacements(templateContent, {
          TITLE: title,
          BODY: bodyText,
          UUID: uuid,
        })
      : input.content ?? bodyText;

  if (!contentFromTemplate) {
    contentFromTemplate = "";
  }

  let newTaskContent = ensureSectionExists(
    contentFromTemplate,
    BLOCKED_BY_HEADING,
  );
  newTaskContent = ensureSectionExists(newTaskContent, BLOCKS_HEADING);

  const baseTask: Task = {
    uuid,
    title,
    status: targetColumn.name,
    priority: input.priority,
    labels:
      input.labels && input.labels.length > 0 ? [...input.labels] : undefined,
    created_at: input.created_at ?? NOW_ISO(),
    estimates: input.estimates ? { ...input.estimates } : {},
    content: newTaskContent,
    slug: input.slug ? sanitizeFileNameBase(input.slug) : undefined,
  };

  const usedSlugs = new Map<string, string>();
  board.columns.forEach((col) => {
    col.tasks.forEach((task) => {
      const base = ensureTaskFileBase(task);
      usedSlugs.set(base, task.uuid);
    });
  });

  const baseSlug = ensureTaskFileBase(baseTask);
  const uniqueSlug = ensureUniqueFileBase(baseSlug, usedSlugs, baseTask.uuid);
  if (uniqueSlug !== baseTask.slug) {
    baseTask.slug = uniqueSlug;
  }
  usedSlugs.set(uniqueSlug, baseTask.uuid);

  const blockingIds = uniqueStrings(input.blocking);
  const blockedByIds = uniqueStrings(input.blockedBy);

  const resolveBoardTask = (id: string): Task | undefined => {
    const entry = boardIndex.get(id);
    if (!entry) return undefined;
    const fallback = existingById.get(id);
    entry.task.content = ensureTaskContent(entry.task, fallback);
    return entry.task;
  };

  const blockingLinks: string[] = [];
  for (const id of blockingIds) {
    const target = resolveBoardTask(id);
    if (!target) continue;
    blockingLinks.push(wikiLinkForTask(target));
  }

  const blockedByLinks: string[] = [];
  for (const id of blockedByIds) {
    const target = resolveBoardTask(id);
    if (!target) continue;
    blockedByLinks.push(wikiLinkForTask(target));
  }

  newTaskContent = setSectionItems(
    newTaskContent,
    BLOCKED_BY_HEADING,
    blockedByLinks,
  );
  newTaskContent = setSectionItems(
    newTaskContent,
    BLOCKS_HEADING,
    blockingLinks,
  );

  const enriched = ensureLabelsPresent(
    { ...baseTask, content: newTaskContent },
    newTaskContent,
  );

  const newTaskLink = wikiLinkForTask(enriched);

  const updateLinkedTask = async (id: string, heading: string) => {
    const entry = boardIndex.get(id);
    if (entry) {
      const fallback = existingById.get(id);
      const updatedContent = mergeSectionItems(
        ensureTaskContent(entry.task, fallback),
        heading,
        [newTaskLink],
      );
      const nextTask: Task = {
        ...entry.task,
        content: updatedContent,
        sourcePath: fallback?.sourcePath ?? entry.task.sourcePath,
      };
      entry.column.tasks = [
        ...entry.column.tasks.slice(0, entry.index),
        nextTask,
        ...entry.column.tasks.slice(entry.index + 1),
      ];
      entry.column.count = entry.column.tasks.length;
      boardIndex.set(id, {
        column: entry.column,
        index: entry.index,
        task: nextTask,
      });
      return;
    }

    const existing = existingById.get(id);
    if (!existing?.sourcePath) return;
    const updatedContent = mergeSectionItems(
      ensureTaskContent(existing, existing),
      heading,
      [newTaskLink],
    );
    const nextTask: Task = {
      ...existing,
      content: updatedContent,
    };
    await fs.writeFile(
      existing.sourcePath,
      toFrontmatter({ ...nextTask, status: nextTask.status ?? "Todo" }),
      "utf8",
    );
    existingById.set(id, nextTask);
  };

  for (const id of blockingIds) {
    await updateLinkedTask(id, BLOCKED_BY_HEADING);
  }

  for (const id of blockedByIds) {
    await updateLinkedTask(id, BLOCKS_HEADING);
  }

  targetColumn.tasks = [...targetColumn.tasks, enriched];
  targetColumn.count = targetColumn.tasks.length;

  await persistBoardAndTasks(board, boardPath, tasksDir);
  return enriched;
};

export const archiveTask = async (
  board: Board,
  uuid: string,
  tasksDir: string,
  boardPath: string,
  options?: { columnName?: string },
): Promise<Task | undefined> => {
  const located = locateTask(board, uuid);
  if (!located) return undefined;
  const archiveName = options?.columnName ?? "Archive";
  const { column } = located;
  if (columnKey(column.name) === columnKey(archiveName)) {
    located.task.status = column.name;
    await persistBoardAndTasks(board, boardPath, tasksDir);
    return located.task;
  }
  const removed = located.task;
  column.tasks = column.tasks.filter((task) => task.uuid !== uuid);
  column.count = column.tasks.length;
  const target = ensureColumn(board, archiveName);
  const moved: Task = { ...removed, status: target.name };
  target.tasks = [...target.tasks, moved];
  target.count = target.tasks.length;
  await persistBoardAndTasks(board, boardPath, tasksDir);
  return moved;
};

export const deleteTask = async (
  board: Board,
  uuid: string,
  tasksDir: string,
  boardPath: string,
): Promise<boolean> => {
  const located = locateTask(board, uuid);
  if (!located) return false;
  const { column, task } = located;
  column.tasks = column.tasks.filter((entry) => entry.uuid !== uuid);
  column.count = column.tasks.length;
  const filePath = await resolveTaskFilePath(task, tasksDir);
  if (filePath) {
    await fs.unlink(filePath).catch(() => {});
  }
  await persistBoardAndTasks(board, boardPath, tasksDir);
  return true;
};

export const updateTaskDescription = async (
  board: Board,
  uuid: string,
  content: string,
  tasksDir: string,
  boardPath: string,
): Promise<Task | undefined> => {
  const located = locateTask(board, uuid);
  if (!located) return undefined;
  const { column, index, task } = located;
  const updated: Task = { ...task, content };
  column.tasks = [
    ...column.tasks.slice(0, index),
    updated,
    ...column.tasks.slice(index + 1),
  ];
  await persistBoardAndTasks(board, boardPath, tasksDir);
  return updated;
};

export const renameTask = async (
  board: Board,
  uuid: string,
  newTitle: string,
  tasksDir: string,
  boardPath: string,
): Promise<Task | undefined> => {
  const located = locateTask(board, uuid);
  if (!located) return undefined;
  const title = newTitle.trim();
  if (title.length === 0) {
    return undefined;
  }
  const { column, index, task } = located;
  const updated: Task = {
    ...task,
    title,
    slug: undefined,
  };
  column.tasks = [
    ...column.tasks.slice(0, index),
    updated,
    ...column.tasks.slice(index + 1),
  ];
  await persistBoardAndTasks(board, boardPath, tasksDir);
  return updated;
};

export const syncBoardAndTasks = async (
  board: Board,
  tasksDir: string,
  boardPath: string,
): Promise<{
  board: { added: number; moved: number };
  tasks: { added: number; moved: number };
  conflicting: string[];
}> => {
  const taskFiles = await readTasksFolder(tasksDir);
  const boardById = new Map<string, Task>();
  for (const col of board.columns)
    for (const t of col.tasks)
      boardById.set(t.uuid, { ...t, status: col.name });
  const tasksById = new Map(taskFiles.map((t) => [t.uuid, t]));

  const conflicting: string[] = [];
  for (const [id, t] of tasksById) {
    const b = boardById.get(id);
    if (!b) continue;
    if (
      (b.title ?? "") !== (t.title ?? "") ||
      columnKey(String(b.status ?? "")) !== columnKey(String(t.status ?? ""))
    )
      conflicting.push(id);
  }
  const boardRes = await pullFromTasks(board, tasksDir, boardPath);
  const tasksRes = await pushToTasks(board, tasksDir);
  return { board: boardRes, tasks: tasksRes, conflicting };
};

export const regenerateBoard = async (
  tasksDir: string,
  boardPath: string,
): Promise<{ totalTasks: number }> => {
  const tasks = await readTasksFolder(tasksDir);
  const statusGroups = new Map<string, { name: string; tasks: Task[] }>();
  for (const task of tasks) {
    const statusRaw = String(task.status || "Todo").trim();
    const displayName = normalizeColumnDisplayName(statusRaw);
    const key = columnKey(statusRaw);
    const existing = statusGroups.get(key);
    if (existing) {
      existing.tasks.push({ ...task, status: existing.name });
    } else {
      statusGroups.set(key, {
        name: displayName,
        tasks: [{ ...task, status: displayName }],
      });
    }
  }
  const columns: ColumnData[] = Array.from(statusGroups.values()).map(
    ({ name, tasks: ts }) => ({
      name,
      count: ts.length,
      limit: null,
      tasks: ts,
    }),
  );
  await maybeRefreshIndex(tasksDir);
  await writeBoard(boardPath, { columns });
  return { totalTasks: tasks.length };
};

const tokenize = (s: string): string[] =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

export const indexForSearch = async (
  _tasksDir: string,
): Promise<{ started: boolean }> => ({ started: true }); // noop stub – your indexer can hook here later

export const searchTasks = async (
  board: Board,
  term: string,
): Promise<{ exact: Task[]; similar: Task[] }> => {
  const needle = term.trim().toLowerCase();
  const all: Task[] = board.columns.flatMap((c) =>
    c.tasks.map((t) => ({ ...t, status: c.name })),
  );
  const exact = all.filter(
    (t) =>
      t.title.toLowerCase().includes(needle) ||
      (t.content ?? "").toLowerCase().includes(needle),
  );

  const needToks = new Set(tokenize(term));
  const score = (t: Task) => {
    const bag = new Set([
      ...tokenize(t.title),
      ...tokenize(t.content ?? ""),
      ...(t.labels ?? []),
    ]);
    let s = 0;
    for (const tok of needToks) if (bag.has(tok)) s++;
    return s;
  };
  const similar = all
    .filter((t) => !exact.includes(t))
    .map((t) => ({ t, s: score(t) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 20)
    .map((x) => x.t);

  return { exact, similar };
};
