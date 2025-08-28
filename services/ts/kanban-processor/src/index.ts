import {
  // dirname,
  join,
} from "path";
import { readdir, readFile, stat, writeFile } from "fs/promises";
import crypto from "crypto";
import { ContextStore } from "@shared/ts/dist/persistence/contextStore.js";
import { DualStoreManager } from "@shared/ts/dist/persistence/dualStore.js";
import { getMongoClient } from "@shared/ts/dist/persistence/clients.js";
import type { MongoClient } from "mongodb";
// @ts-ignore
import { BrokerClient } from "@shared/js/brokerClient.js";
import { MarkdownBoard } from "@shared/ts/dist/markdown/kanban.js";
import { syncBoardStatuses } from "@shared/ts/dist/markdown/sync.js";
import { MarkdownTask } from "@shared/ts/dist/markdown/task.js";
import { STATUS_ORDER, STATUS_SET } from "@shared/ts/dist/markdown/statuses.js";

const EVENTS = {
  boardChange: "file-watcher-board-change",
  taskAdd: "file-watcher-task-add",
  taskChange: "file-watcher-task-change",
  cardCreated: "kanban-card-created",
  cardMoved: "kanban-card-moved",
  cardRenamed: "kanban-card-renamed",
  cardTaskChanged: "kanban-card-task-changed",
};

interface KanbanCard {
  id: string;
  title: string;
  column: string;
  link: string;
}

const defaultRepoRoot = process.env.REPO_ROOT || "";

// async function loadBoard(path: string): Promise<string[]> {
//   const text = await readFile(path, "utf8");
//   return text.split(/\r?\n/);
// }

// async function ensureTaskFile(
//   tasksPath: string,
//   title: string,
// ): Promise<{ id: string; link: string }> {
//   const id = crypto.randomUUID();
//   const filename = `${title.replace(/[<>:\"/\\|?*]/g, "-")}.md`;
//   const filePath = join(tasksPath, filename);
//   await writeFile(filePath, `id: ${id}\n`);
//   const rel = join("..", "tasks", encodeURI(filename)).replace(/\\/g, "/");
//   return { id, link: rel };
// }

function firstWiki(cardLinks: string[] | undefined): string | null {
  if (!cardLinks || cardLinks.length === 0) return null;
  const raw = cardLinks[0]!;
  return raw.split("|")[0]!.split("#")[0]!.trim();
}

async function boardToCards(
  board: MarkdownBoard,
  tasksDir: string,
): Promise<KanbanCard[]> {
  const out: KanbanCard[] = [];
  for (const col of board.listColumns()) {
    for (const c of board.listCards(col.name)) {
      // title from card.text
      const title = c.text || firstWiki(c.links) || c.id;
      const file = firstWiki(c.links) || "";
      const link = file
        ? join("..", "tasks", encodeURI(file)).replace(/\\/g, "/")
        : "";
      // ensure id in target task file
      if (file) {
        try {
          const content = await readFile(join(tasksDir, file), "utf8");
          const task = await MarkdownTask.load(content);
          const id = task.getId() || "";
          out.push({ id: id || c.id, title, column: col.name, link });
          continue;
        } catch {
          // fallthrough
        }
      }
      out.push({ id: c.id, title, column: col.name, link });
    }
  }
  return out;
}

async function buildBoardFromTasks(board: MarkdownBoard, tasksDir: string) {
  // Build status -> items map
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
    const status = tags.find((x) => STATUS_SET.has(x)) || "#todo";
    tasks.push({ file: name, id, title, status });
  }

  // Ensure status columns exist and replace their cards
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

  // remove existing status cards from the board
  for (const col of board.listColumns()) {
    if (!STATUS_SET.has(`#${col.name.toLowerCase().replace(/\s+/g, "-")}`))
      continue;
    const current = board.listCards(col.name);
    for (const c of current) board.removeCard(col.name, c.id);
  }

  // add back cards according to grouping
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
  if (modified) {
    await writeFile(path, lines.join("\n"));
  }
}

async function projectState(
  cards: KanbanCard[],
  previous: Record<string, KanbanCard>,
  publish: (type: string, payload: any) => void,
  store: DualStoreManager<string, string> | null,
): Promise<Record<string, KanbanCard>> {
  const current: Record<string, KanbanCard> = {};
  for (const card of cards) {
    current[card.id] = card;
    if (store) {
      await store.mongoCollection.updateOne(
        { id: card.id } as any,
        { $set: card as any },
        { upsert: true },
      );
    }
    const prev = previous[card.id];
    if (!prev) {
      publish(EVENTS.cardCreated, card);
    } else {
      if (prev.column !== card.column) {
        publish(EVENTS.cardMoved, {
          id: card.id,
          from: prev.column,
          to: card.column,
        });
      }
      if (prev.title !== card.title) {
        publish(EVENTS.cardRenamed, {
          id: card.id,
          from: prev.title,
          to: card.title,
        });
      }
      if (prev.link !== card.link) {
        publish(EVENTS.cardTaskChanged, {
          id: card.id,
          from: prev.link,
          to: card.link,
        });
      }
    }
  }
  return current;
}

