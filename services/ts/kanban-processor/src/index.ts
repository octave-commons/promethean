import { spawn } from 'child_process';
import { dirname, join, resolve } from 'path';
import { readFile, writeFile } from 'fs/promises';
import crypto from 'crypto';
import { ContextStore } from '@shared/ts/dist/persistence/contextStore.js';
import { DualStoreManager } from '@shared/ts/dist/persistence/dualStore.js';
import { getMongoClient } from '@shared/ts/dist/persistence/clients.js';
import type { MongoClient } from 'mongodb';
// @ts-ignore
import { BrokerClient } from '@shared/js/brokerClient.js';

const EVENTS = {
    boardChange: 'file-watcher-board-change',
    taskAdd: 'file-watcher-task-add',
    taskChange: 'file-watcher-task-change',
    cardCreated: 'kanban-card-created',
    cardMoved: 'kanban-card-moved',
    cardRenamed: 'kanban-card-renamed',
    cardTaskChanged: 'kanban-card-task-changed',
};

interface KanbanCard {
    id: string;
    title: string;
    column: string;
    link: string;
}

const defaultRepoRoot = process.env.REPO_ROOT || '';

function runPython(script: string, repoRoot: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn('python', [script], { cwd: repoRoot });
        proc.stderr.on('data', (c) => process.stderr.write(c));
        proc.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Process exited with code ${code}`));
        });
    });
}

function runPythonCapture(script: string, repoRoot: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn('python', [script], { cwd: repoRoot });
        let stdout = '';
        proc.stdout.on('data', (c) => (stdout += c.toString()));
        proc.stderr.on('data', (c) => process.stderr.write(c));
        proc.on('close', (code) => {
            if (code === 0) resolve(stdout);
            else reject(new Error(`Process exited with code ${code}`));
        });
    });
}

async function loadBoard(path: string): Promise<string[]> {
    const text = await readFile(path, 'utf8');
    return text.split(/\r?\n/);
}

async function ensureTaskFile(
    tasksPath: string,
    title: string,
): Promise<{ id: string; link: string }> {
    const id = crypto.randomUUID();
    const filename = `${title.replace(/[<>:\"/\\|?*]/g, '-')}.md`;
    const filePath = join(tasksPath, filename);
    await writeFile(filePath, `id: ${id}\n`);
    const rel = join('..', 'tasks', encodeURI(filename)).replace(/\\/g, '/');
    return { id, link: rel };
}

async function parseBoard(
    lines: string[],
    boardDir: string,
    tasksPath: string,
): Promise<{ cards: KanbanCard[]; lines: string[]; modified: boolean }> {
    let currentColumn = '';
    const cards: KanbanCard[] = [];
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        if (line.startsWith('## ')) {
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
            link = link.replace(/\\/g, '/');
            filePath = resolve(boardDir, link);
        }
        let id = '';
        if (!filePath) {
            const created = await ensureTaskFile(tasksPath, title);
            id = created.id;
            link = created.link;
            lines[i] = `- [ ] [${title}](${link})`;
            modified = true;
        }
        let content = '';
        try {
            if (filePath) content = await readFile(filePath, 'utf8');
        } catch {
            content = '';
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

async function writeBoardFile(path: string, lines: string[], modified: boolean) {
    if (modified) {
        await writeFile(path, lines.join('\n'));
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
    const boardPath = join(repoRoot, 'docs', 'agile', 'boards', 'kanban.md');
    const tasksPath = join(repoRoot, 'docs', 'agile', 'tasks');
    const boardDir = dirname(boardPath);

    const ctx = new ContextStore();
    let kanbanStore: DualStoreManager<string, string> | null = null;
    let mongoClient: MongoClient | null = null;
    if (process.env.NODE_ENV !== 'test') {
        getMongoClient()
            .then((client) => {
                mongoClient = client;
                return ctx.createCollection('kanban', 'title', 'updatedAt');
            })
            .then((store: DualStoreManager<string, string>) => {
                kanbanStore = store;
            })
            .catch((err: unknown) => console.error('dual store init failed', err));
    }

    const brokerUrl = process.env.BROKER_URL || 'ws://localhost:7000';
    const broker = new BrokerClient({ url: brokerUrl, id: 'kanban-processor' });
    const QUEUE = 'kanban-processor';

    let previousState: Record<string, KanbanCard> = {};
    let ignoreBoard = false;
    let ignoreTasks = false;

    function publish(type: string, payload: any) {
        broker.publish(type, payload);
    }

    async function handleBoardChange() {
        if (ignoreBoard) {
            ignoreBoard = false;
            return;
        }
        ignoreTasks = true;
        try {
            await runPython(join('scripts', 'kanban_to_hashtags.py'), repoRoot);
            const lines = await loadBoard(boardPath);
            const parsed = await parseBoard(lines, boardDir, tasksPath);
            await writeBoardFile(boardPath, parsed.lines, parsed.modified);
            previousState = await projectState(parsed.cards, previousState, publish, kanbanStore);
        } catch (err) {
            console.error('processKanban failed', err);
        } finally {
            setTimeout(() => {
                ignoreTasks = false;
            }, 500);
        }
    }

    async function handleTasksChange() {
        if (ignoreTasks) return;
        ignoreBoard = true;
        try {
            const boardText = await runPythonCapture(
                join('scripts', 'hashtags_to_kanban.py'),
                repoRoot,
            );
            const lines = boardText.split(/\r?\n/);
            const parsed = await parseBoard(lines, boardDir, tasksPath);
            await writeBoardFile(boardPath, parsed.lines, true);
            previousState = await projectState(parsed.cards, previousState, publish, kanbanStore);
        } catch (err) {
            console.error('updateBoard failed', err);
        }
    }

    broker
        .connect()
        .then(() => {
            broker.subscribe(EVENTS.boardChange, () => {
                broker.enqueue(QUEUE, { kind: 'board' });
            });
            broker.subscribe(EVENTS.taskAdd, () => {
                broker.enqueue(QUEUE, { kind: 'tasks' });
            });
            broker.subscribe(EVENTS.taskChange, () => {
                broker.enqueue(QUEUE, { kind: 'tasks' });
            });
            broker.ready(QUEUE);
            console.log('kanban processor connected to broker');
        })
        .catch((err: unknown) => console.error('broker connect failed', err));

    broker.onTaskReceived((task: any) => {
        const kind = task.payload?.kind;
        const fn = kind === 'tasks' ? handleTasksChange : handleBoardChange;
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
                console.error('mongo close failed', err);
            }
        },
    };
}

if (process.env.NODE_ENV !== 'test') {
    startKanbanProcessor();
    console.log('Kanban processor running...');
}
