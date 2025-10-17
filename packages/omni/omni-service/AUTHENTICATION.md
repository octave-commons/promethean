# Omni Service Authentication & RBAC Guide

This guide demonstrates the complete authentication and authorization system implemented in the Omni Service.

## 🔐 Authentication Features

### JWT-Based Authentication
- **Access Tokens**: Short-lived tokens for API access
- **Refresh Tokens**: Long-lived tokens for token renewal
- **Token Validation**: Secure JWT parsing and verification
- **Token Generation**: Automatic token creation with user context

### API Key Authentication
- **Service-to-Service Auth**: API keys for automated access
- **Token Prefixes**: `omni_` prefix for identification
- **Permission Binding**: API keys can be created with specific permissions
- **Header/Query Support**: Flexible API key location

### Role-Based Access Control (RBAC)
- **Role Hierarchy**: Inherited permissions and role relationships
- **Permission System**: Granular resource-action permissions
- **Wildcard Support**: `*` resource and action wildcards
- **Caching**: Permission caching for performance

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp examples/.env.example .env

# Edit with your configuration
# Minimum required: JWT_SECRET (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```

### 2. Start the Service
```bash
# Development mode
pnpm --filter @promethean/omni-service start:dev

# Production mode
pnpm --filter @promethean/omni-service build
pnpm --filter @promethean/omni-service start
```

### 3. Test Authentication
```bash
# Get a JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Use the token
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/protected
```

## 📋 Authentication Endpoints

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "username": "user@example.com",
    "email": "user@example.com",
    "roles": ["user"]
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "username": "user@example.com",
    "email": "user@example.com",
    "roles": ["user"]
  },
  "roles": {
    "directRoles": ["user"],
    "inheritedRoles": ["readonly"],
    "allRoles": ["user", "readonly"],
    "roleDetails": [...],
    "permissions": ["api:*:read", "user:profile:read,write"]
  },
  "permissions": ["api:*:read", "user:profile:read,write"],
  "tokenType": "access"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <JWT_TOKEN>
```

## 🔑 API Key Authentication

### Generate API Key (Admin Only)
```http
POST /auth/apikey
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "serviceId": "my-service",
  "permissions": ["api:*:read", "health:*:read"]
}
```

**Response:**
```json
{
  "apiKey": "omni_1a2b3c4d.eyJhbGciOiJIUzI1NiIs...",
  "serviceId": "my-service",
  "permissions": ["api:*:read", "health:*:read"],
  "createdAt": "2025-06-20T18:45:00.000Z"
}
```

### Use API Key
```http
GET /protected
X-API-Key: omni_1a2b3c4d.eyJhbGciOiJIUzI1NiIs...
```

## 🛡️ Default Roles

### Admin
- **Permissions**: `*` (all resources, all actions)
- **Description**: Full system administrator
- **Use Cases**: System administration, full access

### User
- **Permissions**: 
  - `user:profile:read,write`
  - `api:*:read`
- **Description**: Regular authenticated user
- **Use Cases**: User profile management, read-only API access

### Readonly
- **Permissions**:
  - `api:*:read`
  - `health:*:read`
- **Description**: Read-only access
- **Use Cases**: Public data access, monitoring

### Service
- **Permissions**:
  - `api:*:read,write`
  - `health:*:read`
- **Description**: Service-to-service access
- **Use Cases**: Automated service communication

## 🔧 Permission System

### Permission Format
`resource:action1,action2,action3`

**Examples:**
- `api:users:read,write` - Read and write API users
- `health:*:read` - Read all health endpoints
- `*:admin` - Admin access to all resources

### Wildcard Support
- `*:*` - All resources, all actions
- `api:*:read` - Read all API resources
- `user:*:write` - Write all user resources

### Resource Hierarchies
- `api:users` - Specific user API endpoints
- `api:users:*` - All actions on user API
- `api:*` - All API resources
- `*` - All resources

## 🔍 Authorization Middleware

### Required Authentication
```typescript
app.get('/protected', {
  preHandler: authManager.createAuthMiddleware({ required: true }),
}, handler);
```

### Required Permissions
```typescript
app.get('/admin/users', {
  preHandler: authManager.createAuthMiddleware({
    required: true,
    permissions: [{ resource: 'api:users', actions: ['read', 'admin'] }],
  }),
}, handler);
```

### Required Roles
```typescript
app.delete('/admin/critical', {
  preHandler: authManager.createAuthMiddleware({
    required: true,
    roles: ['admin'],
  }),
}, handler);
```

### Optional Authentication
```typescript
app.get('/public-data', {
  preHandler: authManager.createOptionalAuthMiddleware(),
}, (request, reply) => {
  if (request.user) {
    // Authenticated user
  } else {
    // Unauthenticated user
  }
});
```

## 🧪 Testing Authentication

### Unit Tests
```typescript
import { createAuthManager } from '@promethean/omni-service';

const authManager = createAuthManager();
const user = { id: 'test', roles: ['user'] };

// Generate and validate tokens
const tokens = authManager.generateTokens(user);
const result = authManager.getTokenManager().validateToken(tokens.accessToken);
console.log(result.success); // true
```

### Integration Tests
```bash
# Run all auth tests
pnpm --filter @promethean/omni-service test

