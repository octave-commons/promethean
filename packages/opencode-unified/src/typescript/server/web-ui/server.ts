import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;

const mimeTypes: { [key: string]: string } = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
};

const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Handle root path
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const indexPath = join(__dirname, '../../../../public/index.html');
      const content = readFileSync(indexPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
      return;
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
  }

  // Handle renderer/main.js
  if (req.url === '/renderer/main.js') {
    try {
      const jsPath = join(__dirname, '../../../../public/js/main.js');
      const content = readFileSync(jsPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(content);
      return;
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
  }

  // Serve static files from public directory
  try {
    const publicDir = join(__dirname, '../../../../public');
    let filePath = join(publicDir, req.url || '');

    // Security check - prevent directory traversal
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    const ext = filePath.split('.').pop()?.toLowerCase();
    const contentType = mimeTypes[`.${ext}`] || 'application/octet-stream';

    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Opencode Web UI server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${join(__dirname, '../../../../public')}`);
  console.log('Press Ctrl+C to stop the server');
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
