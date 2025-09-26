import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { parseFrontmatter as parseMarkdownFrontmatter } from "@promethean/markdown/frontmatter";
import type { Board, ColumnData, Task } from "./types.js";

const NOW_ISO = () => new Date().toISOString();

const parseLimit = (header: string): number | null => {
  // look for "(limit 3)" or "[wip:3]" or "# wip=3"
  const m =
    header.match(/\((?:wip|limit)\s*[:=]\s*(\d+)\)/i) ||
    header.match(/\[\s*(?:wip|limit)\s*[:=]\s*(\d+)\s*\]/i) ||
    header.match(/(?:wip|limit)\s*[:=]\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
};

const parseColumnsFromMarkdown = (markdown: string): ColumnData[] => {
  const lines = markdown.split(/\r?\n/);
  const columns: ColumnData[] = [];
  let current: ColumnData | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const h = /^##\s+(.+)$/.exec(line);
    if (h) {
      const name = h[1].trim();
      current = { name, count: 0, limit: parseLimit(name), tasks: [] };
      columns.push(current);
      continue;
    }

    if (!current) continue;

    // list item like "- [ ] Title #label (uuid:xxx)"
    const taskMatch = /^-\s+\[(x|\s)\]\s+(.+)$/.exec(line);
    if (taskMatch) {
      const titlePart = taskMatch[2].trim();
      const uuidMatch = titlePart.match(/\(uuid:([0-9a-fA-F-]{8,})\)/);
      const uuid = uuidMatch ? uuidMatch[1] : cryptoRandomUUID();
      const labels = Array.from(titlePart.matchAll(/#([\w-]+)/g)).map(
        (m) => m[1],
      );
      const prioMatch = titlePart.match(/\bprio[:=](\w+)\b/i);
      const priority = prioMatch ? prioMatch[1] : undefined;
      const title = titlePart
        .replace(/\(uuid:[^)]+\)/g, "")
        .replace(/#\w+/g, "")
        .replace(/\bprio[:=]\w+\b/gi, "")
        .trim();

      const done = taskMatch[1] === "x";
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
      };
      current.tasks.push(task);
      current.count += 1;
      continue;
    }
  }
  return columns;
};

const cryptoRandomUUID = (): string => randomUUID();

type FM = Record<string, any>;

const parseFrontmatter = (text: string): { fm: FM; body: string } => {
  const res = parseMarkdownFrontmatter<FM>(text);
  return { fm: (res.data ?? {}) as FM, body: res.content || "" };
};

const taskFromFM = (fm: FM, body: string): Task | null => {
  if (!fm.uuid || !fm.title) return null;
  const t: Task = {
    uuid: String(fm.uuid),
    title: String(fm.title),
    status: String(fm.status ?? "Todo"),
    priority: fm.priority,
    labels: Array.isArray(fm.labels)
      ? fm.labels.map(String)
      : typeof fm.labels === "string"
        ? fm.labels.split(/[\s,]+/).filter(Boolean)
        : [],
    created_at: fm.created_at ?? NOW_ISO(),
    estimates: fm.estimates ?? {},
    content: (body ?? "").trim() || undefined,
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
        if (data && data.uuid && data.title) tasks.push(data as Task);
      } catch {}
    } else {
      const { fm, body } = parseFrontmatter(text);
      const t = taskFromFM(fm, body);
      if (t) tasks.push(t);
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
  const byStatus = new Map<string, Task[]>();
  for (const t of tasks) {
    const k = String(t.status || "Todo");
    const arr = byStatus.get(k) ?? [];
    arr.push(t);
    byStatus.set(k, arr);
  }
  const cols: ColumnData[] = Array.from(byStatus.entries()).map(
    ([name, ts]) => ({ name, count: ts.length, limit: null, tasks: ts }),
  );
  return { columns: cols };
};

export const countTasks = (board: Board, column?: string): number => {
  if (!column) return board.columns.reduce((acc, c) => acc + c.count, 0);
  const c = board.columns.find(
    (c) => c.name.toLowerCase() === column.toLowerCase(),
  );
  return c ? c.count : 0;
};

