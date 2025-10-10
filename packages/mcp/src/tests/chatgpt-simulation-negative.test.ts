import test from "ava";
import { setTimeout } from "node:timers/promises";
import { fastifyTransport } from "../core/transports/fastify.js";
import { createMcpServer } from "../core/mcp-server.js";

/**
 * Simple end-to-end negative test that verifies the MCP server starts properly.
 * This test will FAIL if the server doesn't start or can't handle basic requests.
 */

test("NEGATIVE: Basic MCP server initialization and health check", async (t) => {
  const transport = fastifyTransport({ port: 0, host: '127.0.0.1' });

  // Create a simple mock tool for testing
  const mockTool = {
    spec: {
      name: "test_tool",
      description: "A simple test tool",
      inputSchema: {},
    },
    invoke: async () => ({ result: "ok" })
  };

  const mcpServer = createMcpServer([mockTool]);

  try {
    await transport.start(mcpServer);
    await setTimeout(2000); // Give servers time to initialize

    // Use the default port since port: 0 doesn't actually work with the current transport
    const baseUrl = `http://127.0.0.1:3210`;

    // Test basic MCP initialization
    const initResponse = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "init-1",
        method: "initialize",
        params: {
          protocolVersion: "2024-10-01",
          clientInfo: { name: "test-client", version: "1.0.0" }
        }
      }),
    });

    t.true(initResponse.ok, "MCP initialization should succeed");

    const initText = await initResponse.text();
    t.true(initText.includes("event: message"), "Should return SSE format");

    // Extract session ID
    const sessionIdMatch = initText.match(/mcp-session-id:\s*([a-f0-9-]+)/);
    t.truthy(sessionIdMatch, "Should extract session ID");
    const sessionId = sessionIdMatch![1];

    // Test tools list to verify stdio proxies are working
    const toolsResponse = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mcp-session-id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "tools-1",
        method: "tools/list"
      }),
    });

    t.true(toolsResponse.ok, "Tools list should succeed");

    const toolsText = await toolsResponse.text();

    // Should NOT contain these error messages that indicate timing issues
    t.false(
      toolsText.includes("Invalid request parameters"),
      "Should not have initialization timing errors"
    );
    t.false(
      toolsText.includes("before initialization was complete"),
      "Should not have 'before initialization was complete' errors"
    );
    t.false(
      toolsText.includes("Proxy returned invalid JSON response"),
      "Should not have JSON parsing errors"
    );

    // Should contain actual tools
    t.true(toolsText.includes('"tools"'), "Should contain tools array");
    t.true(toolsText.includes("event: message"), "Should return SSE format");

  } finally {
    if (transport?.stop) {
      await transport.stop();
    }
  }
});

test("NEGATIVE: Verify critical stdio servers are accessible", async (t) => {
  const transport = fastifyTransport({ port: 0, host: '127.0.0.1' });

  // Create a simple mock tool for testing
  const mockTool = {
    spec: {
      name: "test_tool",
      description: "A simple test tool",
      inputSchema: {},
    },
    invoke: async () => ({ result: "ok" })
  };

  const mcpServer = createMcpServer([mockTool]);

  const CRITICAL_SERVERS = [
    "ts-ls-lsp",
    "eslint",
    "github",
    "file-system"
  ];

  try {
    await transport.start(mcpServer);
    await setTimeout(5000); // Give extra time for slow servers to initialize

    const baseUrl = `http://127.0.0.1:3210`;

    // Initialize session
    const initResponse = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "init-1",
        method: "initialize",
        params: {
          protocolVersion: "2024-10-01",
          clientInfo: { name: "test-client", version: "1.0.0" }
        }
      }),
    });

    t.true(initResponse.ok, "Initialization should succeed");

    const initText = await initResponse.text();
    const sessionIdMatch = initText.match(/mcp-session-id:\s*([a-f0-9-]+)/);
    t.truthy(sessionIdMatch, "Should extract session ID");
    const sessionId = sessionIdMatch![1];

    // Test tools list
    const toolsResponse = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mcp-session-id": sessionId
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "tools-1",
        method: "tools/list"
      }),
    });

    t.true(toolsResponse.ok, "Tools list should succeed");

    const toolsText = await toolsResponse.text();

    // Check for critical stdio servers in the response
    // The stdio servers should appear as tools with names matching their server names
    const foundServers: string[] = [];

    for (const server of CRITICAL_SERVERS) {
      if (toolsText.includes(server)) {
        foundServers.push(server);
      }
    }

    // At least 2 critical servers should be accessible
    t.true(
      foundServers.length >= 2,
      `At least 2 critical stdio servers should be accessible. Found: ${foundServers.join(', ')}`
    );

    // Most importantly, should not have timing errors
    t.false(
      toolsText.includes("Invalid request parameters"),
      "Critical servers should not have timing errors"
    );

  } finally {
    if (transport?.stop) {
      await transport.stop();
    }
  }
});