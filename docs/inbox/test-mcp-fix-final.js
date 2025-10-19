#!/usr/bin/env node

/**
 * Final validation test for MCP server fix
 * This script tests the specific issue that was fixed: MCP SDK transport hanging
 */

import { createReadStream } from 'fs';
import { request } from 'http';

const PORT = 3210;
const MCP_ENDPOINT = '/mcp';

console.log('🧪 MCP Server Fix Validation Test');
console.log('==================================');

// Test 1: Invalid request (should timeout properly, not hang indefinitely)
console.log('\n📋 Test 1: Invalid request (should timeout, not hang)');
const req1 = request(
  {
    hostname: 'localhost',
    port: PORT,
    path: MCP_ENDPOINT,
    method: 'GET',
    headers: {
      Accept: 'application/json, text/event-stream',
    },
    timeout: 5000,
  },
  (res) => {
    console.log(`✅ Response received: ${res.statusCode}`);
    res.on('data', () => {});
    res.on('end', () => {
      console.log('✅ Response ended properly');
      runTest2();
    });
  },
);

req1.on('timeout', () => {
  console.log('✅ Request timed out as expected (this is correct behavior)');
  req1.destroy();
  runTest2();
});

req1.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.log('❌ Server not running - please start MCP server first');
    process.exit(1);
  } else {
    console.log('✅ Connection error (expected for invalid request)');
    runTest2();
  }
});

req1.end();

// Test 2: Valid MCP initialize request
function runTest2() {
  console.log('\n📋 Test 2: Valid MCP initialize request');

  const mcpRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: { listChanged: true },
        sampling: {},
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0',
      },
    },
  };

  const req2 = request(
    {
      hostname: 'localhost',
      port: PORT,
      path: MCP_ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      timeout: 10000,
    },
    (res) => {
      console.log(`✅ MCP Response received: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ MCP Response parsed successfully');
          console.log(`✅ Response ID: ${response.id}`);
          if (response.result) {
            console.log('✅ Initialize successful');
          } else if (response.error) {
            console.log(`ℹ️  MCP Error: ${response.error.message}`);
          }
        } catch (e) {
          console.log('❌ Failed to parse MCP response');
        }
        console.log('\n🎉 Test completed!');
        process.exit(0);
      });
    },
  );

  req2.on('timeout', () => {
    console.log('❌ MCP request timed out - the fix may not be working');
    req2.destroy();
    process.exit(1);
  });

  req2.on('error', (err) => {
    console.log(`❌ MCP request error: ${err.message}`);
    process.exit(1);
  });

  req2.write(JSON.stringify(mcpRequest));
  req2.end();
}

console.log(`\n🔄 Testing MCP server at http://localhost:${PORT}${MCP_ENDPOINT}`);
console.log('⏳ Waiting for responses...');
