#!/usr/bin/env node

// Quick test to verify /serena/mcp GET request works
console.log('🧪 Testing /serena/mcp GET request...\n');

const testGetRequest = async () => {
  try {
    const response = await fetch('http://localhost:3210/serena/mcp');

    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`CORS: ${response.headers.get('access-control-allow-origin')}`);

    if (response.ok) {
      const data = await response.json();
      console.log('\nResponse body:', JSON.stringify(data, null, 2));

      if (data.name === 'serena' && data.status === 'ready') {
        console.log('\n✅ GET request to /serena/mcp works!');
        console.log('✅ Proxy endpoint is accessible for health checks');
      } else {
        console.log('\n❌ Unexpected response format');
      }
    } else {
      console.log(`\n❌ Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.log(`\n❌ Request failed: ${error.message}`);
    console.log('Make sure the MCP server is running on localhost:3210');
  }
};

testGetRequest();