import test from "ava";
import { setTimeout } from "node:timers/promises";
import { fastifyTransport } from "../core/transports/fastify.js";
import { createMcpServer } from "../core/mcp-server.js";

/**
 * Simple negative integration test for stdio proxy timing issues.
 * This test will FAIL if the timing bugs resurface.
 */

test("NEGATIVE: MCP server should initialize without timing errors", async (t) => {
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
    await setTimeout(3000); // Give servers time to initialize

    const baseUrl = `http://127.0.0.1:3210`;

    // Initialize MCP session
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
    const sessionId = sessionIdMatch?.[1] || "";

    // Test tools list - this is where timing errors would manifest
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

    // These are the specific error messages that indicate timing issues
    // The test will FAIL if any of these appear
    t.false(
      toolsText.includes("Invalid request parameters"),
      "Should not have 'Invalid request parameters' errors (indicates timing issue)"
    );
    t.false(
      toolsText.includes("before initialization was complete"),
      "Should not have 'before initialization was complete' errors"
    );
    t.false(
      toolsText.includes("Not connected"),
      "Should not have 'Not connected' errors"
    );
    t.false(
      toolsText.includes("Proxy returned invalid JSON response"),
      "Should not have JSON parsing errors"
    );

    // Should have valid response
    t.true(toolsText.includes("event: message"), "Should return SSE format");
    t.true(toolsText.includes('"tools"'), "Should contain tools array");

  } finally {
    if (transport?.stop) {
      await transport.stop();
    }
  }
});

test("NEGATIVE: Multiple tools list requests should not fail", async (t) => {
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
    await setTimeout(5000); // Extra time for slow servers

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
    const sessionId = sessionIdMatch?.[1] || "";

    // Make multiple tools list requests to test stability
    const requests = [];
    for (let i = 0; i < 3; i++) {
      requests.push(
        fetch(`${baseUrl}/mcp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "mcp-session-id": sessionId
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: `tools-${i}`,
            method: "tools/list"
          }),
        })
      );
    }

    const responses = await Promise.all(requests);

    // All requests should succeed
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      if (!response) {
        t.fail(`Response ${i} should be defined`);
        continue;
      }
      t.true(response.ok, `Tools list request ${i} should succeed`);

      const text = await response.text();

      // None should have timing errors
      t.false(
        text.includes("Invalid request parameters"),
        `Request ${i} should not have timing errors`
      );

      t.true(text.includes("event: message"), `Request ${i} should return SSE format`);
    }

  } finally {
    if (transport?.stop) {
      await transport.stop();
    }
  }
});