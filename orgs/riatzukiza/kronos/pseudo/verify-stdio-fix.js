#!/usr/bin/env node

/**
 * Simple verification script to test stdio proxy initialization
 * This script tests that the stdio proxies are properly initialized with MCP protocol
 */

import { setTimeout } from "node:timers/promises";

async function testEndpoint(name, url) {
  console.log(`\n🧪 Testing ${name} endpoint...`);

  try {
    // Test initialization
    const initResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `init-${Date.now()}`,
        method: "initialize",
        params: {
          protocolVersion: "2024-10-01",
          clientInfo: { name: "test-client", version: "1.0.0" }
        }
      }),
    });

    if (!initResponse.ok) {
      throw new Error(`Init failed: ${initResponse.status} ${initResponse.statusText}`);
    }

    const initText = await initResponse.text();
    console.log(`✅ Initialization successful`);

    // Extract session ID
    const sessionIdMatch = initText.match(/mcp-session-id:\s*([a-f0-9-]+)/);
    if (!sessionIdMatch) {
      throw new Error("No session ID found in response");
    }

    const sessionId = sessionIdMatch[1];
    console.log(`✅ Session ID extracted: ${sessionId.substring(0, 8)}...`);

    // Test tools list
    const toolsResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mcp-session-id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `tools-${Date.now()}`,
        method: "tools/list"
      }),
    });

    if (!toolsResponse.ok) {
      throw new Error(`Tools list failed: ${toolsResponse.status} ${toolsResponse.statusText}`);
    }

    const toolsText = await toolsResponse.text();

    // Check for timing errors
    const timingErrors = [
      "Invalid request parameters",
      "before initialization was complete",
      "Not connected",
      "Proxy returned invalid JSON response"
    ];

    const hasTimingErrors = timingErrors.some(error => toolsText.includes(error));

    if (hasTimingErrors) {
      console.log(`❌ Timing errors detected in ${name}:`);
      timingErrors.forEach(error => {
        if (toolsText.includes(error)) {
          console.log(`   - Found: "${error}"`);
        }
      });
      return false;
    }

    // Check for valid response
    const hasValidResponse = toolsText.includes("event: message") && toolsText.includes('"tools"');

    if (hasValidResponse) {
      console.log(`✅ ${name} endpoint working correctly`);
      return true;
    } else {
      console.log(`❌ ${name} endpoint returned invalid response format`);
      console.log(`Response preview: ${toolsText.substring(0, 200)}...`);
      return false;
    }

  } catch (error) {
    console.log(`❌ ${name} endpoint failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🔍 Testing stdio proxy initialization fix...");
  console.log("This test verifies that stdio proxies are properly initialized with MCP protocol");

  const endpoints = [
    ["Main MCP", "http://localhost:3210/mcp"],
    ["Serena", "http://localhost:3210/serena/mcp"],
    ["TypeScript LSP", "http://localhost:3210/ts-ls-lsp/mcp"],
    ["ESLint", "http://localhost:3210/eslint/mcp"],
    ["File System", "http://localhost:3210/file-system/mcp"]
  ];

  let successCount = 0;

  for (const [name, url] of endpoints) {
    const success = await testEndpoint(name, url);
    if (success) successCount++;
    await setTimeout(500); // Brief pause between tests
  }

  console.log(`\n📊 Results: ${successCount}/${endpoints.length} endpoints working correctly`);

  if (successCount === endpoints.length) {
    console.log("🎉 All stdio proxies are working correctly! ChatGPT timeout issues should be resolved.");
  } else if (successCount > 0) {
    console.log("⚠️  Some stdio proxies are working. Partial improvement detected.");
  } else {
    console.log("💥 No stdio proxies are working. Further investigation needed.");
  }
}

main().catch(console.error);