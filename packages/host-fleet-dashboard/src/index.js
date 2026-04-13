import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { collectAllHosts, collectSelfSnapshot } from './collector.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const uiDir = path.resolve(__dirname, '..', 'ui');

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(body);
}

function sendText(res, status, mime, text) {
  res.writeHead(status, {
    'content-type': mime,
    'cache-control': mime.startsWith('text/html') ? 'no-store' : 'public, max-age=60',
  });
  res.end(text);
}

function readUiFile(fileName) {
  return fs.readFileSync(path.join(uiDir, fileName), 'utf8');
}

function extractBearerToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    return '';
  }
  return auth.slice(7).trim();
}

function isAuthorized(req) {
  if (!config.authToken) {
    return config.allowUnauthenticated;
  }
  return extractBearerToken(req) === config.authToken;
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`);
    const pathname = requestUrl.pathname;
    const method = (req.method ?? 'GET').toUpperCase();

    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-methods': 'GET,OPTIONS',
        'access-control-allow-headers': 'content-type, authorization',
      });
      res.end();
      return;
    }

    if (method === 'GET' && pathname === '/') {
      sendText(res, 200, 'text/html; charset=utf-8', readUiFile('index.html'));
      return;
    }

    if (method === 'GET' && pathname === '/app.js') {
      sendText(res, 200, 'text/javascript; charset=utf-8', readUiFile('app.js'));
      return;
    }

    if (method === 'GET' && pathname === '/styles.css') {
      sendText(res, 200, 'text/css; charset=utf-8', readUiFile('styles.css'));
      return;
    }

    if (method === 'GET' && pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        service: 'host-fleet-dashboard',
        hostCount: config.targets.length,
        authenticated: Boolean(config.authToken) && !config.allowUnauthenticated,
      });
      return;
    }

    if (pathname.startsWith('/api/') && !isAuthorized(req)) {
      sendJson(res, 401, { error: 'unauthorized' });
      return;
    }

    if (method === 'GET' && pathname === '/api/config') {
      sendJson(res, 200, {
        host: config.host,
        port: config.port,
        selfTargetId: config.selfTargetId ?? null,
        targets: config.targets,
        authConfigured: Boolean(config.authToken),
        allowUnauthenticated: config.allowUnauthenticated,
      });
      return;
    }

    if (method === 'GET' && pathname === '/api/self') {
      const host = await collectSelfSnapshot(config);
      sendJson(res, 200, host);
      return;
    }

    if (method === 'GET' && pathname === '/api/hosts') {
      const hosts = await collectAllHosts(config);
      sendJson(res, 200, {
        generatedAt: new Date().toISOString(),
        hosts,
      });
      return;
    }

    sendJson(res, 404, { error: 'not_found' });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`host-fleet-dashboard listening on http://${config.host}:${config.port}`);
});
