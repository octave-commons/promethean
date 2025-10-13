# MCP Authorization Framework

## Overview

The MCP (Model Context Protocol) Authorization Framework addresses a critical P0 security vulnerability where any authenticated user could perform destructive operations without proper access controls. This framework implements Role-Based Access Control (RBAC) with comprehensive audit logging.

## Security Problem Solved

**Before**: Any user with access to MCP could:

- Delete files and tasks
- Execute arbitrary commands
- Modify system configurations
- Perform destructive GitHub operations

**After**: Users are restricted based on their role with full audit trails.

## Architecture

### Core Components

1. **Authorization Framework** (`src/core/authorization.ts`)

   - Role-based access control (RBAC)
   - Permission levels: read, write, delete, admin
   - Tool categorization and risk assessment
   - Comprehensive audit logging

2. **User Roles**

   - **Guest**: Read-only access to safe operations
   - **User**: Read + write access to non-destructive operations
   - **Developer**: Read + write + delete access
   - **Admin**: Full access including system-level operations

3. **Tool Categories**
   - `files`: File system operations
   - `exec`: Command execution
   - `kanban`: Task management
   - `github`: GitHub operations
   - `process`: Process management
   - `sandbox`: Sandbox operations
   - `system`: System-level operations
   - `meta`: Meta/help tools

### Permission Matrix

| Tool Category        | Guest | User | Developer | Admin |
| -------------------- | ----- | ---- | --------- | ----- |
| Read operations      | ✅    | ✅   | ✅        | ✅    |
| Write operations     | ❌    | ✅   | ✅        | ✅    |
| Delete operations    | ❌    | ❌   | ✅        | ✅    |
| Command execution    | ❌    | ❌   | ❌        | ✅    |
| System configuration | ❌    | ❌   | ❌        | ✅    |

## Implementation Details

### Tool Authorization Requirements

Each tool has specific authorization requirements:

```typescript
const TOOL_AUTH_REQUIREMENTS: Record<string, ToolAuthRequirements> = {
  files_write_content: {
    category: 'files',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  exec_run: {
    category: 'exec',
    requiredLevel: 'admin',
    requiredRoles: ['developer', 'admin'],
    dangerous: true,
    auditLog: true,
  },
  // ... more tools
};
```

### Authorization Flow

1. **User Authentication**: Extract user context from environment/JWT
2. **Tool Authorization**: Check role and permission requirements
3. **Audit Logging**: Log all attempts (allowed and denied)
4. **Tool Execution**: Proceed if authorized, deny otherwise

### Audit Logging

All tool invocations are logged with:

- Timestamp
- User ID and role
- Tool name and action
- Arguments (sanitized)
- Result (allowed/denied)
- IP address and user agent
- Reason for denial (if applicable)

## Configuration

### Environment Variables

```bash
# User authentication
MCP_USER_ID=user123
MCP_USER_ROLE=developer
MCP_SESSION_TOKEN=jwt_token_here

# Optional client information
REMOTE_ADDR=192.168.1.100
USER_AGENT=Mozilla/5.0...
```

### Authorization Configuration

```typescript
// src/config/auth-config.ts
export const defaultAuthConfig: AuthConfig = {
  defaultRole: 'guest',
  strictMode: true,
  requireAuthForDangerous: true,
  sessionTimeout: 60,
  enableAuditLog: true,
  rateLimiting: {
    requestsPerMinute: 100,
    dangerousRequestsPerHour: 10,
  },
  adminIpWhitelist: ['127.0.0.1', '::1'],
};
```

## Usage Examples

### Guest User (Limited Access)

```typescript
// Environment: MCP_USER_ROLE=guest
const context = { env: { MCP_USER_ROLE: 'guest' } };

// ✅ Allowed: Read operations
await filesViewFile.invoke({ path: 'README.md' });

// ❌ Denied: Write operations
await filesWriteContent.invoke({ filePath: 'test.txt', content: 'hello' });
// Error: Authorization denied: Guest users cannot perform dangerous operations
```

### Developer User (Full Access Except Admin)

```typescript
// Environment: MCP_USER_ROLE=developer
const context = { env: { MCP_USER_ROLE: 'developer' } };

// ✅ Allowed: Delete operations
await kanbanDeleteTask.invoke({ uuid: 'task-123' });

// ❌ Denied: Admin operations
await processUpdateTaskRunnerConfig.invoke({ config: {} });
// Error: Authorization denied: Role 'developer' not in required roles: admin
```

