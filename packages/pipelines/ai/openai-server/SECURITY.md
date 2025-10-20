# Security Configuration Guide

This document explains how to configure and use the security features implemented in `@promethean/openai-server`.

## Overview

The server now includes comprehensive security features:

- **Authentication & Authorization** - JWT-based auth with RBAC
- **Rate Limiting** - Multi-layer rate limiting to prevent abuse
- **Input Validation** - XSS/SQL injection prevention and content sanitization
- **Security Headers** - CORS, CSP, and other security headers

## Environment Variables

### Authentication

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=1h          # Access token expiration
REFRESH_EXPIRES_IN=7d      # Refresh token expiration

# API Keys (comma-separated)
API_KEYS=key1,key2,key3

# Password hashing
BCRYPT_ROUNDS=12           # Between 10-15 recommended
```

### Rate Limiting

```bash
# Global rate limits (applies to all requests)
RATE_LIMIT_GLOBAL=1000     # Max requests per window
RATE_LIMIT_GLOBAL_WINDOW=1h # Time window (s/m/h/d)

# Per-user rate limits
RATE_LIMIT_USER=100        # Max requests per user per window
RATE_LIMIT_USER_WINDOW=1h  # Time window

# Per-endpoint rate limits
RATE_LIMIT_ENDPOINT=20     # Max requests per endpoint per window
RATE_LIMIT_ENDPOINT_WINDOW=1m # Time window

# Rate limiting behavior
RATE_LIMIT_SKIP_SUCCESSFUL=false  # Don't count successful requests
RATE_LIMIT_SKIP_FAILED=false      # Don't count failed requests
```

### CORS Configuration

```bash
# Allowed origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Allow credentials
CORS_CREDENTIALS=true
```

### Security Headers

```bash
# Enable security headers
SECURITY_HEADERS_ENABLED=true

# Custom Content Security Policy (optional)
CONTENT_SECURITY_POLICY=default-src 'self'; script-src 'self' 'unsafe-inline'
```

### Input Validation

```bash
# Maximum request size in bytes
MAX_REQUEST_SIZE=1048576    # 1MB

# Allowed content types (comma-separated)
ALLOWED_CONTENT_TYPES=application/json,text/plain
```

## Usage Examples

### Basic Secure Server

```typescript
import { createOpenAICompliantServer } from '@promethean/openai-server';

const { app } = createOpenAICompliantServer({
  security: {
    enabled: true,
    requireAuth: true,
  },
});

await app.listen({ port: 3000, host: '0.0.0.0' });
```

### Server with Role-Based Access

```typescript
const { app } = createOpenAICompliantServer({
  security: {
    enabled: true,
    requireAuth: true,
    allowedRoles: ['admin', 'user'], // Only admin and user roles allowed
    allowedPermissions: ['read', 'write'], // Require these permissions
  },
});
```

### Server with Custom Security Configuration

```typescript
const { app } = createOpenAICompliantServer({
  security: {
    enabled: true,
    requireAuth: false, // Allow anonymous access with rate limiting
  },
});
```

## Authentication Methods

### 1. API Key Authentication

Include the API key in the `X-API-Key` header:

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 2. JWT Bearer Token Authentication

Include the JWT token in the `Authorization` header:

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Default Users and Roles

The system creates default users based on the configured API keys:

1. **Admin User**: Created from the first API key with `admin` role
2. **Regular Users**: Created from additional API keys with `user` role

### Role Hierarchy

- **admin**: Full access including user management
- **user**: Read and write access to chat completions
- **readonly**: Read-only access

### Permissions

- **read**: Access to GET endpoints and read operations
- **write**: Access to POST/PUT endpoints and write operations
- **delete**: Access to DELETE endpoints
- **manage_users**: User management operations
- **manage_system**: System administration operations

## Rate Limiting Behavior

### Rate Limit Headers

All responses include rate limiting headers:

```
X-RateLimit-Limit: 100        # Limit for the current scope
X-RateLimit-Remaining: 95     # Remaining requests
X-RateLimit-Reset: 1640995200 # Unix timestamp when limit resets
```

### Rate Limit Exceeded

When rate limits are exceeded, the server responds with:

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "scope": "user",
  "limit": 100,
  "resetTime": 1640995200
}
```

## Input Validation

### Malicious Content Detection

The system automatically detects and blocks:

- SQL injection patterns
- XSS attempts
- Path traversal attacks
- Command injection
- NoSQL injection attempts

### Content Sanitization

User content is automatically sanitized:

- HTML tags are stripped or allowed based on configuration
- JavaScript event handlers are removed
- Dangerous protocols are blocked
- File paths are validated

### Validation Errors

Invalid requests receive detailed error responses:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": [
    "Model is required and must be a string",
    "At least one message is required"
  ]
}
```

## Security Headers

The following security headers are automatically added:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: [configured-policy]`
- `Strict-Transport-Security: max-age=31536000` (HTTPS only)

## Testing Security Features

Run the security test suite:

```bash
pnpm --filter @promethean/openai-server test
```

The tests cover:
- Authentication flows
- Rate limiting behavior
- Input validation
- Content sanitization
- Security headers

## Production Deployment Checklist

### Security Configuration

- [ ] Set a strong JWT_SECRET (at least 32 characters)
- [ ] Configure appropriate API keys
- [ ] Set rate limits based on expected traffic
- [ ] Configure CORS for your domains
- [ ] Enable security headers
- [ ] Set appropriate request size limits

### Monitoring

- [ ] Monitor rate limit exceeded errors
- [ ] Track authentication failures
- [ ] Monitor validation errors
- [ ] Set up alerts for security events

### Performance

- [ ] Test rate limiting under load
- [ ] Monitor authentication latency
- [ ] Validate input validation performance
- [ ] Check memory usage of security middleware

## Troubleshooting

### Common Issues

1. **"Invalid JWT secret" error**
   - Ensure JWT_SECRET is set and at least 32 characters
   - Check for trailing spaces in the environment variable

2. **"No API keys configured" warning**
   - Set API_KEYS environment variable with at least one key
   - Keys should be comma-separated without spaces

3. **Rate limiting too aggressive**
   - Adjust RATE_LIMIT_* values based on your needs
   - Consider different windows (s/m/h/d) for better granularity

4. **CORS errors**
   - Check ALLOWED_ORIGINS includes your frontend domain
   - Ensure CORS_CREDENTIALS matches your frontend setup

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=*
```

This will provide detailed information about security middleware operation.