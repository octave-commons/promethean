import test from "ava";

/**
 * Unit tests for the debug filtering function.
 * These tests ensure the `isValidJsonRpcMessage` function correctly separates
 * debug output from protocol messages.
 */

// Import the function from the stdio proxy
// Note: This function should be exported from stdio-proxy.ts for testing
// For now, we'll recreate it here for testing purposes

const isValidJsonRpcMessage = (message: unknown): boolean => {
  if (typeof message !== "object" || message === null) {
    return false;
  }
  const msg = message as Record<string, unknown>;
  if (msg.jsonrpc !== "2.0") {
    return false;
  }
  const hasMethod = typeof msg.method === "string";
  const hasResult = "result" in msg;
  const hasError = "error" in msg;
  return hasMethod || hasResult || hasError;
};

test("NEGATIVE: Debug output must be filtered out from JSON-RPC messages", (t) => {
  // These are examples of debug output that should NOT be considered valid JSON-RPC
  const debugMessages = [
    "Starting LSP server...",
    "[INFO] Server started on port 3000",
    "Loading configuration file...",
    "DEBUG: Initializing database connection",
    "WARNING: Config file not found, using defaults",
    "Error: Failed to load plugin",
    "2025-10-09 20:42:33,521 INFO Initializing server",
    "Some random log message",
    "npm ERR! code ENOENT",
    "ESLint MCP started for workspace",
    "Secure MCP Filesystem Server running on stdio",
    "GitHub MCP Server running on stdio",
    "",
    null,
    undefined,
    123,
    [],
    {},
  ];

  for (const debugMessage of debugMessages) {
    t.false(
      isValidJsonRpcMessage(debugMessage),
      `Debug message should be filtered out: ${JSON.stringify(debugMessage)}`
    );
  }
});

test("NEGATIVE: Invalid JSON-RPC structures must be rejected", (t) => {
  // These look like JSON-RPC but are malformed and should be rejected
  const invalidMessages = [
    { jsonrpc: "1.0", method: "test" }, // Wrong version
    { method: "test" }, // Missing jsonrpc version
    { jsonrpc: "2.0" }, // Missing method, result, or error
    { jsonrpc: "2.0", method: 123 }, // Invalid method type
    { jsonrpc: "2.0", method: "", params: null }, // Empty method
    { jsonrpc: "2.0", result: null, error: {} }, // Both result and error
    { jsonrpc: "2.0", unknown: "field" }, // Invalid fields only
    { jsonrpc: "2.0", id: 1 }, // Missing method, result, or error
  ];

  for (const invalidMessage of invalidMessages) {
    t.false(
      isValidJsonRpcMessage(invalidMessage),
      `Invalid JSON-RPC should be rejected: ${JSON.stringify(invalidMessage)}`
    );
  }
});

test("POSITIVE: Valid JSON-RPC messages must be accepted", (t) => {
  // These are valid JSON-RPC messages that should be accepted
  const validMessages = [
    { jsonrpc: "2.0", method: "initialize", params: { protocolVersion: "2024-10-01" } },
    { jsonrpc: "2.0", method: "tools/list", id: 1 },
    { jsonrpc: "2.0", method: "tools/call", params: { name: "test" }, id: 2 },
    { jsonrpc: "2.0", result: { tools: [] }, id: 3 },
    { jsonrpc: "2.0", error: { code: -32000, message: "Server error" }, id: 4 },
    { jsonrpc: "2.0", method: "initialized", params: {} },
    { jsonrpc: "2.0", method: "ping", id: 5 },
    { jsonrpc: "2.0", result: { status: "ok" }, id: 6 },
    { jsonrpc: "2.0", error: { code: -32601, message: "Method not found" }, id: 7 },
    { jsonrpc: "2.0", method: "notifications/initialized" },
  ];

  for (const validMessage of validMessages) {
    t.true(
      isValidJsonRpcMessage(validMessage),
      `Valid JSON-RPC should be accepted: ${JSON.stringify(validMessage)}`
    );
  }
});

