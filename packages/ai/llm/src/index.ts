/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
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
export const loadModel = (() => {
    /* eslint-disable functional/no-let */
    let driver: LLMDriver | null = null;
    /* eslint-enable functional/no-let */
    return async (): Promise<LLMDriver> => {
        if (!driver) driver = await loadDriver();
        return driver;
    };
})();

const log = createLogger({ service: 'llm' });

type GenerateFn = (args: GenerateArgs) => Promise<unknown>;

const generateState = (() => {
    /* eslint-disable functional/no-let */
    let fn: GenerateFn = async ({ prompt, context = [], format, tools = [] }: GenerateArgs): Promise<unknown> => {
        const d = await loadModel();
        return d.generate({ prompt, context: context as ContextItem[], format, tools });
    };
    /* eslint-enable functional/no-let */
    return {
        get: (): GenerateFn => fn,
        set: (newFn: GenerateFn): void => {
            fn = newFn;
        },
    };
})();

export function setGenerateFn(fn: GenerateFn): void {
    generateState.set(fn);
}

export const generate = async (args: Readonly<GenerateArgs>): Promise<unknown> => {
    return retry(() => generateState.get()({ ...args }), {
        attempts: 6,
        backoff: (a: number) => (a - 1) * 1610,
    });
};

const brokerState = (() => {
    /* eslint-disable functional/no-let */
    let b: Broker | null = null;
    /* eslint-enable functional/no-let */
    return {
        get: (): Broker | null => b,
        set: (broker: Broker): void => {
            b = broker;
        },
    };
})();

export function setBroker(b: Readonly<Broker>): void {
    brokerState.set(b);
}

export async function handleTask(task: Readonly<BrokerTask>): Promise<void> {
    const payload = task.payload ?? ({} as TaskPayload);
    const { prompt, context = [], format = null, tools = [], replyTopic } = payload;
    const reply = await generate({ prompt, context, format, tools });
    log.info('handling llm task', { task });
    const b = brokerState.get();
    if (replyTopic && b) {
        b.publish(replyTopic, { reply, taskId: task.id });
    }
}

app.post('/generate', (req: Request, res: Response) => {
    const { prompt, context = [], format = null, tools = [] } = (req.body || {}) as GenerateArgs;
    generate({ prompt, context, format, tools })
        .then((reply) => {
            res.json({ reply });
        })
        .catch((err) => {
            const error = err as Error;
            res.status(500).json({ error: error.message });
        });
});

const MODULE_NOT_FOUND = 'ERR_MODULE_NOT_FOUND';
const PACKAGE_PATH_NOT_EXPORTED = 'ERR_PACKAGE_PATH_NOT_EXPORTED';

async function importWithFallback<TModule>(specs: readonly (string | undefined)[]): Promise<TModule> {
    let lastError: Error | undefined;
    for (const spec of specs) {
        if (!spec) continue;
        try {
            return (await import(spec)) as TModule;
        } catch (err) {
            const error = err as Error & { readonly code?: string };
            lastError = error;
            if (error.code !== MODULE_NOT_FOUND && error.code !== PACKAGE_PATH_NOT_EXPORTED) {
                throw error;
            }
        }
    }
    if (lastError) throw lastError;
    throw new Error('Unable to resolve module');
}

const serviceTemplateFallback = new URL('../../legacy/serviceTemplate.js', import.meta.url).href;
const heartbeatFallback = new URL('../../legacy/heartbeat/index.js', import.meta.url).href;

export function initBroker(): Promise<void> {
    const specifiers = [
        process.env.LLM_SERVICE_TEMPLATE,
        '@promethean/legacy/serviceTemplate.js',
        serviceTemplateFallback,
    ] as const;
    return importWithFallback<{
        readonly startService: (
            opts: Readonly<{
                id: string;
                queues: readonly string[];
                handleTask: (task: Readonly<BrokerTask>) => Promise<void>;
            }>,
        ) => Promise<Broker>;
    }>(specifiers)
        .then(({ startService }) =>
            startService({
                id: process.env.name || 'llm',
                queues: ['llm.generate'],
                handleTask,
            }),
        )
        .then((broker) => {
            setBroker(broker);
        })
        .catch((err) => {
            log.error('Failed to initialize broker', {
                err: err as Error,
                tried: specifiers,
            });
        });
}

export async function initHeartbeat(): Promise<void> {
    const { HeartbeatClient } = await importWithFallback<{
        readonly HeartbeatClient: new (...args: readonly unknown[]) => {
            sendOnce(): Promise<void>;
            start(): void;
        };
    }>(['@promethean/legacy/heartbeat/index.js', heartbeatFallback]);
    const hb = new HeartbeatClient({ name: process.env.name || 'llm' });
    await hb.sendOnce();
    hb.start();
}

export async function initServer(port: number): Promise<http.Server> {
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server, path: '/generate' });
    wss.on('connection', (ws: WebSocket) => {
        ws.on('message', (data: RawData) => {
            Promise.resolve()
                .then(() => JSON.parse(data.toString()) as GenerateArgs)
                .then(({ prompt, context = [], format = null, tools = [] }) =>
                    generate({ prompt, context, format, tools }),
                )
                .then((reply) => {
                    ws.send(JSON.stringify({ reply }));
                })
                .catch((err) => {
                    const error = err as Error;
                    ws.send(JSON.stringify({ error: error.message }));
                });
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
