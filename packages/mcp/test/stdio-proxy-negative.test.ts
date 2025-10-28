import test from "ava";
import { writeFileSync, mkdtempSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { StdioHttpProxy } from "../src/proxy/stdio-proxy.js";
import type { StdioServerSpec } from "../src/proxy/config.js";

test("NEGATIVE: StdioHttpProxy handle method requires proper response object", async (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-negative-test-"));

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];
  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  // Create a simple echo server script file
  const echoScript = `#!/usr/bin/env node
process.stdin.on("data", (chunk) => {
  process.stdout.write(chunk);
});
`;
  const echoScriptPath = path.join(tempDir, "echo-server.js");
  writeFileSync(echoScriptPath, echoScript, { mode: 0o755 });

  const spec: StdioServerSpec = {
    name: "echo-server",
    command: echoScriptPath,
    args: [],
    env: {},
    cwd: tempDir,
    httpPath: "/echo-server/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Test 1: Missing response object should throw
    const mockReq = { headers: {}, method: "POST" } as any;
    const undefinedRes = undefined as any;

    await t.throwsAsync(async () => {
      await proxy.handle(mockReq, undefinedRes, { test: "data" });
    }, {
      instanceOf: TypeError,
      message: /Cannot read propert(?:y|ies) of undefined/
    });

    // Test 2: Response object missing 'end' method should throw
    const incompleteRes = { writeHead: () => {} } as any; // Missing 'end' method

    await t.throwsAsync(async () => {
      await proxy.handle(mockReq, incompleteRes, { test: "data" });
    }, {
      instanceOf: TypeError,
      message: /end/
    });

    t.pass("Successfully replicated the error with incomplete response object");

  } finally {
    await proxy.stop();
  }
});

test("NEGATIVE: Debug message filtering verification", async (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-debug-test-"));

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];
  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
  };

  // Create a server that outputs debug messages to stdout
  const debugScript = `#!/usr/bin/env node
console.log("Debug: Starting up");
console.log("Info: Ready to process");
console.log("{invalid json");
console.log(JSON.stringify({jsonrpc: "2.0", id: 1, result: {test: true}}));
console.log("Another debug message");
process.stdin.on("data", () => {});
`;
  const debugScriptPath = path.join(tempDir, "debug-server.js");
  writeFileSync(debugScriptPath, debugScript, { mode: 0o755 });

  const spec: StdioServerSpec = {
    name: "debug-server",
    command: debugScriptPath,
    args: [],
    env: {},
    cwd: tempDir,
    httpPath: "/debug-server/mcp",
  };

  const proxy = new StdioHttpProxy(spec, mockLogger);

  try {
    await proxy.start();

    // Wait for startup messages to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that debug-like messages were captured as filtered debug output
    const debugLikeMessages = loggedMessages.filter(msg =>
      msg.message.includes("[filtered debug output]") ||
      msg.message.includes("[stdout debug]")
    );

    console.log("Debug-like messages found:", debugLikeMessages.length);
    console.log("All logged messages:", loggedMessages.map(m => ({ message: m.message, args: m.args })));

    // Now this should be true if filtering is working
    t.true(debugLikeMessages.length > 0, "Debug messages should be filtered and captured");

  } finally {
    await proxy.stop();
  }
});