# Run specific test file
pnpm --filter @promethean/omni-service test src/tests/auth.test.ts

# Run with coverage
pnpm --filter @promethean/omni-service coverage
```

## 📊 Permission Checking Examples

### In Route Handlers
```typescript
app.get('/resource/:id', {
  preHandler: authManager.createAuthMiddleware({ required: true }),
}, (request, reply) => {
  if (!request.user) return reply.status(401).send({ error: 'Unauthorized' });
  
  const checker = authManager.createPermissionChecker(request.user);
  const resourceId = request.params.id;
  
  if (!checker.canRead(`resource:${resourceId}`)) {
    return reply.status(403).send({ error: 'Forbidden' });
  }
  
  // Handle request...
});
```

### Complex Permission Logic
```typescript
// Check multiple permissions
const hasReadWrite = checker.hasAllPermissions(
  'resource:123',
  ['read', 'write']
);

// Check any of multiple permissions
const hasAnyAccess = checker.hasAnyPermission(
  'resource:123',
  ['read', 'admin', 'delete']
);

// Check admin access
const canDelete = checker.hasAdminAccess('resource:123');

// Check roles
const isAdmin = checker.hasRole('admin');
const isUserOrAdmin = checker.hasAnyRole(['user', 'admin']);
```

## 🔧 Configuration

### Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your-32-character-secret
JWT_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d
JWT_ALGORITHM=HS256

# RBAC Configuration
RBAC_DEFAULT_ROLES=readonly
RBAC_PERMISSIONS_CACHE_TTL=300

# API Key Configuration
APIKEY_ENABLED=true
APIKEY_HEADER_NAME=x-api-key
```

### Programmatic Configuration
```typescript
import { createAuthManager } from '@promethean/omni-service';

const authManager = createAuthManager({
  jwt: {
    secret: 'your-secret',
    expiresIn: '2h',
    algorithm: 'HS256',
    issuer: 'your-service',
    audience: 'your-audience',
    refreshExpiresIn: '30d',
  },
  rbac: {
    defaultRoles: ['readonly'],
    permissionsCacheTTL: 600,
  },
  apikey: {
    enabled: true,
    headerName: 'x-api-key',
  },
});
```

## 🚨 Security Considerations

### JWT Security
- Use strong secrets (32+ characters)
- Set appropriate expiration times
- Use HTTPS in production
- Validate all JWT fields

### API Key Security
- Use long, random API keys
- Store API keys securely
- Rotate API keys regularly
- Use least-privilege permissions

### RBAC Security
- Validate role inheritance
- Use principle of least privilege
- Cache permissions appropriately
- Audit permission changes

### Session Security
- Use secure cookies in production
- Set appropriate SameSite policies
- Implement proper logout
- Handle session expiration

## 🔍 Troubleshooting

### Common Issues

**"JWT secret must be at least 32 characters"**
- Set `JWT_SECRET` environment variable with 32+ characters
- Ensure secret is properly escaped in shell

**"Invalid token format"**
- Check token format: `Bearer <token>` or `x-api-key: <key>`
- Ensure token is not expired
- Verify token signature

**"Insufficient permissions"**
- Check user roles and permissions
- Verify resource-action mapping
- Use permission checking utilities for debugging

**"Circular inheritance detected"**
- Review role inheritance definitions
- Ensure no circular dependencies
- Use RBAC validation tools

### Debug Logging
```typescript
// Enable debug logging
process.env.LOG_LEVEL = 'debug';

// Add custom auth logging
app.addHook('preHandler', async (request, reply) => {
  if (request.user) {
    request.log.debug({
      user: request.user.id,
      roles: request.user.roles,
      permissions: Array.from(request.user.permissions),
      path: request.url,
    });
  }
});
```

## 📚 Advanced Features

### Custom Roles
```typescript
const customRole = {
  name: 'content-manager',
  description: 'Manages content resources',
  permissions: [
    { resource: 'content:*', actions: ['read', 'write'] },
    { resource: 'media:*', actions: ['read', 'write', 'delete'] },
  ],
  inherits: ['user'],
};

authManager.getRBACManager().addRole(customRole);
```

### Custom Authentication Hooks
```typescript
app.addHook('preHandler', async (request, reply) => {
  // Custom auth logic
  if (request.url.startsWith('/internal/')) {
    // Require service authentication
    const authHeader = request.headers['x-service-auth'];
    if (!authHeader) {
      return reply.status(401).send({ error: 'Service auth required' });
    }
    // Validate service auth...
  }
});
```

### Custom Permission Formats
```typescript
// Custom permission utility
class CustomPermissionChecker {
  static checkCustomPermission(user: UserContext, rule: string): boolean {
    // Implement custom permission logic
    const [resource, action, condition] = rule.split(':');
    
    // Check basic permission
    const basicCheck = user.permissions.has(`${resource}:${action}`);
    if (!basicCheck) return false;
    
    // Check condition
    if (condition && condition === 'owner') {
      return user.metadata?.isOwner === true;
    }
    
    return true;
  }
}
```

---

This comprehensive authentication system provides enterprise-grade security for the Omni Service while maintaining flexibility and ease of use.