### Admin User (Full Access)

```typescript
// Environment: MCP_USER_ROLE=admin
const context = { env: { MCP_USER_ROLE: 'admin' } };

// ✅ Allowed: All operations
await execRun.invoke({ commandId: 'system.update' });
await kanbanDeleteTask.invoke({ uuid: 'task-123' });
await filesWriteContent.invoke({ filePath: 'config.json', content: '{}' });
```

## Security Features

### 1. Defense in Depth

- **Role Hierarchy**: Users can only access operations at or below their level
- **Tool Categorization**: Different rules for different types of operations
- **Dangerous Operation Flagging**: Extra scrutiny for destructive actions
- **Required Role Restrictions**: Some tools require specific roles regardless of level

### 2. Comprehensive Auditing

- **All Attempts Logged**: Both successful and failed attempts
- **Rich Context**: IP addresses, user agents, timestamps
- **Searchable Logs**: Filter by user, tool, result, etc.
- **Console Output**: Immediate visibility for security monitoring

### 3. Fail-Safe Defaults

- **Deny by Default**: Tools without explicit requirements are safe by default
- **Guest Restrictions**: Guests cannot perform any dangerous operations
- **Admin Isolation**: Admin operations require explicit admin role

## Testing

The authorization framework includes comprehensive tests:

```bash
# Run authorization tests
pnpm test packages/mcp/src/test/authorization.test.ts
```

Test coverage includes:

- Role-based access control
- Permission level enforcement
- Audit logging functionality
- Error handling
- Edge cases

## Migration Guide

### For Existing MCP Deployments

1. **Set User Roles**: Configure `MCP_USER_ROLE` environment variable
2. **Test Access**: Verify users have appropriate access levels
3. **Monitor Logs**: Check audit logs for unexpected denials
4. **Adjust Configuration**: Fine-tune role assignments as needed

### For New Integrations

1. **Define User Roles**: Determine appropriate roles for your users
2. **Configure Authentication**: Set up JWT or other auth mechanism
3. **Implement Authorization**: Use the provided framework
4. **Enable Audit Logging**: Monitor for security issues

## Best Practices

### 1. Principle of Least Privilege

- Assign minimum required roles to users
- Use guest role for unauthenticated access
- Reserve admin role for system administrators

### 2. Regular Auditing

- Review audit logs regularly
- Monitor for unusual access patterns
- Investigate repeated authorization failures

### 3. Security Monitoring

- Set up alerts for admin operations
- Monitor dangerous tool usage
- Track failed authorization attempts

### 4. Session Management

- Implement appropriate session timeouts
- Use secure authentication mechanisms
- Rotate credentials regularly

## Troubleshooting

### Common Issues

1. **"Authorization denied" errors**

   - Check user role in environment variables
   - Verify tool requirements
   - Review audit logs for specific reason

2. **Missing audit logs**

   - Ensure `enableAuditLog` is true
   - Check log configuration
   - Verify tool has `auditLog: true`

3. **Role not working**
   - Validate role spelling (case-sensitive)
   - Check role hierarchy configuration
   - Review permission level assignments

### Debug Information

Enable debug logging by setting:

```bash
DEBUG=authorization:* pnpm mcp dev
```

This will show detailed authorization decisions and reasoning.

## Future Enhancements

### Planned Features

1. **Fine-Grained Permissions**: Resource-level access control
2. **Time-Based Restrictions**: Temporary access grants
3. **Multi-Factor Authentication**: Additional security for admin operations
4. **Integration with External Auth**: LDAP, OAuth, SSO support
5. **Advanced Rate Limiting**: Per-tool and per-user limits
6. **Real-Time Monitoring**: Dashboard for security operations

### Extensibility

The framework is designed to be extensible:

- Custom role definitions
- Additional permission levels
- Plugin-based authentication
- Custom audit log destinations

## Conclusion

The MCP Authorization Framework provides a robust, secure foundation for controlling access to powerful MCP tools. By implementing proper RBAC with comprehensive auditing, it addresses the critical security vulnerability while maintaining flexibility for various use cases.

The framework follows security best practices and provides clear migration paths for existing deployments. Regular monitoring and auditing ensure ongoing security compliance.
