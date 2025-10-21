# MCP Verbose Request Logging

## Overview

The MCP Fastify transport now supports comprehensive request logging that captures all incoming HTTP requests, including ones that result in 404 errors. This is essential for debugging issues with external clients like ChatGPT.

## Enabling Verbose Logging

Set either of these environment variables before starting the MCP server:

```bash
# Enable verbose logging
export MCP_VERBOSE_LOGGING=true

# Or alternatively
export MCP_DEBUG=true

# Start the server
pnpm --filter @promethean/mcp dev
```

## What Gets Logged

### 🔍 Incoming Requests

For every request, the system logs:

- **Timestamp** and unique request ID
- **HTTP Method** (GET, POST, DELETE, etc.)
- **URL** and query parameters
- **All Headers** in JSON format
- **Request Body** (for POST/PUT/PATCH, truncated to 500 chars)
- **Remote IP** and User-Agent

Example output:
```
🔍 [2025-10-11T01:18:40.794Z] [kncbopvv0] INCOMING REQUEST
   Method: POST
   URL: /serena/mcp
   Headers: {
     "content-type": "application/json",
     "accept": "application/json, text/event-stream",
     "user-agent": "ChatGPT-Client/1.0",
     "host": "localhost:3210"
   }
   Query: {}
   Body: {"jsonrpc":"2.0","id":1,"method":"tools/list"}
   Remote IP: 127.0.0.1
   User-Agent: ChatGPT-Client/1.0
```

### 📤 Responses

For every response, the system logs:

- **Status Code** (200, 404, 500, etc.)
- **Duration** in milliseconds
- **Response Headers** in JSON format
- **Content Type** indication

Example output:
```
📤 [2025-10-11T01:18:40.798Z] [kncbopvv0] RESPONSE
   Status: 200
   Duration: 4ms
   Response Headers: {
     "content-type": "application/json",
     "cache-control": "no-cache"
   }
   Response: JSON response sent
```

### ❌ 404 Not Found

For requests to non-existent endpoints, the system logs:

- Complete request details (as above)
- **List of available endpoints** for reference
- Helpful error message

Example output:
```
❌ [2025-10-11T01:19:44.427Z] [abc123def] 404 NOT FOUND
   Method: GET
   URL: /unknown-endpoint
   Headers: {...}
   Available endpoints:
     - /mcp (registry)
     - /serena/mcp (proxy)
     - /github/mcp (proxy)
     - /healthz
     - /ui*
```

### 🚫 Errors

For server errors, the system logs:

- Error message and stack trace
- Request context

## Use Cases

### Debugging ChatGPT Integration

When ChatGPT is having trouble connecting to your MCP server:

1. **Enable verbose logging**
2. **Try the ChatGPT request again**
3. **Check the logs** to see exactly what ChatGPT is requesting
4. **Identify mismatches** between expected and actual endpoints/methods

Common issues you can diagnose:

- **Wrong endpoint paths** - ChatGPT requests `/endpoint` but you have `/different-endpoint`
- **Wrong HTTP methods** - ChatGPT uses GET but you only support POST
- **Missing headers** - ChatGPT doesn't send required headers
- **Malformed requests** - Invalid JSON or missing body
- **Timing issues** - Requests taking too long to respond

### API Development

- **See all traffic** during development and testing
- **Debug CORS issues** by checking request headers
- **Monitor performance** with timing information
- **Track errors** with detailed context

## Security Considerations

- **Request bodies may contain sensitive data** - logging truncates large bodies
- **Headers may contain authentication tokens** - be careful when sharing logs
- **Verbose logging should only be enabled in development** - not in production

## Disabling Logging

To disable verbose logging:

```bash
# Unset the environment variable
unset MCP_VERBOSE_LOGGING
unset MCP_DEBUG

# Or explicitly set to false
export MCP_VERBOSE_LOGGING=false

# Restart the server
pnpm --filter @promethean/mcp dev
```

## Log Format

The logs use clear visual separators:

- 🔍 **INCOMING REQUEST** - Request received
- 📤 **RESPONSE** - Response sent
- ❌ **404 NOT FOUND** - Route not found
- 🚫 **ERROR** - Server error
- ══════════════════════════════════════════════════════════════ - Separator

Each request gets a unique ID (9 characters) for easy correlation between request and response logs.

## Example Session

```bash
$ MCP_VERBOSE_LOGGING=true pnpm --filter @promethean/mcp dev

🔍 MCP Verbose Logging Enabled
🌐 Server listening on http://localhost:3210
📝 All requests will be logged with full details
🚀 Use MCP_VERBOSE_LOGGING=true to enable, MCP_VERBOSE_LOGGING=false to disable

# ... server starts ...

🔍 [2025-10-11T10:30:15.123Z] [abc123xyz] INCOMING REQUEST
   Method: GET
   URL: /serena/mcp
   Headers: {...}
   Remote IP: 127.0.0.1
   User-Agent: curl/8.5.0

📤 [2025-10-11T10:30:15.128Z] [abc123xyz] RESPONSE
   Status: 200
   Duration: 5ms
   Response Headers: {...}
   Response: JSON response sent
═══════════════════════════════════════════════════════════════
```