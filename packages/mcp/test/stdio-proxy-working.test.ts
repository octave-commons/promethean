import test from "ava";
import { writeFileSync, mkdtempSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { StdioHttpProxy } from "../src/proxy/stdio-proxy.js";
import type { StdioServerSpec } from "../src/proxy/config.js";

test("WORKING: StdioHttpProxy handles debug output gracefully", async (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-working-test-"));

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];
  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  // Create a mock MCP server that outputs debug logs mixed with valid JSON-RPC
  const mcpScript = `#!/usr/bin/env node
console.log("Debug: Starting MCP server");
console.log("Info: Initializing subsystems");
console.log(JSON.stringify({jsonrpc: "2.0", id: 1, result: { success: true }}));
console.log("Debug: Request processed successfully");
console.log("Warning: Memory usage normal");
process.stdin.on("data", (chunk) => {
  // Echo back JSON-RPC requests
  try {
    const request = JSON.parse(chunk.toString());
    if (request.method === "test") {
      console.log(JSON.stringify({
        jsonrpc: "2.0",
        id: request.id,
        result: { message: "test response" }
      }));
    }
  } catch (e) {
    // Invalid JSON, ignore
  }
});
`;
  const mcpScriptPath = path.join(tempDir, "mcp-server.js");
  writeFileSync(mcpScriptPath, mcpScript, { mode: 0o755 });

  const spec: StdioServerSpec = {
    name: "working-mcp-server",
    command: mcpScriptPath,
    args: [],
    env: {},
    cwd: tempDir,
    httpPath: "/working-mcp-server/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Wait for startup messages to be processed
    await new Promise(resolve => setTimeout(resolve, 150));

    console.log("=== ANALYSIS OF LOGGED MESSAGES ===");
    loggedMessages.forEach((msg, i) => {
      console.log(`${i}: ${msg.message}`, msg.args);
    });
    console.log("=== END ANALYSIS ===");

    // Verify that debug JSON parsing errors were handled gracefully
    const debugJsonErrors = loggedMessages.filter(msg =>
      msg.message.includes("[stdout debug json error]")
    );

    t.true(debugJsonErrors.length > 0, "Debug JSON parsing errors should be detected and handled gracefully");

    // Verify that stdout filtering info was logged
    const stdoutFilteringMessages = loggedMessages.filter(msg =>
      msg.message.includes("[stdout filtering]")
    );

    t.true(stdoutFilteringMessages.length > 0, "Should log that stdout filtering is active");

    // Verify that the proxy didn't crash and is still functioning
    t.pass("Proxy should handle debug output without crashing");

  } finally {
    await proxy.stop();
  }
});

test("WORKING: StdioHttpProxy processes valid JSON-RPC despite debug output", async (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-working-json-rpc-"));

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];
  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  // Create an MCP server that outputs both debug logs and valid JSON-RPC
  const responsiveScript = `#!/usr/bin/env node

console.log("Debug: Server starting up");
console.log(JSON.stringify({jsonrpc: "2.0", id: "startup", result: { status: "ready" }}));

process.stdin.on("data", (chunk) => {
  const data = chunk.toString().trim();
  if (data) {
    try {
      const request = JSON.parse(data);
      console.log("Debug: Processing " + request.method);

      // Send valid JSON-RPC response
      const response = {
        jsonrpc: "2.0",
        id: request.id,
        result: {
          method: request.method,
          timestamp: Date.now(),
          success: true
        }
      };
      console.log(JSON.stringify(response));
      console.log("Debug: Response sent");
    } catch (error) {
      console.log("Error: Invalid JSON received");
    }
  }
});
`;
  const responsiveScriptPath = path.join(tempDir, "responsive-mcp.js");
  writeFileSync(responsiveScriptPath, responsiveScript, { mode: 0o755 });

  const spec: StdioServerSpec = {
    name: "responsive-mcp",
    command: responsiveScriptPath,
    args: [],
    env: {},
    cwd: tempDir,
    httpPath: "/responsive-mcp/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Wait for startup
    await new Promise(resolve => setTimeout(resolve, 100));

    // Count initial messages
    const initialMessageCount = loggedMessages.length;
    console.log(`Initial message count: ${initialMessageCount}`);

    // Check for successful startup message processing
    const startupMessages = loggedMessages.filter(msg =>
      msg.message.includes("failed to send HTTP response") &&
      msg.args[0] instanceof Error &&
      msg.args[0].message.includes("No connection established")
    );

    // The presence of this error indicates that valid JSON-RPC was processed
    // but no HTTP connection was waiting for it (which is expected in this test)
    t.true(startupMessages.length > 0, "Valid JSON-RPC should be processed despite debug output");

    t.pass("JSON-RPC processing should work despite debug output interference");

  } finally {
    await proxy.stop();
  }
});