export function startKanbanProcessor(repoRoot = defaultRepoRoot) {
  const boardPath = join(repoRoot, "docs", "agile", "boards", "kanban.md");
  const tasksPath = join(repoRoot, "docs", "agile", "tasks");
  // const boardDir = dirname(boardPath);

  const ctx = new ContextStore();
  let kanbanStore: DualStoreManager<string, string> | null = null;
  let mongoClient: MongoClient | null = null;
  if (process.env.NODE_ENV !== "test") {
    getMongoClient()
      .then((client) => {
        mongoClient = client;
        return ctx.createCollection("kanban", "title", "updatedAt");
      })
      .then((store: DualStoreManager<string, string>) => {
        kanbanStore = store;
      })
      .catch((err: unknown) => console.error("dual store init failed", err));
  }

  const brokerUrl = process.env.BROKER_URL || "ws://localhost:7000";
  const broker = new BrokerClient({ url: brokerUrl, id: "kanban-processor" });
  const QUEUE = "kanban-processor";

  let previousState: Record<string, KanbanCard> = {};
  let ignoreBoard = false;
  let ignoreTasks = false;

  function publish(type: string, payload: any) {
    broker.publish(type, payload);
  }

  async function handleBoardChange() {
    if (process.env.KANBAN_DISABLE_PROCESS === "1") {
      return;
    }
    if (ignoreBoard) {
      ignoreBoard = false;
      return;
    }
    ignoreTasks = true;
    try {
      const text = await readFile(boardPath, "utf8");
      const board = await MarkdownBoard.load(text);
      const changed = await syncBoardStatuses(board, {
        tasksDir: tasksPath,
        createMissingTasks: true,
      });
      const nextMd = await board.toMarkdown();
      await writeBoardFile(boardPath, nextMd.split(/\r?\n/), changed);
      const cards = await boardToCards(board, tasksPath);
      previousState = await projectState(
        cards,
        previousState,
        publish,
        kanbanStore,
      );
    } catch (err) {
      console.error("processKanban failed", err);
    } finally {
      setTimeout(() => {
        ignoreTasks = false;
      }, 500);
    }
  }

  async function handleTasksChange() {
    if (process.env.KANBAN_DISABLE_PROCESS === "1") {
      return;
    }
    if (ignoreTasks) return;
    ignoreBoard = true;
    try {
      // Rebuild board sections from tasks while preserving settings/frontmatter
      const text = await readFile(boardPath, "utf8");
      const board = await MarkdownBoard.load(text);
      await buildBoardFromTasks(board, tasksPath);
      const changed = await syncBoardStatuses(board, {
        tasksDir: tasksPath,
        createMissingTasks: false,
      });
      const nextMd = await board.toMarkdown();
      await writeBoardFile(boardPath, nextMd.split(/\r?\n/), true || changed);
      const cards = await boardToCards(board, tasksPath);
      previousState = await projectState(
        cards,
        previousState,
        publish,
        kanbanStore,
      );
    } catch (err) {
      console.error("updateBoard failed", err);
    }
  }

  broker
    .connect()
    .then(() => {
      broker.subscribe(EVENTS.boardChange, () => {
        broker.enqueue(QUEUE, { kind: "board" });
      });
      broker.subscribe(EVENTS.taskAdd, () => {
        broker.enqueue(QUEUE, { kind: "tasks" });
      });
      broker.subscribe(EVENTS.taskChange, () => {
        broker.enqueue(QUEUE, { kind: "tasks" });
      });
      broker.ready(QUEUE);
      console.log("kanban processor connected to broker");
    })
    .catch((err: unknown) => console.error("broker connect failed", err));

  broker.onTaskReceived((task: any) => {
    const kind = task.payload?.kind;
    const fn = kind === "tasks" ? handleTasksChange : handleBoardChange;
    fn().finally(() => {
      broker.ack(task.id);
      broker.ready(QUEUE);
    });
  });

  return {
    async close() {
      broker.socket?.close();
      try {
        await mongoClient?.close();
      } catch (err) {
        console.error("mongo close failed", err);
      }
    },
  };
}

if (process.env.NODE_ENV !== "test") {
  startKanbanProcessor();
  console.log("Kanban processor running...");
}
