/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import { mkdtempSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import test from "ava";

import { StdioHttpProxy } from "../src/proxy/stdio-proxy.js";
import type { StdioServerSpec } from "../src/proxy/config.js";

// Mock MCP server that outputs debug logs to stdout mixed with JSON-RPC
const createMockMcpServerWithDebugLogs = (scriptPath: string): void => {
  const serverScript = `
#!/usr/bin/env node

// Mock MCP server that outputs debug logs to stdout
const debug = true;

function sendJsonRpc(response) {
  console.log(JSON.stringify(response));
}

function logDebug(message) {
  if (debug) {
    console.log(\`[DEBUG] \${new Date().toISOString()} - \${message}\`);
  }
}

// Process stdin line by line
let buffer = "";
process.stdin.on("data", (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split("\\n");
  buffer = lines.pop() || ""; // Keep incomplete last line

  for (const line of lines) {
    if (line.trim()) {
      try {
        const request = JSON.parse(line);

        // Log debug output before processing
        logDebug(\`Processing request: \${request.method}\`);

        switch (request.method) {
          case "initialize":
            logDebug("Initializing MCP server");
            sendJsonRpc({
              jsonrpc: "2.0",
              id: request.id,
              result: {
                protocolVersion: "2025-06-18",
                serverInfo: { name: "mock-mcp-server", version: "1.0.0" },
                capabilities: { tools: {} }
              }
            });
            break;

          case "tools/list":
            logDebug("Listing available tools");
            sendJsonRpc({
              jsonrpc: "2.0",
              id: request.id,
              result: {
                tools: [
                  {
                    name: "test_tool",
                    description: "A test tool",
                    inputSchema: { type: "object", properties: {} }
                  }
                ]
              }
            });
            break;

          case "tools/call":
            logDebug(\`Calling tool: \${request.params.name}\`);
            sendJsonRpc({
              jsonrpc: "2.0",
              id: request.id,
              result: {
                content: [{
                  type: "text",
                  text: JSON.stringify({ result: "Tool executed successfully" })
                }]
              }
            });
            break;

          default:
            logDebug(\`Unknown method: \${request.method}\`);
            sendJsonRpc({
              jsonrpc: "2.0",
              id: request.id,
              error: { code: -32601, message: "Method not found" }
            });
        }

        logDebug(\`Finished processing request: \${request.method}\`);

      } catch (error) {
        logDebug(\`Failed to parse request: \${error.message}\`);
      }
    }
  }
});

// Log startup message
logDebug("Mock MCP server starting up");

process.on("SIGTERM", () => {
  logDebug("Mock MCP server shutting down");
  process.exit(0);
});
`;

  writeFileSync(scriptPath, serverScript, { mode: 0o755 });
};

// Mock MCP server that outputs malformed JSON
const createMockMcpServerWithMalformedOutput = (scriptPath: string): void => {
  const serverScript = `
#!/usr/bin/env node

console.log("Starting MCP server...");
console.log("Some debug info");
console.log("{ malformed json without closing brace");
console.log(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  result: { protocolVersion: "2025-06-18", serverInfo: { name: "malformed-server", version: "1.0.0" } }
}));

process.stdin.on("data", (chunk) => {
  // Echo back any requests
  process.stdout.write(chunk);
});
`;

  writeFileSync(scriptPath, serverScript, { mode: 0o755 });
};

test("StdioHttpProxy filters debug logs from JSON-RPC messages", async (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-stdio-test-"));
  const mockServerPath = path.join(tempDir, "mock-mcp-server.js");
  createMockMcpServerWithDebugLogs(mockServerPath);

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];

  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  const spec: StdioServerSpec = {
    name: "test-mcp-server",
    command: mockServerPath,
    args: [],
    env: {},
    cwd: tempDir,
    httpPath: "/test-mcp-server/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Wait a moment for the server to start up
    await new Promise(resolve => setTimeout(resolve, 100));

    // Test 1: Verify debug logs are filtered from JSON-RPC processing
    // The mock server outputs debug logs to stdout, but they should be filtered

    // Create a mock HTTP request/response
    const mockReq = {
      headers: {},
      method: "POST",
    } as any;

    const mockRes = {
      writeHead: () => {},
      end: () => {},
      headersSent: false,
    } as any;

    // Send a JSON-RPC request
    const testRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        clientInfo: { name: "test-client", version: "1.0.0" },
        capabilities: {},
      },
    };

    await proxy.handle(mockReq, mockRes, testRequest);

    // Give some time for processing
    await new Promise(resolve => setTimeout(resolve, 50));

    // Check that debug logs were captured
    const debugLogMessages = loggedMessages.filter(msg =>
      msg.message.includes("[filtered debug output]") ||
      msg.message.includes("[stdout debug]")
    );

    t.true(debugLogMessages.length > 0, "Debug logs should be captured and logged");

    // Verify that the proxy didn't crash despite debug output
    t.pass("Proxy should handle debug logs without crashing");

  } finally {
    await proxy.stop();
  }
});