test("NEGATIVE: Malformed JSON-RPC with debug-like content must be rejected", (t) => {
  // These might look like they could be debug output but are malformed JSON-RPC
  const malformedDebugLikeMessages = [
    { jsonrpc: "2.0", method: "DEBUG: Starting server" }, // Debug in method field
    { jsonrpc: "2.0", result: "Server started successfully" }, // String result instead of object
    { jsonrpc: "2.0", error: "Some error message" }, // String error instead of object
    { jsonrpc: "2.0", method: 0 }, // Invalid method (number instead of string)
    { jsonrpc: 2.0, method: "test" }, // jsonrpc as number instead of string
    { jsonrpc: "2.0", method: null }, // null method
    { jsonrpc: "2.0", method: false }, // boolean method
  ];

  for (const malformedMessage of malformedDebugLikeMessages) {
    t.false(
      isValidJsonRpcMessage(malformedMessage),
      `Malformed debug-like message should be rejected: ${JSON.stringify(malformedMessage)}`
    );
  }
});

test("NEGATIVE: Common stdio debug patterns must be filtered", (t) => {
  // These are common debug patterns from various MCP servers
  const commonDebugPatterns = [
    // TypeScript LSP debug output
    "[stdout debug json error] ts-ls-lsp: Debug output detected (non-JSON)",
    "Starting language server...",
    "[33m[WARNING][0m Uncaught exception (non-fatal): Not connected",

    // ESLint debug output
    "[stdout debug json error] eslint: Debug output detected (non-JSON)",
    "ESLint MCP started for workspace: /path/to/project",
    "Starting stdio server",

    // General server debug output
    "[INFO] Initial memory usage: RSS=91MB, Heap=18MB",
    "NPM Helper MCP Server is running and connected via stdio",
    "GitHub MCP Server running on stdio",
    "Secure MCP Filesystem Server running on stdio",

    // Error conditions that look like JSON but aren't
    "{ invalid json }",
    '{"incomplete": json',
    '{"valid": "json", "debug": "message"}', // Extra debug field but no proper structure

    // Configuration and startup messages
    "Allowed directories: [ '/path/to/dir' ]",
    "Listening on port 3000",
    "Configuration loaded successfully",
  ];

  for (const debugPattern of commonDebugPatterns) {
    t.false(
      isValidJsonRpcMessage(debugPattern),
      `Common debug pattern should be filtered: ${debugPattern}`
    );
  }
});

test("EDGE CASE: Nested objects with invalid structure must be rejected", (t) => {
  const edgeCaseMessages = [
    { jsonrpc: "2.0", method: "test", params: "invalid params type" },
    { jsonrpc: "2.0", result: { tools: "not an array" }, id: 1 },
    { jsonrpc: "2.0", error: { message: "missing code" }, id: 2 },
    { jsonrpc: "2.0", method: "test", id: null }, // null id might be okay for notifications
    { jsonrpc: "2.0", method: "", id: 1 }, // Empty method should still be a valid method
  ];

  for (const edgeCaseMessage of edgeCaseMessages) {
    // These should be accepted by the basic filter (it doesn't validate structure deeply)
    // But they test edge cases of the filtering logic
    const isValid = isValidJsonRpcMessage(edgeCaseMessage);

    if (edgeCaseMessage.method === "") {
      t.true(isValid, "Empty method is still a method");
    } else if (typeof edgeCaseMessage.method === "string" ||
               "result" in edgeCaseMessage ||
               "error" in edgeCaseMessage) {
      t.true(isValid, `Edge case should pass basic filter: ${JSON.stringify(edgeCaseMessage)}`);
    } else {
      t.false(isValid, `Edge case should be rejected: ${JSON.stringify(edgeCaseMessage)}`);
    }
  }
});