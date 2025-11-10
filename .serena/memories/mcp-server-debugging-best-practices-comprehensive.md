# MCP Server Debugging Best Practices - Comprehensive Guide

## Executive Summary
Based on thorough research of MCP documentation, community guides, GitHub implementations, and real-world code analysis, this guide provides comprehensive debugging best practices for MCP (Model Context Protocol) servers.

## Critical Debugging Rule
**THE GOLDEN RULE**: MCP servers must ONLY write JSON-RPC protocol messages to stdout. ALL debug output, logs, and console messages MUST go to stderr. Violating this rule breaks the MCP protocol communication.

## Core Debugging Patterns Identified

### 1. Structured Error Handling (from promethean MCP server)
```typescript
// Pattern: Centralized error handling with proper MCP error types
private setupErrorHandling(): void {
  this.server.onerror = (error) => console.error('[MCP Error]', error);
  process.on('SIGINT', async () => {
    await this.server.close();
    process.exit(0);
  });
}

// Pattern: Consistent error wrapping in tool handlers
try {
  // Tool execution logic
} catch (error: any) {
  if (error instanceof McpError) {
    throw error;
  }
  console.error(`Error in ${name}:`, error);
  throw new McpError(
    ErrorCode.InternalError,
    `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
  );
}
```

### 2. Input Validation & Debugging (from kanban bridge server)
```typescript
// Pattern: Schema-based validation with clear error messages
const CreateTaskSchema = z.object({
  title: z.string().min(1).describe('Task title'),
  content: z.string().optional().describe('Task description/content'),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional().describe('Task priority'),
});

// Pattern: Parse with automatic error handling
const parsed = CreateTaskSchema.parse(args);
```

### 3. Plugin-based Debugging (from clojure-delimiter-checker)
```typescript
// Pattern: Hook-based debugging with contextual logging
export const ClojureDelimiterChecker: Plugin = async ({ client, project, directory, worktree, $ }) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "write" && output.args.filePath) {
        const filePath = output.args.filePath as string
        if (isClojureFile(filePath)) {
          const result = checkAndFixDelimiters(content)
          if (result.changed) {
            console.log(`✅ Auto-corrected delimiters in '${filePath}'`)
          }
        }
      }
    },
  }
}
```

## Essential Debugging Tools & Techniques

### 1. MCP Inspector
- Interactive testing tool for MCP servers
- Allows real-time tool invocation and response inspection
- Critical for debugging JSON-RPC communication
- Usage: `mcp-inspector <server-command>`

### 2. Structured Logging Approach
```typescript
// Good: Structured logging to stderr
console.error('[DEBUG]', { tool: name, args, error: error.message });

// Bad: Direct console.log to stdout (breaks MCP protocol)
console.log('Debug info'); // NEVER DO THIS
```

### 3. Development Mode Debugging
```typescript
// Pattern: Conditional debug output
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.error('[DEBUG]', `Processing tool: ${name}`);
}
```

## Common Error Categories & Solutions

### 1. Connection Issues
**Symptoms**: Server not responding, connection timeouts
**Debugging Steps**:
- Check stdio transport configuration
- Verify JSON-RPC message format
- Use MCP Inspector for connection testing
- Monitor stderr for startup errors

### 2. JSON-RPC Format Problems
**Symptoms**: Protocol errors, malformed messages
**Debugging Steps**:
- Validate JSON structure
- Check message ID consistency
- Ensure proper error response format
- Use structured logging for message tracing

### 3. Tool Execution Failures
**Symptoms**: Tools returning errors, unexpected results
**Debugging Steps**:
- Validate input schemas with Zod
- Check tool registration
- Verify async/await usage
- Log tool entry/exit points

### 4. Protocol Version Mismatches
**Symptoms**: Incompatible responses, deprecated features
**Debugging Steps**:
- Verify MCP SDK version compatibility
- Check protocol version in server initialization
- Update to latest SDK specifications

## Real-World Debugging Examples

### Example 1: Tool Registration Debugging
```typescript
// From promethean MCP server - Debug tool registration
console.log('[mcp:server] sdk.mcp path:', reqr.resolve('@modelcontextprotocol/sdk/server/mcp.js'));

// Pattern: Validate tool definitions before registration
for (const t of tools) {
  if (!t.spec.name || !t.spec.description) {
    console.error('[ERROR] Invalid tool specification:', t);
    continue;
  }
  // Register tool with proper error handling
}
```

### Example 2: Response Format Debugging
```typescript
// Pattern: Ensure proper MCP response format
const hasStructuredOutput = Boolean(t.spec.outputSchema);

