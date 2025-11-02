# MCP Authentication Modes: API Key vs OAuth

## Executive Summary

This document clarifies the two authentication modes available in MCP and provides guidance on when to use each. The **API Key mode** is recommended for most connector integrations, while **OAuth mode** is designed for user-facing web applications.

## Authentication Modes Comparison

### API Key Authentication (Recommended for Connectors)

**Use Case:** Service-to-service authentication, API integrations, connectors

**How it Works:**

- Client sends `X-API-Key: <key>` header or `?api_key=<key>` query parameter
- MCP validates the key against configured key registry
- Returns user context with associated permissions

**Advantages:**

- ✅ Simple to implement
- ✅ No redirect flows required
- ✅ Works with any HTTP client
- ✅ Fine-grained permission control
- ✅ Built-in rate limiting
- ✅ No browser dependencies
- ✅ Immediate authentication

**Configuration:**

```bash
export MCP_API_KEYS='{
  "connector-key": {
    "name": "ChatGPT Connector",
    "userId": "connector-user",
    "role": "user",
    "permissions": ["*"]
  }
}'
```

**Client Implementation:**

```javascript
// Header approach (preferred)
fetch('http://localhost:3210/mcp/status', {
  headers: { 'X-API-Key': 'connector-key' },
});

// Query parameter approach
fetch('http://localhost:3210/mcp/status?api_key=connector-key');
```

---

### OAuth Authentication (For Web Applications)

**Use Case:** User-facing web applications requiring GitHub/Google login

**How it Works:**

- User visits `/auth/oauth/github/start`
- Redirects to GitHub/Google for authentication
- Provider redirects back to `/auth/oauth/callback`
- MCP exchanges code for user info and issues JWT
- Client receives JWT for subsequent requests

**Advantages:**

- ✅ Familiar user experience
- ✅ No password management
- ✅ Supports major providers (GitHub, Google)
- ✅ Automatic user provisioning
- ✅ Secure token handling

**Limitations:**

- ❌ Requires browser-based flow
- ❌ Complex redirect handling
- ❌ Not suitable for simple connectors
- ❌ Requires provider configuration

**Configuration:**

```bash
# Enable OAuth
export MCP_OAUTH_ENABLED=true
export MCP_OAUTH_GITHUB_CLIENT_ID=your_client_id
export MCP_OAUTH_GITHUB_CLIENT_SECRET=your_client_secret
export MCP_OAUTH_REDIRECT_URI=http://localhost:3210/auth/oauth/callback
```

**Required Endpoints:**

- `GET /auth/oauth/github/start` - Initiate OAuth flow
- `GET /auth/oauth/callback` - Handle provider callback
- `GET /auth/oauth/login` - OAuth provider endpoint (if MCP is provider)

---

## Decision Matrix

| Scenario            | Recommended Mode | Reason                                          |
| ------------------- | ---------------- | ----------------------------------------------- |
| ChatGPT Connector   | **API Key**      | Simple HTTP client, no browser needed           |
| API Integration     | **API Key**      | Direct service-to-service communication         |
| Web Dashboard       | **OAuth**        | User login with GitHub/Google                   |
| Mobile App          | **API Key**      | No OAuth redirect flow in mobile context        |
| CLI Tool            | **API Key**      | Command-line tools can't handle OAuth redirects |
| Third-party Service | **API Key**      | External services need simple auth              |

## Common Pitfalls

### OAuth Mode Pitfalls

1. **404 Errors on `/auth/oauth/login`**

   - **Problem:** Connector expects MCP to be OAuth provider
   - **Solution:** Use API Key mode instead

2. **Redirect URI Mismatches**

   - **Problem:** `redirect_uri` points to ChatGPT instead of your callback
   - **Solution:** Configure correct callback URL or use API Key mode

3. **Missing Provider Endpoints**
   - **Problem:** MCP doesn't implement `/authorize` and `/token` endpoints
   - **Solution:** MCP is OAuth client, not provider

### API Key Mode Pitfalls

1. **Key Exposure**

   - **Problem:** Keys committed to repositories
   - **Solution:** Use environment variables, rotate keys regularly

2. **Over-permissive Keys**
   - **Problem:** Using `["*"]` permissions unnecessarily
   - **Solution:** Grant minimum required permissions

## Implementation Examples

