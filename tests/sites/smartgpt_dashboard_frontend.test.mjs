import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { startSitesServer } from '../../scripts/serve-sites.js';

process.env.NODE_ENV = 'test';
const { start: startProxy, stop: stopProxy } = await import('../../services/js/proxy/index.js');

async function startMockBridge() {
    const server = http.createServer((req, res) => {
        if (req.url === '/auth/me') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ auth: true }));
            return;
        }
        res.statusCode = 404;
        res.end();
    });
    await new Promise((resolve) => server.listen(0, resolve));
    return server;
}

test('SmartGPT dashboard served and proxied via proxy service', async () => {
    const bridge = await startMockBridge();
    const bridgePort = bridge.address().port;
    const proxy = await startProxy(0, { '/bridge': `http://127.0.0.1:${bridgePort}` });
    await new Promise((resolve) => proxy.on('listening', resolve));
    const proxyPort = proxy.address().port;
    const siteServer = await startSitesServer(0, `http://127.0.0.1:${proxyPort}`);
    const sitePort = siteServer.address().port;

    const page = await fetch(`http://127.0.0.1:${sitePort}/smartgpt-dashboard/`);
    const text = await page.text();
    assert.ok(text.includes('SmartGPT Bridge'));

    const res = await fetch(`http://127.0.0.1:${sitePort}/bridge/auth/me`);
    const data = await res.json();
    assert.equal(data.auth, true);

    siteServer.close();
    await stopProxy();
    await new Promise((resolve) => bridge.close(resolve));
});
