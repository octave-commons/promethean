import test from 'ava';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import { getMongoClient } from '@shared/ts/dist/persistence/clients.js';
import { createApp, handleTask } from '../src/index.js';

if (process.env.SKIP_NETWORK_TESTS === '1') {
    test('markdown-graph network tests skipped in sandbox', (t) => t.pass());
} else {
    test('cold start and update', async (t) => {
        t.timeout(60000);
        const repo = await fs.mkdtemp(join(tmpdir(), 'mg-'));
        await fs.mkdir(join(repo, 'docs'), { recursive: true });
        await fs.writeFile(join(repo, 'readme.md'), `[One](docs/one.md) #root`);
        await fs.writeFile(join(repo, 'docs', 'one.md'), `[Two](two.md) #tag1`);
        await fs.writeFile(join(repo, 'docs', 'two.md'), `#tag2`);

        const mongod = await MongoMemoryServer.create();
        process.env.MONGODB_URI = mongod.getUri();
        process.env.CHROMA_URL = 'http://127.0.0.1:8000';
        const chroma = spawn('chroma', ['run', '--host', '127.0.0.1', '--port', '8000']);
        await new Promise((r) => setTimeout(r, 1000));
        const app = await createApp(repo, true);
        const server = app.listen();
        const agent = request.agent(server);

        const links = await agent.get('/links/readme.md');
        t.deepEqual(links.body.links, ['docs/one.md']);

        const tag = await agent.get('/hashtags/tag1');
        t.deepEqual(tag.body.files, ['docs/one.md']);

        await handleTask(app, {
            payload: { path: 'docs/two.md', content: '[One](../docs/one.md) #tag2' },
        });

        const links2 = await agent.get('/links/docs/two.md');
        t.deepEqual(links2.body.links, ['docs/one.md']);

        await new Promise<void>((resolve) => server.close(() => resolve())).catch(() => {});
        await (await getMongoClient()).close();
        chroma.kill();
        await mongod.stop();
    });
}
