#!/usr/bin/env node

// Test script to verify Playwright MCP server functionality
import http from 'http';

const makeRequest = (method, params, id) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      id: id,
      method: method,
      params: params,
    });

    const options = {
      hostname: 'localhost',
      port: 8931,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`Response for ${method}:`, responseData);
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      console.error(`Error for ${method}:`, error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

async function testPlaywrightMCP() {
  try {
    console.log('Testing Playwright MCP server...');

    // Initialize
    console.log('1. Initializing...');
    await makeRequest(
      'initialize',
      {
        protocolVersion: '2024-10-01',
        capabilities: {},
        clientInfo: { name: 'test', version: '1.0.0' },
      },
      1,
    );

    // List tools
    console.log('2. Listing tools...');
    await makeRequest('tools/list', {}, 2);

    // Try to create a browser session
    console.log('3. Creating browser session...');
    await makeRequest('browser/create', {}, 3);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPlaywrightMCP();
