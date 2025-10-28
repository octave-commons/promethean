import test from "ava";

// Import the validation function - we need to test it independently
// Since it's a private function, we'll test it through the class behavior
import { StdioHttpProxy } from "../src/proxy/stdio-proxy.js";
import type { StdioServerSpec } from "../src/proxy/config.js";

test("StdioHttpProxy validates proper JSON-RPC messages", async (t) => {
  const tempDir = "/tmp"; // Use temp dir for test

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];

  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  // Create a simple echo script that will output our test messages
  const echoScript = `
#!/usr/bin/env node
process.stdin.on("data", (chunk) => {
  process.stdout.write(chunk);
});
`;

  const spec: StdioServerSpec = {
    name: "echo-server",
    command: "node",
    args: ["-e", echoScript],
    env: {},
    cwd: tempDir,
    httpPath: "/echo-server/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Test valid JSON-RPC messages
    const validMessages = [
      {
        jsonrpc: "2.0",
        id: 1,
        method: "test",
        params: {}
      },
      {
        jsonrpc: "2.0",
        id: 2,
        result: { success: true }
      },
      {
        jsonrpc: "2.0",
        id: 3,
        error: { code: -1, message: "test error" }
      }
    ];

    for (const message of validMessages) {
      // Since we can't directly test the validation function,
      // we'll verify that proper JSON-RPC messages aren't filtered
      const mockReq = { headers: {}, method: "POST" } as any;
      const mockRes = {
        writeHead: () => {},
        end: () => {},
        headersSent: false,
      } as any;

      // This would normally process the message through the validation
      await proxy.handle(mockReq, mockRes, message);

      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Check that valid messages were not filtered as debug output
    const filteredDebugMessages = loggedMessages.filter(msg =>
      msg.message.includes("[filtered debug output]") &&
      JSON.stringify(msg.args).includes("jsonrpc")
    );

    t.is(filteredDebugMessages.length, 0, "Valid JSON-RPC messages should not be filtered as debug output");

  } finally {
    await proxy.stop();
  }
});

test("StdioHttpProxy filtering logic handles various message types", async (t) => {
  const tempDir = "/tmp";

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];

  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  // Create a script that outputs various message types
  const testScript = `
#!/usr/bin/env node
console.log("Debug: Starting up");
console.log("Info: Ready to process");
console.log("{invalid json");
console.log(JSON.stringify({jsonrpc: "2.0", id: 1, result: {test: true}}));
console.log("Another debug message");
process.stdin.on("data", () => {});
`;

  const spec: StdioServerSpec = {
    name: "test-server",
    command: "node",
    args: ["-e", testScript],
    env: {},
    cwd: tempDir,
    httpPath: "/test-server/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Wait for startup messages to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that various types of messages were handled appropriately
    const debugMessages = loggedMessages.filter(msg =>
      msg.message.includes("[filtered debug output]") ||
      msg.message.includes("[stdout debug]")
    );

    t.true(debugMessages.length > 0, "Various debug and malformed messages should be captured");

    // Verify that debug-like messages were filtered
    const debugLikeMessages = loggedMessages.filter(msg =>
      msg.message.includes("[filtered debug output]") &&
      (msg.args.toString().includes("Debug:") ||
       msg.args.toString().includes("Info:") ||
       msg.args.toString().includes("invalid json"))
    );

    t.true(debugLikeMessages.length > 0, "Debug-like messages should be filtered out");

  } finally {
    await proxy.stop();
  }
});

test("StdioHttpProxy handles edge cases in message validation", async (t) => {
  const tempDir = "/tmp";

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];

  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

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

  const spec: StdioServerSpec = {
    name: "edge-case-server",
    command: "node",
    args: ["-e", edgeCaseScript],
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