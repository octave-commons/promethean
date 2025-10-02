import net from 'node:net';

import test from 'ava';

import { startProcess } from '../startProcess.js';
import { getFreePort } from '../port-pool.js';

test('startProcess waits for HTTP readiness', async (t) => {
    const port = await getFreePort();
    const code = `
    const http = require('node:http');
    const port = ${port};
    const server = http.createServer((req, res) => {
      if (req.url === '/health') { res.statusCode = 200; res.end('ok'); return; }
      res.end('hi');
    });
    server.listen({ host: '127.0.0.1', port }, () => {});
    setTimeout(() => {}, 2000);
  `;
    const { stop } = await startProcess({
        cmd: 'node',
        args: ['-e', code],
        cwd: process.cwd(),
        ready: { kind: 'http', url: `http://127.0.0.1:${port}/health` },
    });
    t.pass();
    await stop();
});

test('startProcess waits for TCP readiness', async (t) => {
    const port = await getFreePort();
    const code = `
    const net = require('node:net');
    const port = ${port};
    const server = net.createServer(() => {});
    server.listen({ host: '127.0.0.1', port }, () => {});
    setTimeout(() => {}, 2000);
  `;
    const { stop } = await startProcess({
        cmd: 'node',
        args: ['-e', code],
        cwd: process.cwd(),
        ready: { kind: 'tcp', host: '127.0.0.1', port },
    });
    // sanity: able to connect now
    await new Promise<void>((resolve, reject) => {
        const s = net.createConnection(port, '127.0.0.1');
        s.once('connect', () => {
            s.end();
            resolve();
        });
        s.once('error', reject);
    });
    await stop();
    t.pass();
});

test('startProcess with log readiness requires stdio: pipe', async (t) => {
    const code = "console.log('READY'); setTimeout(() => {}, 200)";
    await t.throwsAsync(
        async () =>
            startProcess({
                cmd: 'node',
                args: ['-e', code],
                cwd: process.cwd(),
                // stdio omitted -> defaults to 'inherit'
                ready: { kind: 'log', pattern: /READY/ },
            }),
        { message: /requires stdio: "pipe"/ },
    );
});
