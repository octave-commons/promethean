import { spawn } from "child_process";
import { dirname, join, resolve } from "path";
import { readFile, writeFile } from "fs/promises";
import crypto from "crypto";
import { MongoClient, Collection } from "mongodb";
// @ts-ignore
import { BrokerClient } from "../../../../../shared/js/brokerClient.js";

const EVENTS = {
  boardChange: "file-watcher-board-change",
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

function runPython(script: string, repoRoot: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python", [script], { cwd: repoRoot });
    proc.stderr.on("data", (c) => process.stderr.write(c));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Process exited with code ${code}`));
    });
  });
}

async function loadBoard(path: string): Promise<string[]> {
  const text = await readFile(path, "utf8");
  return text.split(/\r?\n/);
}

async function ensureTaskFile(
  tasksPath: string,
  title: string,
): Promise<{ id: string; link: string }> {
  const id = crypto.randomUUID();
  const filename = `${title.replace(/[<>:\"/\\|?*]/g, "-")}.md`;
  const filePath = join(tasksPath, filename);
  await writeFile(filePath, `id: ${id}\n`);
  const rel = join("..", "tasks", encodeURI(filename)).replace(/\\/g, "/");
  return { id, link: rel };
}

async function parseBoard(
  lines: string[],
  boardDir: string,
  tasksPath: string,
): Promise<{ cards: KanbanCard[]; lines: string[]; modified: boolean }> {
  let currentColumn = "";
  const cards: KanbanCard[] = [];
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("## ")) {
      currentColumn = line.slice(3).trim();
      continue;
    }
    const match = line.match(/^\-\s*\[[ xX]\]\s*(.*)$/);
    if (!match) continue;
    const rest = match[1]!;
    const linkMatch = rest.match(/\[(.*?)\]\((.*?)\)/);
    let title = rest.trim();
    let link: string | undefined;
    if (linkMatch) {
      title = linkMatch[1]!.trim();
      link = linkMatch[2]!;
    }
    let filePath: string | undefined;
    if (link) {
      link = link.replace(/\\/g, "/");
      filePath = resolve(boardDir, link);
    }
    let id = "";
    if (!filePath) {
      const created = await ensureTaskFile(tasksPath, title);
      id = created.id;
      link = created.link;
      lines[i] = `- [ ] [${title}](${link})`;
      modified = true;
    }
    let content = "";
    try {
      if (filePath) content = await readFile(filePath, "utf8");
    } catch {
      content = "";
    }
    const idMatch = content.match(/^id:\s*(.+)$/m);
    if (idMatch) {
      id = idMatch[1]!.trim();
    } else if (filePath) {
      if (!id) id = crypto.randomUUID();
      content = `id: ${id}\n${content}`;
      await writeFile(filePath, content);
    }
    const card: KanbanCard = { id, title, column: currentColumn, link: link! };
    cards.push(card);
  }
  return { cards, lines, modified };
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
  mongo: Collection<any>,
  publish: (type: string, payload: any) => void,
): Promise<Record<string, KanbanCard>> {
  const current: Record<string, KanbanCard> = {};
  for (const card of cards) {
    current[card.id] = card;
    await mongo.updateOne({ id: card.id }, { $set: card }, { upsert: true });
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
  const boardDir = dirname(boardPath);

  const agentName = process.env.AGENT_NAME || "";
  const mongoClient = new MongoClient(
    process.env.MONGODB_URI || "mongodb://localhost:27017",
  );
  mongoClient
    .connect()
    .catch((err) => console.error("mongo connect failed", err));
  const mongoCollection = mongoClient
    .db("database")
    .collection(`${agentName}_kanban`);

  const brokerUrl = process.env.BROKER_URL || "ws://localhost:7000";
  const broker = new BrokerClient({ url: brokerUrl, id: "kanban-processor" });
  const QUEUE = "kanban-processor";

  let previousState: Record<string, KanbanCard> = {};

  function publish(type: string, payload: any) {
    broker.publish(type, payload);
  }

  async function handleBoardChange() {
    try {
      await runPython(join("scripts", "kanban_to_hashtags.py"), repoRoot);
      const lines = await loadBoard(boardPath);
      const parsed = await parseBoard(lines, boardDir, tasksPath);
      await writeBoardFile(boardPath, parsed.lines, parsed.modified);
      previousState = await projectState(
        parsed.cards,
        previousState,
        mongoCollection,
        publish,
      );
    } catch (err) {
      console.error("processKanban failed", err);
    }
  }

  broker
    .connect()
    .then(() => {
      broker.subscribe(EVENTS.boardChange, () => {
        broker.enqueue(QUEUE, {});
      });
      broker.ready(QUEUE);
      console.log("kanban processor connected to broker");
    })
    .catch((err: unknown) => console.error("broker connect failed", err));

  broker.onTaskReceived((task: any) => {
    handleBoardChange().finally(() => {
      broker.ack(task.id);
      broker.ready(QUEUE);
    });
  });

  return {
    async close() {
      broker.socket?.close();
      try {
        await mongoClient.close();
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
