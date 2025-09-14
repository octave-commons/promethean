import http from 'http';

import type { Request, Response, Express } from 'express';
import type { WebSocket, RawData } from 'ws';
import express from 'express';
import { WebSocketServer } from 'ws';
import { retry, createLogger } from '@promethean/utils';

import { loadDriver, LLMDriver } from './drivers/index.js';
import type { Tool } from './tools.js';

type ContextItem = { readonly role: string; readonly content: string };
type GenerateArgs = {
    readonly prompt: string;
    readonly context?: readonly ContextItem[];
    readonly format?: unknown;
    readonly tools?: Tool[];
};

type TaskPayload = GenerateArgs & {
    readonly replyTopic?: string;
};

export type BrokerTask = {
    readonly id: string;
    readonly payload?: TaskPayload;
};

export type Broker = {
    publish(topic: string, message: unknown): void;
};

export const app: Express = express();
app.use(express.json({ limit: '500mb' }));

/* eslint-disable functional/no-let */
let driver: LLMDriver | null = null;

export async function loadModel(): Promise<LLMDriver> {
    if (!driver) driver = await loadDriver();
    return driver;
}

const log = createLogger({ service: 'llm' });

let generateFn = async ({ prompt, context = [], format, tools = [] }: GenerateArgs): Promise<unknown> => {
    const d = await loadModel();
    return d.generate({ prompt, context: context as ContextItem[], format, tools });
};

export function setGenerateFn(fn: typeof generateFn): void {
    generateFn = fn;
}

export const generate = async (args: Readonly<GenerateArgs>): Promise<unknown> => {
    return retry(() => generateFn({ ...args }), {
        attempts: 6,
        backoff: (a: number) => (a - 1) * 1610,
    });
};

let broker: Broker | null = null;
/* eslint-enable functional/no-let */

export function setBroker(b: Broker): void {
    broker = b;
}

export async function handleTask(task: BrokerTask): Promise<void> {
    const payload = task.payload ?? ({} as TaskPayload);
    const { prompt, context = [], format = null, tools = [], replyTopic } = payload;
    const reply = await generate({ prompt, context, format, tools });
    log.info('handling llm task', { task });
    if (replyTopic && broker) {
        broker.publish(replyTopic, { reply, taskId: task.id });
    }
}

app.post('/generate', async (req: Request, res: Response) => {
    const { prompt, context = [], format = null, tools = [] } = (req.body || {}) as GenerateArgs;
    // eslint-disable-next-line functional/no-try-statements
    try {
        const reply = await generate({ prompt, context, format, tools });
        res.json({ reply });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
});

export async function initBroker(): Promise<void> {
    // eslint-disable-next-line functional/no-try-statements
    try {
        const { startService } = (await import('@shared/js/serviceTemplate.js')) as {
            startService(opts: {
                id: string;
                queues: readonly string[];
                handleTask: (task: BrokerTask) => Promise<void>;
            }): Promise<Broker>;
        };
        broker = await startService({
            id: process.env.name || 'llm',
            queues: ['llm.generate'],
            handleTask,
        });
    } catch (err) {
        log.error('Failed to initialize broker', { err: err as Error });
    }
}

export async function initHeartbeat(): Promise<void> {
    const { HeartbeatClient } = await import('@promethean/legacy/heartbeat/index.js');
    const hb = new HeartbeatClient({ name: process.env.name || 'llm' });
    await hb.sendOnce();
    hb.start();
}

export async function initServer(port: number): Promise<http.Server> {
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server, path: '/generate' });
    wss.on('connection', (ws: WebSocket) => {
        ws.on('message', async (data: RawData) => {
            // eslint-disable-next-line functional/no-try-statements
            try {
                const parsed = JSON.parse(data.toString()) as unknown;
                const { prompt, context = [], format = null, tools = [] } = parsed as GenerateArgs;
                const reply = await generate({ prompt, context, format, tools });
                ws.send(JSON.stringify({ reply }));
            } catch (err) {
                const error = err as Error;
                ws.send(JSON.stringify({ error: error.message }));
            }
        });
    });

    return new Promise<http.Server>((resolve) => {
        const s = server.listen(port, () => resolve(s));
    });
}

export async function start(port = Number(process.env.LLM_PORT) || 8888): Promise<http.Server> {
    if (process.env.DISABLE_BROKER !== '1') {
        await initBroker();
        await initHeartbeat();
    }
    return initServer(port);
}

if (process.env.NODE_ENV !== 'test') {
    start().catch((err: unknown) => {
        log.error('Failed to start LLM service', { err: err as Error });
        process.exit(1);
    });
}