### ChatGPT Connector (API Key Mode)

```javascript
// Connector configuration
const connectorConfig = {
  auth: {
    type: 'api_key',
    apiKey: process.env.MCP_CONNECTOR_KEY,
    headerName: 'X-API-Key',
  },
  baseUrl: 'http://localhost:3210',
};

// Making requests
const response = await fetch(`${connectorConfig.baseUrl}/mcp/status`, {
  headers: {
    'X-API-Key': connectorConfig.auth.apiKey,
    'Content-Type': 'application/json',
  },
});
```

### Web Application (OAuth Mode)

```javascript
// Initiate OAuth flow
window.location.href = '/auth/oauth/github/start';

// After callback, MCP sets JWT cookie
// Subsequent requests include authentication automatically
const response = await fetch('/api/user/profile');
```

## Security Considerations

### API Key Security

- **Storage:** Keep keys in environment variables, not code
- **Rotation:** Regularly rotate production keys
- **Scope:** Use minimum required permissions
- **Monitoring:** Log and monitor key usage
- **Expiration:** Set expiration dates where appropriate

### OAuth Security

- **State Parameter:** Always use and verify state parameter
- **HTTPS:** Require HTTPS for all OAuth endpoints
- **Scope:** Request minimum required scopes from providers
- **Token Storage:** Store JWTs securely (httpOnly cookies)
- **CSRF:** Implement CSRF protection for web applications

## Migration Guide

### From OAuth to API Key

1. **Generate API Key:**

   ```bash
   export MCP_API_KEYS='{"new-key": {"name": "Migrated Connector", "userId": "migrated-user", "role": "user", "permissions": ["*"]}}'
   ```

2. **Update Client Code:**

   ```javascript
   // Remove OAuth redirect logic
   // Add API Key header
   headers: { 'X-API-Key': 'new-key' }
   ```

3. **Test Integration:**
   - Verify authentication works
   - Check permissions are correct
   - Monitor for any rate limiting

### From API Key to OAuth

1. **Configure OAuth Provider:**

   ```bash
   export MCP_OAUTH_ENABLED=true
   export MCP_OAUTH_GITHUB_CLIENT_ID=your_id
   export MCP_OAUTH_GITHUB_CLIENT_SECRET=your_secret
   ```

2. **Update Client Flow:**

   - Implement OAuth redirect logic
   - Handle callback and token storage
   - Update request headers to use JWT

3. **Remove API Keys:**
   - Clear MCP_API_KEYS environment variable
   - Revoke existing keys if needed

## Troubleshooting

### API Key Issues

| Symptom               | Cause                    | Solution                           |
| --------------------- | ------------------------ | ---------------------------------- |
| 401 Unauthorized      | Invalid key format       | Check key ID matches configuration |
| 403 Forbidden         | Insufficient permissions | Update key permissions             |
| 429 Too Many Requests | Rate limit exceeded      | Increase limits or wait            |

### OAuth Issues

| Symptom                  | Cause                | Solution                           |
| ------------------------ | -------------------- | ---------------------------------- |
| 404 on /auth/oauth/login | Wrong auth mode      | Use API Key mode for connectors    |
| Redirect loop            | Invalid callback URL | Fix MCP_OAUTH_REDIRECT_URI         |
| Invalid state            | CSRF protection      | Implement state parameter handling |

## Best Practices

### For API Key Mode

1. **Environment-based configuration** - never commit keys
2. **Principle of least privilege** - minimum required permissions
3. **Regular rotation** - replace keys periodically
4. **Monitoring** - track usage patterns
5. **Documentation** - maintain key inventory

### For OAuth Mode

1. **HTTPS everywhere** - all OAuth endpoints over HTTPS
2. **State parameter** - prevent CSRF attacks
3. **Secure token storage** - httpOnly cookies
4. **Scope limitation** - request minimum scopes
5. **Error handling** - graceful OAuth failure handling

## Conclusion

**API Key authentication** is the recommended approach for:

- ChatGPT connectors
- API integrations
- Service-to-service communication
- CLI tools and scripts

**OAuth authentication** is appropriate for:

- User-facing web applications
- Applications requiring social login
- Scenarios where users manage their own authentication

The 404 OAuth error you're experiencing is resolved by switching to API Key mode, which is simpler, more secure, and designed for connector integrations.