if (hasStructuredOutput) {
  const text = toText(result);
  const content = text.length > 0 ? [{ type: 'text', text }] : [];
  const structuredContent = result ?? null;
  return {
    content,
    structuredContent,
  } as CallToolResult;
}
```

### Example 3: Plugin Debugging Integration
```typescript
// Pattern: Plugin-based debugging with hooks
if (result.errors.length > 0 && !result.changed) {
  throw new Error(`Delimiter check failed in '${filePath}': ${result.errors.map(e => e.message).join("; ")}`)
}

if (result.changed) {
  console.log(`✅ Auto-corrected delimiters in '${filePath}'`)
}
```

## Advanced Debugging Strategies

### 1. Request/Response Tracing
```typescript
// Pattern: Full request/response logging for development
if (process.env.DEBUG_MCP) {
  console.error('[REQUEST]', JSON.stringify(request, null, 2));
  const response = await handleRequest(request);
  console.error('[RESPONSE]', JSON.stringify(response, null, 2));
  return response;
}
```

### 2. Performance Monitoring
```typescript
// Pattern: Tool execution timing
const startTime = Date.now();
try {
  const result = await tool.execute(args);
  const duration = Date.now() - startTime;
  console.error('[PERF]', `${tool.name}: ${duration}ms`);
  return result;
} catch (error) {
  const duration = Date.now() - startTime;
  console.error('[PERF-ERROR]', `${tool.name}: ${duration}ms`, error);
  throw error;
}
```

### 3. State Validation
```typescript
// Pattern: Server state validation
private validateServerState(): void {
  if (!this.server) {
    throw new Error('Server not initialized');
  }
  if (this.transport?.closed) {
    throw new Error('Transport closed');
  }
}
```

## Testing & Validation

### 1. Unit Testing Patterns
```typescript
// Pattern: Mock MCP server for testing
const mockServer = {
  registerTool: jest.fn(),
  setRequestHandler: jest.fn(),
};

// Test tool registration and execution
expect(mockServer.registerTool).toHaveBeenCalledWith(
  'tool_name',
  expect.any(Object),
  expect.any(Function)
);
```

### 2. Integration Testing
```typescript
// Pattern: End-to-end MCP testing
const testTransport = new StdioServerTransport();
await server.connect(testTransport);

// Send test JSON-RPC messages
const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: { name: 'test_tool', arguments: {} }
};
```

## Production Debugging Checklist

### Pre-Deployment
- [ ] All console.log statements removed or redirected to stderr
- [ ] Error handling covers all code paths
- [ ] Input validation implemented for all tools
- [ ] Structured logging format consistent
- [ ] Performance monitoring in place

### Runtime Monitoring
- [ ] Error rates tracked per tool
- [ ] Response times monitored
- [ ] Memory usage watched
- [ ] Connection errors logged
- [ ] Protocol validation active

### Incident Response
- [ ] Error logs collected from stderr
- [ ] MCP Inspector available for debugging
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured

## Security Considerations for Debugging

### 1. Sensitive Data Protection
```typescript
// Pattern: Sanitize sensitive data in logs
const sanitizeForLogging = (data: any): any => {
  if (typeof data !== 'object') return data;
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.apiKey;
  return sanitized;
};
```

### 2. Debug Mode Restrictions
```typescript
// Pattern: Secure debug mode activation
const DEBUG_MODE = process.env.DEBUG_MCP === 'true' && process.env.NODE_ENV !== 'production';

if (DEBUG_MODE) {
  console.error('[DEBUG]', 'Detailed debugging enabled');
}
```

## Tool-Specific Debugging Tips

### File Operations
- Validate file paths against allowed directories
- Check file permissions before operations
- Log file operation outcomes
- Handle symlink attacks

### API Integrations
- Log API request/response times
- Validate API responses before processing
- Handle rate limiting gracefully
- Monitor authentication token expiry

### Database Operations
- Log query execution times
- Validate query parameters
- Handle connection pool exhaustion
- Monitor transaction rollbacks

## Conclusion

Effective MCP server debugging requires:
1. **Strict adherence** to the stdout/stderr separation rule
2. **Structured error handling** with proper MCP error types
3. **Comprehensive logging** to stderr with contextual information
4. **Input validation** using schemas like Zod
5. **Testing strategies** covering unit and integration scenarios
6. **Production monitoring** with performance and error tracking
7. **Security awareness** when handling sensitive data

The patterns identified in real-world implementations (promethean MCP server, kanban bridge, clojure delimiter checker) demonstrate consistent approaches to error handling, validation, and debugging that should be adopted across all MCP server implementations.

Remember: **Debug output to stderr only, JSON-RPC to stdout only** - this is the fundamental rule that must never be violated.