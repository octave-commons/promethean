import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import { GraphDB } from './graph.js';

export async function createApp(
    mongoUrl: string,
    repoPath: string,
    coldStart = false,
): Promise<Application> {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = new GraphDB(client, repoPath);
    if (coldStart) {
        await db.coldStart();
    }
    const app = express();
    app.use(bodyParser.json());
    app.locals.graph = db;
    app.locals.mongoClient = client;

    app.post('/update', async (req, res) => {
        const { path, content } = req.body as { path: string; content: string };
        await db.updateFile(path, content);
        res.json({ status: 'ok' });
    });

    app.get('/links/*', async (req, res) => {
        const target = (req.params as any)[0];
        const links = await db.getLinks(target);
        res.json({ links });
    });

    app.get('/hashtags/:tag', async (req, res) => {
        const files = await db.getFilesWithTag(req.params.tag);
        res.json({ files });
    });

    return app;
}

export async function handleTask(
    app: Application,
    task: { payload?: { path?: string; content?: string } },
) {
    const payload = task?.payload || {};
    const { path, content = '' } = payload;
    if (typeof path === 'string' && path) {
        const db: GraphDB = app.locals.graph;
        await db.updateFile(path, content);
    }
}

export async function start() {
    const repo = process.env.REPO_PATH || '.';
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const cold = process.env.COLD_START === '1';
    const app = await createApp(url, repo, cold);
    try {
        const { startService } = await import(
            /* @ts-ignore */ '../../../../shared/js/serviceTemplate.js'
        );
        const broker = await startService({
            id: process.env.name || 'markdown-graph',
            queues: ['markdown_graph.update'],
            handleTask: (task: any) => handleTask(app, task),
        });
        app.locals.broker = broker;
    } catch (err) {
        console.error('Failed to initialize broker', err);
    }
    const port = Number(process.env.PORT) || 8123;
    return app.listen(port, '0.0.0.0', () => {
        console.log(`markdown-graph listening on ${port}`);
    });
}

if (process.env.NODE_ENV !== 'test') {
    start();
}
