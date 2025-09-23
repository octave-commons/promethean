import {
  // dirname,
  join,
} from "path";
import crypto from "crypto";

import { ContextStore } from "@promethean/persistence/contextStore.js";
// DualStoreManager types resolved at runtime; avoid compile-time coupling
import { getMongoClient } from "@promethean/persistence/clients.js";
import type { MongoClient } from "mongodb";
// @ts-ignore
import { BrokerClient } from "@promethean/legacy/brokerClient.js";
import { MarkdownBoard } from "@promethean/markdown/kanban.js";
import { syncBoardStatuses } from "@promethean/markdown/sync.js";
import { MarkdownTask } from "@promethean/markdown/task.js";
import { STATUS_SET, STATUS_ORDER } from "@promethean/markdown/statuses.js";
import { World } from "@promethean/ds/ecs.js";
import {
  defineFsComponents,
  DirectorySnapshotSystem,
  WriteBufferSystem,
} from "@promethean/fs";

const EVENTS = {
  boardChange: "file-watcher-board-change",
  taskAdd: "file-watcher-task-add",
  taskChange: "file-watcher-task-change",
  cardCreated: "kanban-card-created",
  cardMoved: "kanban-card-moved",
  cardRenamed: "kanban-card-renamed",
  cardTaskChanged: "kanban-card-task-changed",
};

type KanbanCard = {
  id: string;
  title: string;
  column: string;
  link: string;
};

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
  board: any,
  tasksFiles: Record<string, string>,
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
          const normalized = file.replace(/\\/g, "/");
          const content = tasksFiles[normalized];
          if (typeof content === "string") {
            const task = await MarkdownTask.load(content);
            const id = task.getId() || "";
            out.push({ id: id || c.id, title, column: col.name, link });
            continue;
          }
        } catch {
          // fallthrough
        }
      }
      out.push({ id: c.id, title, column: col.name, link });
    }
  }
  return out;
}

async function buildBoardFromTasks(
  board: any,
  taskFiles: Record<string, string>,
) {
  // Build status -> items map
  const tasks: { file: string; id: string; title: string; status: string }[] =
    [];
  for (const [name, text] of Object.entries(taskFiles)) {
    if (!name.toLowerCase().endsWith(".md")) continue;
    const t = await MarkdownTask.load(text);
    const id = t.getId() || crypto.randomUUID();
    const title = t.getTitle() || name;
    const tags = t.getHashtags();
    const status = tags.find((x: string) => STATUS_SET.has(x)) || "#todo";
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

function writeBoardFile(
  stage: (target: string, data: string) => void,
  path: string,
  lines: string[],
  modified: boolean,
) {
  if (modified) {
    stage(path, lines.join("\n"));
  }
}

async function projectState(
  cards: KanbanCard[],
  previous: Record<string, KanbanCard>,
  publish: (type: string, payload: any) => void,
  store: any | null,
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

  const world = new World();
  const Fs = defineFsComponents(world);
  const fsSystems = [
    WriteBufferSystem(world, Fs),
    DirectorySnapshotSystem(world, Fs),
  ];

  const cmd = world.beginTick();
  const boardEntity = cmd.createEntity();
  cmd.add(boardEntity, Fs.DirectoryIntent, {
    path: join(repoRoot, "docs", "agile", "boards"),
    capture: { contents: true, suffixes: ["kanban.md"], encoding: "utf8" },
    walk: { maxDepth: 1 },
  });
  cmd.add(boardEntity, Fs.WriteBuffer, { ensure: [], writes: [], deletes: [] });

  const tasksEntity = cmd.createEntity();
  cmd.add(tasksEntity, Fs.DirectoryIntent, {
    path: tasksPath,
    capture: { contents: true, suffixes: [".md"], encoding: "utf8" },
  });
  cmd.add(tasksEntity, Fs.WriteBuffer, { ensure: [], writes: [], deletes: [] });
  cmd.flush();
  world.endTick();

  const runFsTick = async () => {
    const exec = world.beginTick();
    for (const system of fsSystems) await system(0);
    exec.flush();
    world.endTick();
  };

  let fsChain = runFsTick();
  const nextFsTick = async () => {
    fsChain = fsChain.then(() => runFsTick());
    await fsChain;
  };

  const updateBuffer = (entity: number, updater: (state: any) => void) => {
    const existing = world.get(entity, Fs.WriteBuffer) as any;
    const next = existing
      ? {
          ensure: [...existing.ensure],
          writes: [...existing.writes],
          deletes: [...existing.deletes],
          ...(existing.lastFlush ? { lastFlush: existing.lastFlush } : {}),
        }
      : { ensure: [], writes: [], deletes: [] };
    updater(next);
    world.set(entity, Fs.WriteBuffer, next);
  };

  const normalizedSnapshotFiles = (entity: number) => {
    const snap = world.get(entity, Fs.DirectorySnapshot);
    const files = snap?.files ?? {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(files)) {
      if (typeof value === "string") {
        out[key.replace(/\\/g, "/")] = value;
      }
    }
    return out;
  };

  const stageBoardWrite = (target: string, data: string) => {
    updateBuffer(boardEntity, (state) => {
      state.writes.push({ path: target, data, encoding: "utf8" });
    });
  };

  const ctx = new ContextStore();
  let kanbanStore: any | null = null;
  let mongoClient: MongoClient | null = null;
  if (process.env.NODE_ENV !== "test") {
    getMongoClient()
      .then((client: any) => {
        mongoClient = client;
        return ctx.createCollection("kanban", "title", "updatedAt");
      })
      .then((store: any) => {
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
      await nextFsTick();
      const boardFiles = normalizedSnapshotFiles(boardEntity);
      const boardSource = boardFiles["kanban.md"] || "";
      const board = await MarkdownBoard.load(boardSource);
      const changed = await syncBoardStatuses(board, {
        tasksDir: tasksPath,
        createMissingTasks: true,
      });
      const nextMd = await board.toMarkdown();
      writeBoardFile(
        stageBoardWrite,
        boardPath,
        nextMd.split(/\r?\n/),
        changed,
      );
      await nextFsTick();
      const tasksFiles = normalizedSnapshotFiles(tasksEntity);
      const cards = await boardToCards(board, tasksFiles);
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
      await nextFsTick();
      const boardFiles = normalizedSnapshotFiles(boardEntity);
      const boardSource = boardFiles["kanban.md"] || "";
      const board = await MarkdownBoard.load(boardSource);
      const taskFiles = normalizedSnapshotFiles(tasksEntity);
      await buildBoardFromTasks(board, taskFiles);
      const changed = await syncBoardStatuses(board, {
        tasksDir: tasksPath,
        createMissingTasks: false,
      });
      const nextMd = await board.toMarkdown();
      writeBoardFile(
        stageBoardWrite,
        boardPath,
        nextMd.split(/\r?\n/),
        changed,
      );
      await nextFsTick();
      const refreshedTaskFiles = normalizedSnapshotFiles(tasksEntity);
      const cards = await boardToCards(board, refreshedTaskFiles);
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
