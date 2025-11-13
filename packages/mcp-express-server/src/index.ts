import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';

const PORT = Number(process.env.MCP_EXPRESS_PORT ?? 4321);
const HOST = process.env.MCP_EXPRESS_HOST ?? '0.0.0.0';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

const uiBundleDir = path.resolve(process.cwd(), 'packages/mcp/static/dev-ui');
if (fs.existsSync(uiBundleDir)) {
  app.use('/ui/assets', express.static(uiBundleDir, { fallthrough: true }));
} else {
  console.warn('[mcp-express] dev UI assets not found at', uiBundleDir);
}

const renderFallbackPage = () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Promethean MCP (Express)</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; display:flex; align-items:center; justify-content:center; min-height:100vh; }
      .card { background: #1e293b; padding: 3rem; border-radius: 16px; max-width: 640px; box-shadow: 0 40px 70px rgba(15,23,42,0.45); }
      h1 { margin-top: 0; font-size: 2rem; }
      p { line-height: 1.6; }
      code { background: rgba(15, 23, 42, 0.6); padding: 0.2rem 0.4rem; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Express Dev Server Coming Online</h1>
      <p>
        The new MCP Express runtime is booting. Static bundles are exposed from
        <code>/ui/assets</code> and the OAuth surface is being rewritten to eliminate the
        Fastify dependency. This placeholder keeps the port alive while we finish wiring
        endpoints and OAuth callbacks.
      </p>
      <p>
        Keep this process running and watch <code>packages/mcp-express-server</code> for updates.
        You can customize the port via <code>MCP_EXPRESS_PORT</code>.
      </p>
    </div>
  </body>
</html>`;

app.get('/', (_req, res) => {
  res.status(200).send(renderFallbackPage());
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[mcp-express] listening on http://${HOST}:${PORT}`);
});

const shutdown = () => {
  console.log('[mcp-express] shutting down');
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
