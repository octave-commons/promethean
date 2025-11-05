// Simple hub server for development without external dependencies
import type { Repo, HubConfig } from "./types.js";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

export async function createHub(cfg: HubConfig, repos: Repo[]) {
  const server = createServer();
  const wss = new WebSocketServer({ port: cfg.hubPort + 1 });

  // Simple REST API endpoints
  server.on('request', async (req: any, res: any) => {
    const url = new URL(req.url || '/', `http://localhost:${cfg.hubPort}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (url.pathname === '/api/repos') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(repos));
      return;
    }

    if (url.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
      return;
    }

    // Serve static files from UI
    if (url.pathname.startsWith('/ui/')) {
      try {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const uiPath = path.join(process.cwd(), 'ui', 'resources', 'public', url.pathname.replace('/ui/', ''));
        
        if (fs.existsSync(uiPath)) {
          const content = fs.readFileSync(uiPath);
          const ext = path.extname(uiPath);
          const contentType = ext === '.html' ? 'text/html' : 
                           ext === '.js' ? 'application/javascript' : 
                           ext === '.css' ? 'text/css' : 'text/plain';
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
          return;
        }
      } catch (error) {
        console.error('Error serving static file:', error);
      }
    }

    // 404 fallback
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  // WebSocket echo server for chat
  wss.on('connection', (ws: any) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (data: any) => {
      console.log('Received:', data.toString());
      // Echo back for now
      ws.send(`Echo: ${data.toString()}`);
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return new Promise<void>((resolve) => {
    server.listen(cfg.hubPort, () => {
      console.log(`OpenCode Hub running on http://localhost:${cfg.hubPort}`);
      console.log(`WebSocket server on ws://localhost:${cfg.hubPort + 1}`);
      resolve();
    });
  });
}