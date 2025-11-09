#!/usr/bin/env node

// More comprehensive OpenCode API test
import http from 'http';

// Test different methods and endpoints
const tests = [
  { method: 'GET', endpoint: '/', body: null },
  { method: 'GET', endpoint: '/api', body: null },
  { method: 'GET', endpoint: '/v1', body: null },
  { method: 'GET', endpoint: '/sessions', body: null },
  { method: 'GET', endpoint: '/api/sessions', body: null },
  { method: 'GET', endpoint: '/v1/sessions', body: null },
  {
    method: 'POST',
    endpoint: '/sessions',
    body: JSON.stringify({ title: 'Test' }),
  },
  {
    method: 'POST',
    endpoint: '/api/sessions',
    body: JSON.stringify({ title: 'Test' }),
  },
  {
    method: 'POST',
    endpoint: '/v1/sessions',
    body: JSON.stringify({ title: 'Test' }),
  },
  { method: 'OPTIONS', endpoint: '/', body: null },
  { method: 'OPTIONS', endpoint: '/sessions', body: null },
];

async function testRequest(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4096,
      path: test.endpoint,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'OpenCode-Session-Manager-Test/1.0',
      },
    };

    if (test.body) {
      options.headers['Content-Length'] = Buffer.byteLength(test.body);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          method: test.method,
          endpoint: test.endpoint,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        method: test.method,
        endpoint: test.endpoint,
        error: error.message,
      });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({
        method: test.method,
        endpoint: test.endpoint,
        error: 'Timeout',
      });
    });

    if (test.body) {
      req.write(test.body);
    }
    req.end();
  });
}

async function main() {
  console.log('Comprehensive OpenCode API Test...\n');

  for (const test of tests) {
    const result = await testRequest(test);
    console.log(`=== ${result.method} ${result.endpoint} ===`);
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else {
      console.log(`✅ Status: ${result.status} ${result.statusText}`);
      if (result.headers['allow']) {
        console.log(`Allowed methods: ${result.headers['allow']}`);
      }
      if (result.headers['access-control-allow-methods']) {
        console.log(
          `CORS methods: ${result.headers['access-control-allow-methods']}`
        );
      }
      if (result.data && result.data.trim()) {
        console.log(
          `Response: ${result.data.substring(0, 200)}${result.data.length > 200 ? '...' : ''}`
        );
      }
    }
    console.log('');
  }
}

main().catch(console.error);
