import type { Request, Response, Express } from 'express';
import type { WebSocket } from 'ws';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { loadDriver, LLMDriver } from './drivers/index.js';
import type { Tool } from './tools.js';

export const app: Express = express();
app.use(express.json({ limit: '500mb' }));

let driver: LLMDriver | null = null;

export async function loadModel(): Promise<LLMDriver> {
    if (!driver) driver = await loadDriver();
    return driver;
}

let generateFn = async (
    { prompt, context = [], format, tools = [] }: { prompt: string; context?: any[]; format?: any; tools?: Tool[] },
    retry = 0,
): Promise<any> => {
    try {
        const d = await loadModel();
        return await d.generate({ prompt, context, format, tools });
    } catch (err) {
        if (retry < 5) {
            await new Promise((r) => setTimeout(r, retry * 1610));
            return generateFn({ prompt, context, format, tools }, retry + 1);
        }
        throw err;
    }
};

export function setGenerateFn(fn: typeof generateFn) {
    generateFn = fn;
}

export async function generate(args: { prompt: string; context?: any[]; format?: any; tools?: Tool[] }, retry = 0) {
    return generateFn(args, retry);
}

let broker: any;

export function setBroker(b: any) {
    broker = b;
}

export async function handleTask(task: any) {
    const payload = task?.payload || {};
    const { prompt, context = [], format = null, tools = [], replyTopic } = payload;
    const reply = await generateFn({ prompt, context, format, tools });
    console.log('handling llm task', task);
    if (replyTopic && broker) {
        broker.publish(replyTopic, { reply, taskId: task.id });
    }
}

app.post('/generate', async (req: Request, res: Response) => {
    const { prompt, context = [], format = null, tools = [] } = req.body || {};
    try {
        const reply = await generateFn({ prompt, context, format, tools });
        res.json({ reply });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export async function start(port = Number(process.env.LLM_PORT) || 8888) {
    if (process.env.DISABLE_BROKER !== '1') {
        try {
            // @ts-ignore
            const { startService } = await import('@shared/js/serviceTemplate.js');
            broker = await startService({
                id: process.env.name || 'llm',
                queues: ['llm.generate'],
                handleTask,
            });
        } catch (err) {
            console.error('Failed to initialize broker', err);
        }
        // @ts-ignore
        const { HeartbeatClient } = await import('../../../../shared/js/heartbeat/index.js');
        const hb = new HeartbeatClient({ name: process.env.name || 'llm' });
        await hb.sendOnce();
        hb.start();
    }

    const server = http.createServer(app);
    const wss = new WebSocketServer({ server, path: '/generate' });
    wss.on('connection', (ws: WebSocket) => {
        ws.on('message', async (data: any) => {
            try {
                const { prompt, context = [], format = null, tools = [] } = JSON.parse(data.toString());
                const reply = await generateFn({ prompt, context, format, tools });
                ws.send(JSON.stringify({ reply }));
            } catch (err: any) {
                ws.send(JSON.stringify({ error: err.message }));
            }
        });
    });

    return new Promise<http.Server>((resolve) => {
        const s = server.listen(port, () => resolve(s));
    });
}

if (process.env.NODE_ENV !== 'test') {
    start().catch((err) => {
        console.error('Failed to start LLM service', err);
        process.exit(1);
    });
}
