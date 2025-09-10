import net from 'node:net';
import http from 'node:http';
import { spawn } from 'node:child_process';

import test from 'ava';

import { waitForTcp } from '../waitForTcp.js';
import { waitForHttp } from '../waitForHttp.js';
import { waitForLog } from '../waitForLog.js';
import { getFreePort } from '../port-pool.js';

const canBind = async (): Promise<boolean> => {
    try {
        const server = net.createServer();
        await new Promise<void>((resolve, reject) => {
            server.once('error', reject);
            server.listen({ host: '127.0.0.1', port: 0 }, () => resolve());
        });
        await new Promise<void>((resolve) => server.close(() => resolve()));
        return true;
    } catch (e) {
        return false;
    }
};

test('getFreePort returns an available port that can bind', async (t) => {
    if (!(await canBind())) {
        t.pass();
        return;
    }
    const port = await getFreePort();
    t.true(typeof port === 'number' && port > 0);

    // Verify we can bind to it immediately after
    const server = net.createServer();
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen({ host: '127.0.0.1', port }, () => resolve());
    });
    t.pass();
    await new Promise<void>((resolve) => server.close(() => resolve()));
});

test('waitForTcp resolves when server is listening', async (t) => {
    if (!(await canBind())) {
        t.pass();
        return;
    }
    const server = net.createServer();
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen({ host: '127.0.0.1', port: 0 }, () => resolve());
    });
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;

    await t.notThrowsAsync(waitForTcp(port, '127.0.0.1', 500));
    await new Promise<void>((resolve) => server.close(() => resolve()));
});

test('waitForTcp rejects if nothing listens', async (t) => {
    // Pick a high random port; keep timeout low for speed
    const port = 60_000 + Math.floor(Math.random() * 3000);
    await t.throwsAsync(waitForTcp(port, '127.0.0.1', 200), { message: /TCP not ready/ });
});

test('waitForHttp resolves on reachable HTTP URL (2xx/4xx)', async (t) => {
    if (!(await canBind())) {
        t.pass();
        return;
    }
    const server = http.createServer((req, res) => {
        if (req.url === '/ok') {
            res.writeHead(200, { 'content-type': 'text/plain' });
            res.end('ok');
        } else {
            res.writeHead(404);
            res.end();
        }
    });
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen({ host: '127.0.0.1', port: 0 }, () => resolve());
    });
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    const base = `http://127.0.0.1:${port}`;

    await t.notThrowsAsync(waitForHttp(`${base}/ok`, 500));
    await t.notThrowsAsync(waitForHttp(`${base}/missing`, 500)); // 404 < 500 counts as ready

    await new Promise<void>((resolve) => server.close(() => resolve()));
});

test('waitForHttp rejects when unreachable', async (t) => {
    const url = 'http://127.0.0.1:9/'; // TCP port 9 is usually closed
    await t.throwsAsync(waitForHttp(url, 200), { message: /HTTP not ready/ });
});

test('waitForLog resolves when pattern appears on stdout/stderr', async (t) => {
    // Delay output slightly to avoid race with attaching listeners
    const code = "setTimeout(() => console.log('READY'), 50); setTimeout(() => {}, 250)";
    const child = spawn('node', ['-e', code], { stdio: 'pipe' });
    await t.notThrowsAsync(waitForLog(child, /READY/, 500));
});

test('waitForLog rejects if process exits before readiness', async (t) => {
    const code = 'process.exit(0)';
    const child = spawn('node', ['-e', code], { stdio: 'pipe' });
    await t.throwsAsync(waitForLog(child, /NEVER/, 500), { message: /Process exited/ });
});