export const getColumn = (board: Board, column: string): ColumnData => {
  const c = board.columns.find(
    (c) => c.name.toLowerCase() === column.toLowerCase(),
  );
  return c ?? { name: column, count: 0, limit: null, tasks: [] };
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

const serializeBoard = (board: Board): string => {
  const lines: string[] = [];
  for (const col of board.columns) {
    const header = `## ${col.name}`;
    lines.push(header, "");
    for (const t of col.tasks) {
      const done = /done/i.test(col.name) ? "x" : " ";
      const labels = (t.labels ?? []).map((l) => `#${l}`).join(" ");
      const prio = t.priority ? ` prio:${t.priority}` : "";
      lines.push(
        `- [${done}] ${t.title} ${labels}${prio} (uuid:${t.uuid})`.trim(),
      );
    }
    lines.push("");
  }
  return lines.join("\n");
};

const writeBoard = async (boardPath: string, board: Board): Promise<void> => {
  const md = serializeBoard(board);
  await fs
    .mkdir(boardPath.split("/").slice(0, -1).join("/"), { recursive: true })
    .catch(() => {});
  await fs.writeFile(boardPath, md, "utf8");
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

  found.status = newStatus;
  let target = board.columns.find(
    (c) => c.name.toLowerCase() === newStatus.toLowerCase(),
  );
  if (!target) {
    target = { name: newStatus, count: 0, limit: null, tasks: [] };
    board.columns.push(target);
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
        const [t] = next.splice(idx, 1);
        next.splice(newIdx, 0, t);
        col.tasks = next;
      }
      await writeBoard(boardPath, board);
      return { uuid, column: col.name, rank: newIdx };
    }
  }
  return undefined;
};

const taskPath = (dir: string, uuid: string) => `${dir}/${uuid}.md`;

const toFrontmatter = (t: Task): string => {
  const labels = (t.labels ?? []).join(", ");
  const est = t.estimates ?? {};
  return (
    `---
uuid: ${t.uuid}
title: ${t.title}
status: ${t.status}
priority: ${t.priority ?? ""}
labels: ${labels}
created_at: ${t.created_at ?? NOW_ISO()}
estimates:
  complexity: ${est.complexity ?? ""}
  scale: ${est.scale ?? ""}
  time_to_completion: ${est.time_to_completion ?? ""}
---

${t.content ?? ""}
`.trim() + "\n"
  );
};

export const pullFromTasks = async (
  board: Board,
  tasksDir: string,
  boardPath: string,
): Promise<{ added: number; moved: number }> => {
  const tasks = await readTasksFolder(tasksDir);
  let added = 0,
    moved = 0;
  const byId = new Map<string, { col: ColumnData; idx: number }>();
  board.columns.forEach((col) =>
    col.tasks.forEach((t, idx) => byId.set(t.uuid, { col, idx })),
  );

  for (const t of tasks) {
    const loc = byId.get(t.uuid);
    if (!loc) {
      let col = board.columns.find(
        (c) => c.name.toLowerCase() === String(t.status).toLowerCase(),
      );
      if (!col) {
        col = { name: t.status || "Todo", count: 0, limit: null, tasks: [] };
        board.columns.push(col);
      }
      col.tasks = [...col.tasks, t];
      col.count += 1;
      added++;
    } else {
      if (loc.col.name.toLowerCase() !== String(t.status).toLowerCase()) {
        // remove from old
        loc.col.tasks = loc.col.tasks.filter((x) => x.uuid !== t.uuid);
        loc.col.count -= 1;
        // add to new
        let dest = board.columns.find(
          (c) => c.name.toLowerCase() === String(t.status).toLowerCase(),
        );
        if (!dest) {
          dest = { name: t.status || "Todo", count: 0, limit: null, tasks: [] };
          board.columns.push(dest);
        }
        dest.tasks = [...dest.tasks, t];
        dest.count += 1;
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
  const existing = new Set<string>();
  try {
    const files = await fs.readdir(tasksDir);
    for (const f of files)
      if (f.endsWith(".md")) existing.add(f.replace(/\.md$/, ""));
  } catch {}

  for (const col of board.columns) {
    for (const t of col.tasks) {
      const path = taskPath(tasksDir, t.uuid);
      const exists = existing.has(t.uuid);
      const content = toFrontmatter({ ...t, status: col.name });
      await fs.mkdir(tasksDir, { recursive: true }).catch(() => {});
      await fs.writeFile(path, content, "utf8");
      if (!exists) added++;
      else moved++;
    }
  }
  return { added, moved };
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
      String(b.status) !== String(t.status)
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
  const byStatus = new Map<string, Task[]>();
  for (const t of tasks) {
    const k = String(t.status || "Todo");
    const arr = byStatus.get(k) ?? [];
    arr.push(t);
    byStatus.set(k, arr);
  }
  const columns: ColumnData[] = Array.from(byStatus.entries()).map(
    ([name, ts]) => ({ name, count: ts.length, limit: null, tasks: ts }),
  );
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
