#!/usr/bin/env node

// Test script to understand OpenCode API
import http from 'http';

// Test different endpoints
const endpoints = [
  '/',
  '/api',
  '/api/v1',
  '/api/v1/sessions',
  '/sessions',
  '/v1/sessions',
  '/health',
  '/status',
  '/ping',
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4096,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          endpoint,
          status: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint,
        error: error.message,
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        endpoint,
        error: 'Timeout',
      });
    });

    req.end();
  });
}

async function main() {
  console.log('Testing OpenCode API endpoints...\n');

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    console.log(`=== ${endpoint} ===`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    } else {
      console.log(`Status: ${result.status}`);
      console.log(`Headers:`, result.headers);
      if (result.data) {
        console.log(`Data:`, result.data);
      }
    }
    console.log('');
  }
}

main().catch(console.error);