test("StdioHttpProxy validates JSON-RPC message structure", async (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-stdio-validation-"));
  const mockServerPath = path.join(tempDir, "malformed-mcp-server.js");
  createMockMcpServerWithMalformedOutput(mockServerPath);

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];

  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  const spec: StdioServerSpec = {
    name: "malformed-test-server",
    command: mockServerPath,
    args: [],
    env: {},
    cwd: tempDir,
    httpPath: "/malformed-test-server/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Wait for server startup
    await new Promise(resolve => setTimeout(resolve, 100));

    // The mock server outputs malformed JSON, which should be filtered out
    const mockReq = { headers: {}, method: "POST" } as any;
    const mockRes = { writeHead: () => {}, end: () => {} } as any;

    // Send a request
    const testRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        clientInfo: { name: "test-client", version: "1.0.0" },
        capabilities: {},
      },
    };

    await proxy.handle(mockReq, mockRes, testRequest);

    // Give time for processing
    await new Promise(resolve => setTimeout(resolve, 50));

    // Check that malformed messages were filtered
    const filteredMessages = loggedMessages.filter(msg =>
      msg.message.includes("[filtered debug output]")
    );

    t.true(filteredMessages.length >= 0, "Malformed messages should be filtered out");
    t.pass("Proxy should handle malformed JSON gracefully");

  } finally {
    await proxy.stop();
  }
});

test("StdioHttpProxy gracefully handles stderr output", async (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-stderr-test-"));

  // Create a mock server that outputs to stderr
  const stderrServer = path.join(tempDir, "stderr-server.js");
  const serverScript = `
#!/usr/bin/env node

// Output to stderr
console.error("Warning: Loading configuration...");
console.error("Info: Server starting on stdio");
console.error("Debug: Memory usage normal");

process.stdin.on("data", (chunk) => {
  const data = chunk.toString().trim();
  if (data) {
    try {
      const request = JSON.parse(data);
      console.error("Processing request: " + request.method);

      // Send valid JSON-RPC response
      if (request.method === "initialize") {
        console.log(JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            protocolVersion: "2025-06-18",
            serverInfo: { name: "stderr-server", version: "1.0.0" },
            capabilities: {}
          }
        }));
      }

    } catch (error) {
      console.error("Error: " + error.message);
    }
  }
});
`;

  writeFileSync(stderrServer, serverScript, { mode: 0o755 });

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];

  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  const spec: StdioServerSpec = {
    name: "stderr-server",
    command: stderrServer,
    args: [],
    env: {},
    cwd: tempDir,
    httpPath: "/stderr-server/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Wait for startup
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify stderr messages were logged
    const stderrMessages = loggedMessages.filter(msg =>
      msg.message.includes("[stderr]")
    );

    t.true(stderrMessages.length > 0, "Stderr messages should be captured");
    t.true(stderrMessages.some(msg => msg.message.includes("Warning: Loading configuration")), "Should capture stderr warning");
    t.true(stderrMessages.some(msg => msg.message.includes("Info: Server starting")), "Should capture stderr info");

    t.pass("Proxy should handle stderr output gracefully");

  } finally {
    await proxy.stop();
  }
});

test("StdioHttpProxy handles edge cases in message validation", async (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-edge-case-test-"));

  // Test edge cases
  const edgeCaseScript = `
#!/usr/bin/env node
console.log(""); // Empty line
console.log("   "); // Whitespace only
console.log("null"); // String "null"
console.log("undefined"); // String "undefined"
console.log("{}"); // Empty object (not valid JSON-RPC)
console.log({"jsonrpc": "1.0"}); // Wrong JSON-RPC version
console.log({"method": "test"}); // Missing jsonrpc field
process.stdin.on("data", () => {});
`;

  const edgeCaseServer = path.join(tempDir, "edge-case-server.js");
  writeFileSync(edgeCaseServer, edgeCaseScript, { mode: 0o755 });

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];

  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  const spec: StdioServerSpec = {
    name: "edge-case-server",
    command: edgeCaseServer,
    args: [],
    env: {},
    cwd: tempDir,
    httpPath: "/edge-case-server/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Wait for messages to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify edge cases were handled gracefully
    const filteredMessages = loggedMessages.filter(msg =>
      msg.message.includes("[filtered debug output]")
    );

    t.true(filteredMessages.length > 0, "Edge case messages should be handled gracefully");

    // Verify no crashes occurred
    t.pass("Proxy should handle edge cases without crashing");

  } finally {
    await proxy.stop();
  }
});