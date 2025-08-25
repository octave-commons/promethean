import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import ollama from 'ollama';

export const MODEL = process.env.LLM_MODEL || 'gemma3:latest';

export const app = express();
app.use(express.json({ limit: '500mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../../../../sites/llm-chat')));

let callOllamaFn = async ({ prompt, context, format }, retry = 0) => {
    try {
        for (let c of context) console.log(c);
        const res = await ollama.chat({
            model: MODEL,
            messages: [{ role: 'system', content: prompt }, ...context],
            format,
        });
        const content = res.message.content;
        return format ? JSON.parse(content) : content;
    } catch (err) {
        if (retry < 5) {
            await new Promise((r) => setTimeout(r, retry * 1610));
            return callOllamaFn({ prompt, context, format }, retry + 1);
        }
        throw err;
    }
};

export function setCallOllamaFn(fn) {
    callOllamaFn = fn;
}

export async function callOllama(args, retry = 0) {
    return callOllamaFn(args, retry);
}

let broker;

export function setBroker(b) {
    broker = b;
}

export async function handleTask(task) {
    const payload = task?.payload || {};
    const { prompt, context = [], format = null, replyTopic } = payload;
    const reply = await callOllamaFn({ prompt, context, format });
    console.log('handling llm task', task);
    if (replyTopic && broker) {
        broker.publish(replyTopic, { reply, taskId: task.id });
    }
}

app.post('/generate', async (req, res) => {
    const { prompt, context = [], format = null } = req.body || {};
    try {
        const reply = await callOllamaFn({ prompt, context, format });
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export async function start(port = Number(process.env.LLM_PORT) || 8888) {
    try {
        const { startService } = await import('../../../../shared/js/serviceTemplate.js');
        broker = await startService({
            id: process.env.name || 'llm',
            queues: ['llm.generate'],
            handleTask,
        });
    } catch (err) {
        console.error('Failed to initialize broker', err);
    }
    try {
        const { HeartbeatClient } = await import('../../../../shared/js/heartbeat/index.js');
        const hb = new HeartbeatClient({ name: process.env.name || 'llm' });
        await hb.sendOnce();
        hb.start();
    } catch (err) {
        console.error('Failed to initialize heartbeat', err);
    }

    const server = http.createServer(app);
    const wss = new WebSocketServer({ server, path: '/generate' });
    wss.on('connection', (ws) => {
        ws.on('message', async (data) => {
            try {
                const { prompt, context = [], format = null } = JSON.parse(data.toString());
                const reply = await callOllamaFn({ prompt, context, format });
                ws.send(JSON.stringify({ reply }));
            } catch (err) {
                ws.send(JSON.stringify({ error: err.message }));
            }
        });
    });

    return new Promise((resolve) => {
        const s = server.listen(port, () => resolve(s));
    });
}

if (process.env.NODE_ENV !== 'test') {
    start().catch((err) => {
        console.error('Failed to start LLM service', err);
        process.exit(1);
    });
}
