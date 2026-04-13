# MCP API Key Authentication Setup

## Overview

This document explains how to configure API Key authentication for MCP to resolve the 404 OAuth error when connecting ChatGPT connectors.

## Problem

The ChatGPT connector expects your service to be an OAuth provider with endpoints like `/auth/oauth/login`, but MCP is designed as an OAuth **client** (to GitHub), not a provider. This causes a 404 error when the connector tries to access non-existent OAuth provider endpoints.

## Solution: API Key Authentication

Switch the connector to use API Key authentication, which MCP supports natively.

### Quick Setup

1. **Set the MCP_API_KEYS environment variable:**

```bash
export MCP_API_KEYS='{
  "chatgpt-connector-key": {
    "name": "ChatGPT Connector",
    "userId": "connector-user",
    "role": "user",
    "permissions": ["*"]
  }
}'
```

2. **Configure the ChatGPT connector to send:**
   - Header: `X-API-Key: chatgpt-connector-key`
   - Or query parameter: `?api_key=chatgpt-connector-key`

### API Key Format

MCP accepts API keys in two ways:

1. **Header (preferred):** `X-API-Key: chatgpt-connector-key`
2. **Query parameter:** `?api_key=chatgpt-connector-key`

### API Key Configuration Options

```json
{
  "chatgpt-connector-key": {
    "name": "ChatGPT Connector",
    "userId": "connector-user",
    "role": "user",
    "permissions": ["*"],
    "rateLimit": {
      "requestsPerMinute": 100,
      "requestsPerHour": 1000
    },
    "expiresAt": "2025-12-31T23:59:59Z"
  }
}
```

### Available Roles

- `guest` - Minimal access
- `user` - Standard user access
- `developer` - Developer access
- `admin` - Full administrative access

### Permission System

Use `["*"]` for full access or specify specific permissions:

- `["read"]` - Read-only access
- `["read", "write"]` - Read and write access
- `["admin"]` - Administrative access

## Implementation Details

### How MCP Processes API Keys

1. **Extraction:** MCP checks for `X-API-Key` header first, then `api_key` query parameter
2. **Validation:** Validates key format (`mcp_<keyId>_<signature>`) and expiration
3. **Rate Limiting:** Applies per-key rate limits if configured
4. **Authentication:** Returns user context with associated role and permissions

### Security Features

- **Rate Limiting:** Configurable per-key rate limits
- **Expiration:** Optional expiration dates for keys
- **Audit Logging:** All API key usage is logged
- **Secure Format:** Keys use cryptographically secure signatures

## Troubleshooting

### Common Issues

1. **Invalid API Key Error**

   - Check that the key ID matches exactly
   - Verify the MCP_API_KEYS environment variable is properly formatted JSON

2. **Rate Limit Exceeded**

   - Increase rate limits in the key configuration
   - Wait for the rate limit window to reset

3. **Permission Denied**
   - Check the role and permissions assigned to the key
   - Ensure the requested operation is allowed by the permissions

### Debug Mode

Enable debug logging to see authentication details:

```bash
export DEBUG=auth:*
```

## Migration from OAuth

If you were previously using OAuth:

1. **Remove OAuth configuration** from your connector
2. **Generate API key** using the format above
3. **Update connector** to send `X-API-Key` header
4. **Test connection** - should work immediately without 404 errors

## Example Connector Configuration

### ChatGPT Connector Settings

```json
{
  "auth": {
    "type": "api_key",
    "apiKey": "chatgpt-connector-key",
    "headerName": "X-API-Key"
  }
}
```

### cURL Test

```bash
curl -H "X-API-Key: chatgpt-connector-key" \
     http://localhost:3210/mcp/status
```

## Security Best Practices

1. **Use strong key IDs** - avoid predictable names
2. **Set appropriate permissions** - don't use `["*"]` unless necessary
3. **Configure rate limits** - prevent abuse
4. **Set expiration dates** - keys should expire periodically
5. **Monitor usage** - check logs for unusual activity
6. **Rotate keys regularly** - replace keys periodically

## Environment Variables

| Variable           | Description                                | Example            |
| ------------------ | ------------------------------------------ | ------------------ |
| `MCP_API_KEYS`     | JSON object containing API key definitions | See above          |
| `JWT_SECRET`       | Secret for JWT token generation            | `your-secret-here` |
| `MCP_DEFAULT_ROLE` | Default role for unauthenticated users     | `guest`            |

## Next Steps

1. Configure the API key as shown above
2. Update your ChatGPT connector to use API Key auth
3. Test the connection
4. Monitor logs to ensure proper authentication

This approach eliminates the 404 OAuth error and provides a more secure, simpler authentication method for connectors.
