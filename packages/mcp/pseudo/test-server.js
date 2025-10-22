#!/usr/bin/env node

// Simple test to check if MCP server is responsive
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3212,
  path: '/healthz',
  method: 'GET',
  timeout: 5000,
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
});

req.end();
