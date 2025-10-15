const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.method, req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      status: 'ok',
      service: 'test-server',
      timestamp: new Date().toISOString(),
    }),
  );
});

server.listen(3010, '0.0.0.0', () => {
  console.log('Test server listening on port 3010');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Keep the process alive
console.log('Server process started, waiting for connections...');
