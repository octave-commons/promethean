import test from "ava";
import { writeFileSync, mkdtempSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { StdioHttpProxy } from "../src/proxy/stdio-proxy.js";
import type { StdioServerSpec } from "../src/proxy/config.js";

test("DEBUG: StdioHttpProxy stdout hooking verification", async (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-hook-debug-"));

  const loggedMessages: Array<{ level: string; message: string; args: unknown[] }> = [];
  const mockLogger = (msg: string, ...args: unknown[]) => {
    loggedMessages.push({ level: "info", message: msg, args });
    console.log(`[LOGGER] ${msg}`, ...args); // Also log to console for debugging
  };

  // Create a simple debug server
  const debugScript = `#!/usr/bin/env node
console.log("Debug: Starting up");
console.log(JSON.stringify({jsonrpc: "2.0", id: 1, result: {test: true}}));
console.log("Debug: Finished");
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
    console.log("[TEST] Starting proxy...");
    await proxy.start();

    // Wait for startup messages to be processed
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log("[TEST] Total logged messages:", loggedMessages.length);
    loggedMessages.forEach((msg, i) => {
      console.log(`[TEST] Message ${i}: ${msg.message}`, msg.args);
    });

    // Check if hooking was attempted
    const hookMessages = loggedMessages.filter(msg =>
      msg.message.includes("could not hook stdout") ||
      msg.message.includes("[filtered debug output]") ||
      msg.message.includes("[stdout debug]")
    );

    console.log("[TEST] Hook-related messages:", hookMessages.length);

    if (hookMessages.length === 0) {
      console.log("[TEST] Hooking may not be working - no hook-related messages found");
    }

    t.pass("Debug hooking test completed - check console output");

  } finally {
    await proxy.stop();
  }
});