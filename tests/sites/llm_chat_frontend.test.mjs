import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { startSitesServer } from '../../scripts/serve-sites.js';

process.env.NODE_ENV = 'test';
const { start: startProxy, stop: stopProxy } = await import('../../services/js/proxy/index.js');

async function startMockLLM() {
    const server = http.createServer((req, res) => {
        if (req.url === '/generate' && req.method === 'POST') {
            let body = '';
            req.on('data', (c) => (body += c));
            req.on('end', () => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ reply: 'hi' }));
            });
            return;
        }
        res.statusCode = 404;
        res.end();
    });
    await new Promise((resolve) => server.listen(0, resolve));
    return server;
}

test('LLM chat served and proxied via proxy service', async () => {
    const llm = await startMockLLM();
    const llmPort = llm.address().port;
    const proxy = await startProxy(0, { '/llm': `http://127.0.0.1:${llmPort}` });
    await new Promise((resolve) => proxy.on('listening', resolve));
    const proxyPort = proxy.address().port;
    const siteServer = await startSitesServer(0, `http://127.0.0.1:${proxyPort}`);
    const sitePort = siteServer.address().port;

    const page = await fetch(`http://127.0.0.1:${sitePort}/llm-chat/`);
    const text = await page.text();
    assert.ok(text.includes('LLM Chat'));

    const res = await fetch(`http://127.0.0.1:${sitePort}/llm/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'hi', context: [] }),
    });
    const data = await res.json();
    assert.equal(data.reply, 'hi');

    siteServer.close();
    await stopProxy();
    await new Promise((resolve) => llm.close(resolve));
});
