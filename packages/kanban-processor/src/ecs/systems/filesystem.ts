import { join } from "path";
import { readFile, readdir, stat, writeFile } from "fs/promises";
import crypto from "crypto";

import type {
  SystemSpec,
  SystemContext,
} from "@promethean/ds/ecs.scheduler.js";
import { MarkdownBoard } from "@promethean/markdown/kanban.js";
import { syncBoardStatuses } from "@promethean/markdown/sync.js";
import { MarkdownTask } from "@promethean/markdown/task.js";
import { STATUS_ORDER, STATUS_SET } from "@promethean/markdown/statuses.js";

import type { KanbanCard } from "../components.js";

export type FileEvent = { kind: "board" | "tasks" };

export type FileResources = {
  queue: FileEvent[];
  ignoreBoard: boolean;
  ignoreTasks: boolean;
  timers: NodeJS.Timeout[];
};

type PathResources = {
  boardPath: string;
  tasksPath: string;
};

type FlagResources = {
  disable: boolean;
};

export const EVENTS = {
  boardChange: "file-watcher-board-change",
  taskAdd: "file-watcher-task-add",
  taskChange: "file-watcher-task-change",
  cardCreated: "kanban-card-created",
  cardMoved: "kanban-card-moved",
  cardRenamed: "kanban-card-renamed",
  cardTaskChanged: "kanban-card-task-changed",
} as const;

function firstWiki(cardLinks: string[] | undefined): string | null {
  if (!cardLinks || cardLinks.length === 0) return null;
  const raw = cardLinks[0]!;
  return raw.split("|")[0]!.split("#")[0]!.trim();
}

async function boardToCards(
  board: any,
  tasksDir: string,
): Promise<KanbanCard[]> {
  const out: KanbanCard[] = [];
  for (const col of board.listColumns()) {
    for (const c of board.listCards(col.name)) {
      const title = c.text || firstWiki(c.links) || c.id;
      const file = firstWiki(c.links) || "";
      const link = file
        ? join("..", "tasks", encodeURI(file)).replace(/\\/g, "/")
        : "";
      if (file) {
        try {
          const content = await readFile(join(tasksDir, file), "utf8");
          const task = await MarkdownTask.load(content);
          const id = task.getId() || "";
          out.push({ id: id || c.id, title, column: col.name, link });
          continue;
        } catch {
          // ignore missing task files
        }
      }
      out.push({ id: c.id, title, column: col.name, link });
    }
  }
  return out;
}

async function buildBoardFromTasks(board: any, tasksDir: string) {
  const entries = await readdir(tasksDir);
  const tasks: { file: string; id: string; title: string; status: string }[] =
    [];
  for (const name of entries) {
    const p = join(tasksDir, name);
    const st = await stat(p).catch(() => null as any);
    if (!st || !st.isFile()) continue;
    if (!name.toLowerCase().endsWith(".md")) continue;
    const text = await readFile(p, "utf8");
    const t = await MarkdownTask.load(text);
    const id = t.getId() || crypto.randomUUID();
    const title = t.getTitle() || name;
    const tags = t.getHashtags();
    const status = tags.find((x: string) => STATUS_SET.has(x)) || "#todo";
    tasks.push({ file: name, id, title, status });
  }

  const statusToCards = new Map<
    string,
    { id: string; text: string; link: string }[]
  >();
  for (const s of STATUS_ORDER) statusToCards.set(s, []);
  for (const t of tasks) {
    const link = `${t.file}|${t.title}`;
    const arr = statusToCards.get(t.status) || statusToCards.get("#todo")!;
    arr.push({ id: t.id, text: t.title, link });
  }

  for (const col of board.listColumns()) {
    if (!STATUS_SET.has(`#${col.name.toLowerCase().replace(/\s+/g, "-")}`))
      continue;
    const current = board.listCards(col.name);
    for (const c of current) board.removeCard(col.name, c.id);
  }

  for (const col of board.listColumns()) {
    const status = `#${col.name.toLowerCase().replace(/\s+/g, "-")}`;
    const items = statusToCards.get(status);
    if (!items) continue;
    for (const it of items) {
      board.addCard(col.name, {
        id: it.id,
        text: it.text,
        links: [it.link],
        done: false,
        tags: [status],
      });
    }
  }
}

async function writeBoardFile(
  path: string,
  lines: string[],
  modified: boolean,
) {
  if (!modified) return;
  await writeFile(path, lines.join("\n"));
}

export function createFilesystemSystem(
  components: { BoardSnapshot: any },
  entity: number,
): SystemSpec {
  return {
    name: "kanban.filesystem",
    stage: "update",
    reads: ["fs", "paths", "flags"],
    writesComponents: [components.BoardSnapshot],
    async run({ resources, cmd, world }: SystemContext) {
      const flags = resources.get("flags") as FlagResources;
      if (flags.disable) return;

      const fsRes = resources.get("fs") as FileResources;
      if (!fsRes.queue.length) return;

      const paths = resources.get("paths") as PathResources;

      const event = fsRes.queue.shift()!;
      if (event.kind === "board" && fsRes.ignoreBoard) {
        fsRes.ignoreBoard = false;
        return;
      }
      if (event.kind === "tasks" && fsRes.ignoreTasks) {
        fsRes.ignoreTasks = false;
        return;
      }

      const now = Date.now();
      const snapshot =
        world.get(entity, components.BoardSnapshot) ||
        components.BoardSnapshot.defaults?.();

      try {
        const text = await readFile(paths.boardPath, "utf8");
        const board = await MarkdownBoard.load(text);

        if (event.kind === "board") {
          fsRes.ignoreTasks = true;
          const changed = await syncBoardStatuses(board, {
            tasksDir: paths.tasksPath,
            createMissingTasks: true,
          });
          const nextMd = await board.toMarkdown();
          await writeBoardFile(paths.boardPath, nextMd.split(/\r?\n/), changed);
          const cards = await boardToCards(board, paths.tasksPath);
          cmd.set(entity, components.BoardSnapshot, {
            version: (snapshot?.version ?? 0) + 1,
            source: "board",
            updatedAt: now,
            cards,
          });
          const taskTimer = setTimeout(() => {
            fsRes.ignoreTasks = false;
            fsRes.timers = fsRes.timers.filter((t) => t !== taskTimer);
          }, 500);
          fsRes.timers.push(taskTimer);
        } else {
          fsRes.ignoreBoard = true;
          await buildBoardFromTasks(board, paths.tasksPath);
          await syncBoardStatuses(board, {
            tasksDir: paths.tasksPath,
            createMissingTasks: false,
          });
          const nextMd = await board.toMarkdown();
          await writeBoardFile(paths.boardPath, nextMd.split(/\r?\n/), true);
          const cards = await boardToCards(board, paths.tasksPath);
          cmd.set(entity, components.BoardSnapshot, {
            version: (snapshot?.version ?? 0) + 1,
            source: "tasks",
            updatedAt: now,
            cards,
          });
          const boardTimer = setTimeout(() => {
            fsRes.ignoreBoard = false;
            fsRes.timers = fsRes.timers.filter((t) => t !== boardTimer);
          }, 500);
          fsRes.timers.push(boardTimer);
        }
      } catch (err) {
        console.error("kanban filesystem system failed", err);
      }
    },
  };
}
