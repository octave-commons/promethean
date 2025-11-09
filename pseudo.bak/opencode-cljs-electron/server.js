#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  publicDir: 'public',
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };
  return contentTypes[ext] || 'text/plain';
}

function serveFile(res, filePath) {
  const fullPath = path.resolve(config.publicDir, filePath);

  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    const contentType = getContentType(fullPath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
    });

    const readStream = fs.createReadStream(fullPath);
    readStream.pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  console.log(`${req.method} ${pathname}`);

  if (pathname === '/') {
    serveFile(res, 'index.html');
  } else if (pathname.startsWith('/renderer') || pathname.startsWith('/')) {
    const filePath = pathname.startsWith('/') ? pathname.substring(1) : pathname;
    serveFile(res, filePath);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

const server = http.createServer(handleRequest);

server.listen(config.port, config.host, () => {
  console.log(`Opencode HTTP server running at http://${config.host}:${config.port}`);
  console.log('Press Ctrl+C to stop');
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
