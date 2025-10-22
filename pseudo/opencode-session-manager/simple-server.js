// Simple mock OpenCode server
import http from 'http';

const server = http.createServer((_req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify({ message: 'Mock OpenCode Server is running!' }));
});

const PORT = 4096;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
