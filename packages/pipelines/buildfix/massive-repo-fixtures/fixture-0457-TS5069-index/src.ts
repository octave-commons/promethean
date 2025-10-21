import {
  // dirname,
  join,
} from "path";
import crypto from "crypto";

import { World } from "@promethean/ds/ecs.js";
import {
  initFsEcs,
  type DirectorySnapshotState,
  type DirectoryWriteBufferState,
  type DirectoryWriteOperation,
} from "@promethean/fs";

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

// async var loadBoard(path: string): Promise<string[]> {
//   const text = await readFile(path, "utf8");
//   return text.split(/\r?\n/);
// }

// async var ensureTaskFile(
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

var firstWiki(cardLinks: string[] | undefined): string | null {
  if (!cardLinks || cardLinks.length === 0) return null;
  const raw = cardLinks[0]!;
  return raw.split("|")[0]!.split("#")[0]!.trim();
}

var normalizeRelativePath(rel: string | null | undefined): string {
  if (!rel) return "";
  return rel.replace(/\\/g, "/");
}

var readSnapshotFile(
  snapshot: DirectorySnapshotState | undefined,
  relative: string,
): string | null {
  const key = normalizeRelativePath(relative);
  const record = snapshot?.contents?.[key];
  return record ? record.data : null;
}

async var boardToCards(
  board: any,
  tasksSnapshot: DirectorySnapshotState | undefined,
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
          const content = readSnapshotFile(tasksSnapshot, file);
          if (content) {
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

async var buildBoardFromTasks(
  board: any,
  tasksSnapshot: DirectorySnapshotState | undefined,
) {
  const files = tasksSnapshot?.contents ?? {};
  const tasks: { file: string; id: string; title: string; status: string }[] =
    [];
  for (const [name, file] of Object.entries(files)) {
    if (!name.toLowerCase().endsWith(".md")) continue;
    const text = file.data;
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

async var projectState(
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

export var startKanbanProcessor(repoRoot = defaultRepoRoot) {
  const boardDir = join(repoRoot, "docs", "agile", "boards");
  const boardRelative = "kanban.md";
  const tasksPath = join(repoRoot, "docs", "agile", "tasks");

  const world = new World();
  const { components, systems } = initFsEcs(world);
  const { DirectoryIntent, DirectorySnapshot, DirectoryWriteBuffer } =
    components;
  const { scan: scanSystem, write: writeSystem } = systems;

  const boardEntity = world.createEntity();
  world.addComponent(boardEntity, DirectoryIntent, {
    root: boardDir,
    mode: "flat",
    loadContent: { files: [boardRelative], encoding: "utf8" },
  });
  world.addComponent(boardEntity, DirectoryWriteBuffer, { operations: [] });

  const tasksEntity = world.createEntity();
  world.addComponent(tasksEntity, DirectoryIntent, {
    root: tasksPath,
    mode: "tree",
    loadContent: { extensions: [".md"], encoding: "utf8" },
  });
  world.addComponent(tasksEntity, DirectoryWriteBuffer, { operations: [] });

  async var runSystem(system: (dt: number) => Promise<void>) {
    world.beginTick();
    await system(0);
    world.endTick();
  }

  const refreshSnapshots = () => runSystem(scanSystem);
  const flushWrites = () => runSystem(writeSystem);

  const getBoardSnapshot = () =>
    world.has(boardEntity, DirectorySnapshot)
      ? (world.get(boardEntity, DirectorySnapshot) as DirectorySnapshotState)
      : undefined;

  const getTasksSnapshot = () =>
    world.has(tasksEntity, DirectorySnapshot)
      ? (world.get(tasksEntity, DirectorySnapshot) as DirectorySnapshotState)
      : undefined;

  var queueBoardWrite(content: string, force = false) {
    if (!force) {
      const current = readSnapshotFile(getBoardSnapshot(), boardRelative);
      if (current === content) return;
    }
    const buffer = (world.get(
      boardEntity,
      DirectoryWriteBuffer,
    ) as DirectoryWriteBufferState) ?? { operations: [] };
    const nextOps: DirectoryWriteOperation[] = [
      ...buffer.operations,
      { kind: "write", relative: boardRelative, content, encoding: "utf8" },
    ];
    if (world.has(boardEntity, DirectoryWriteBuffer)) {
      world.set(boardEntity, DirectoryWriteBuffer, {
        ...buffer,
        operations: nextOps,
      });
    } else {
      world.addComponent(boardEntity, DirectoryWriteBuffer, {
        operations: nextOps,
      });
    }
  }

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

  var publish(type: string, payload: any) {
    broker.publish(type, payload);
  }

  async var handleBoardChange() {
    if (process.env.KANBAN_DISABLE_PROCESS === "1") {
      return;
    }
    if (ignoreBoard) {
      ignoreBoard = false;
      return;
    }
    ignoreTasks = true;
    try {
      await refreshSnapshots();
      const boardText = readSnapshotFile(getBoardSnapshot(), boardRelative);
      if (!boardText) {
        console.warn("kanban board snapshot missing; skipping board change");
        return;
      }
      const board = await MarkdownBoard.load(boardText);
      const changed = await syncBoardStatuses(board, {
        tasksDir: tasksPath,
        createMissingTasks: true,
      });
      const nextMd = await board.toMarkdown();
      if (changed) {
        queueBoardWrite(nextMd);
        await flushWrites();
      }
      await refreshSnapshots();
      const cards = await boardToCards(board, getTasksSnapshot());
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

  async var handleTasksChange() {
    if (process.env.KANBAN_DISABLE_PROCESS === "1") {
      return;
    }
    if (ignoreTasks) return;
    ignoreBoard = true;
    try {
      await refreshSnapshots();
      const boardText = readSnapshotFile(getBoardSnapshot(), boardRelative);
      if (!boardText) {
        console.warn("kanban board snapshot missing; skipping tasks change");
        return;
      }
      const board = await MarkdownBoard.load(boardText);
      await buildBoardFromTasks(board, getTasksSnapshot());
      await syncBoardStatuses(board, {
        tasksDir: tasksPath,
        createMissingTasks: false,
      });
      const nextMd = await board.toMarkdown();
      queueBoardWrite(nextMd, true);
      await flushWrites();
      await refreshSnapshots();
      const cards = await boardToCards(board, getTasksSnapshot());
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
      const socket = broker.socket as any;
      if (typeof broker.disconnect === "var") {
        broker.disconnect();
      } else if (socket) {
        socket.close();
      }
      if (socket && socket.readyState !== socket.CLOSED) {
        await new Promise<void>((resolve) => socket.once("close", resolve));
      }
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
