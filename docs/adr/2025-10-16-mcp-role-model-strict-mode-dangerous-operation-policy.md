# ADR: 2025-10-16 - MCP Role Model, Strict Mode, and Dangerous Operation Policy

## Status

Accepted

## Context

The Promethean MCP (Model Context Protocol) system currently operates with significant security gaps between its stated configuration and actual enforcement:

### Current Problems

1. **Configuration Not Enforced**: The `promethean.mcp.json` configuration defines tool endpoints and permissions, but there is no runtime enforcement of these restrictions

2. **Allow-by-Default Security Posture**: The system defaults to permitting all operations unless explicitly blocked, creating a vulnerable security baseline

3. **Guest vs User Permission Gaps**: No meaningful distinction between unauthenticated guest access and authenticated user permissions

4. **Documentation Drift**: Security documentation and actual implementation have diverged, creating confusion about the real security posture

5. **Missing Dangerous Operation Controls**: High-risk operations (file system writes, process execution, network requests) lack proper authorization mechanisms

6. **No Administrative Constraints**: Admin-level operations are not restricted by IP address or other network-level controls

### Security Requirements

The MCP system needs to align its implementation with a defense-in-depth security model that:

- Enforces deny-by-default access controls
- Requires explicit authorization for dangerous operations
- Restricts administrative functions to trusted network locations
- Maintains a single source of truth for roles and permissions
- Provides clear audit trails for security-relevant actions

## Decision

### 1. Implement Strict Role-Based Access Control

Adopt a deny-by-default security model with three primary roles:

- **guest**: Read-only access to safe operations (file reading, basic queries)
- **user**: Standard access with write permissions to designated areas
- **admin**: Full access with dangerous operation authorization

### 2. Dangerous Operation Authorization Framework

Classify operations by risk level and require appropriate authorization:

- **Safe Operations**: No additional authorization required
- **Risky Operations**: Require explicit user confirmation
- **Dangerous Operations**: Require admin role + IP validation + explicit authorization

### 3. Administrative IP Constraints

Restrict admin-level operations to trusted network ranges with configurable allowlists.

### 4. Single Source of Truth

Establish `promethean.mcp.json` as the authoritative configuration that drives all enforcement mechanisms.

## Consequences

### Positive

1. **Improved Security Posture**: Deny-by-default prevents unauthorized access by default
2. **Clear Permission Boundaries**: Explicit role definitions prevent permission confusion
3. **Audit Trail**: Dangerous operations require explicit authorization, creating clear audit logs
4. **Network Security**: IP constraints prevent remote admin access from untrusted locations
5. **Configuration-Driven Enforcement**: Single source of truth eliminates documentation drift
6. **Defense in Depth**: Multiple layers of security controls create robust protection

### Negative

1. **Breaking Changes**: Existing workflows may require additional authorization steps
2. **Configuration Complexity**: More detailed role and permission configuration required
3. **Operational Overhead**: Admin operations now require IP allowlist maintenance
4. **User Experience**: Additional authorization steps may slow down legitimate operations

### Neutral

1. **Implementation Effort**: Requires significant development to implement enforcement layer
2. **Migration Path**: Existing deployments need gradual migration to strict mode
3. **Performance Impact**: Authorization checks add minimal latency to operations

## Implementation Details

### 1. Role Model Implementation

```typescript
interface MCPRole {
  name: 'guest' | 'user' | 'admin';
  permissions: Permission[];
  dangerousOperationsAllowed: boolean;
  ipConstraints?: string[];
}

interface Permission {
  tool: string;
  operations: ('read' | 'write' | 'execute')[];
  scope?: string[];
}
```

### 2. Operation Classification

```typescript
enum OperationRisk {
  SAFE = 'safe', // Read operations, queries
  RISKY = 'risky', // File writes, local changes
  DANGEROUS = 'dangerous', // Process execution, network requests
}

interface ToolDefinition {
  name: string;
  defaultRisk: OperationRisk;
  requiresAuth: boolean;
  adminOnly?: boolean;
}
```

### 3. Authorization Flow

```typescript
async function authorizeOperation(
  tool: string,
  operation: string,
  context: RequestContext,
): Promise<AuthorizationResult> {
  const role = await determineRole(context);
  const toolDef = getToolDefinition(tool);

  // Check basic role permissions
  if (!hasPermission(role, tool, operation)) {
    return { authorized: false, reason: 'insufficient_role' };
  }

  // Check dangerous operation requirements
  if (toolDef.defaultRisk === OperationRisk.DANGEROUS) {
    if (role.name !== 'admin') {
      return { authorized: false, reason: 'admin_required' };
    }

    if (!validateAdminIP(context.clientIP)) {
      return { authorized: false, reason: 'invalid_admin_ip' };
    }

    if (!(await getExplicitAuthorization(context))) {
      return { authorized: false, reason: 'explicit_auth_required' };
    }
  }

  return { authorized: true };
}
```

### 4. Configuration Structure

```json
{
  "version": "2025-10-16",
  "strictMode": true,
  "roles": {
    "guest": {
      "permissions": [
        { "tool": "files.read", "operations": ["read"] },
        { "tool": "mcp.help", "operations": ["read"] }
      ]
    },
    "user": {
      "permissions": [
        { "tool": "files.*", "operations": ["read", "write"], "scope": ["/workspace/**"] },
        { "tool": "kanban.*", "operations": ["read", "write"] }
      ]
    },
    "admin": {
      "permissions": [{ "tool": "*", "operations": ["read", "write", "execute"] }],
      "ipConstraints": ["127.0.0.1/32", "10.0.0.0/8", "192.168.0.0/16"]
    }
  },
  "dangerousOperations": {
    "exec.run": { "risk": "dangerous", "adminOnly": true },
    "files.write-content": { "risk": "risky", "requiresAuth": true },
    "apply_patch": { "risk": "risky", "requiresAuth": true }
  }
}
```

### 5. Enforcement Integration Points

#### MCP Transport Layer

- Add authorization middleware to all MCP endpoints
- Implement role determination from authentication tokens
- Apply IP constraints at connection establishment

#### Tool Execution Layer

- Wrap all tool calls with authorization checks
- Log all dangerous operation attempts and results
- Implement explicit authorization prompts for risky operations

#### Configuration Validation

- Validate `promethean.mcp.json` on startup
- Ensure role definitions are complete and non-conflicting
- Verify IP constraints are properly formatted

### 6. Migration Strategy

#### Phase 1: Configuration Preparation

1. Update `promethean.mcp.json` with role definitions
2. Add operation risk classifications
3. Define admin IP constraints
4. Validate configuration syntax

#### Phase 2: Enforcement Implementation

1. Implement authorization middleware
2. Add role determination logic
3. Integrate with existing MCP transport layer
4. Add comprehensive logging

#### Phase 3: Gradual Enforcement

1. Deploy in "warn-only" mode to identify breaking changes
2. Update client workflows to handle authorization requirements
3. Enable full enforcement for new deployments
4. Migrate existing deployments with grace periods

### 7. Files Changed

- `promethean.mcp.json` - Add role definitions and operation classifications
- `packages/mcp/src/core/transports/fastify.ts` - Add authorization middleware
- `packages/mcp/src/core/authorization/` - New authorization system
- `packages/mcp/src/core/config/validation.ts` - Configuration validation
- `packages/mcp/src/core/logging/audit.ts` - Audit logging for security events

### 8. Tests Added

- `src/tests/authorization/role-based.test.ts` - Role permission tests
- `src/tests/authorization/dangerous-operations.test.ts` - Dangerous operation auth
- `src/tests/authorization/ip-constraints.test.ts` - Admin IP validation
- `src/tests/authorization/config-validation.test.ts` - Configuration validation
- `src/tests/integration/security-enforcement.test.ts` - End-to-end security

## Future Considerations

1. **Time-Based Restrictions**: Consider adding time-based access controls for admin operations
2. **Multi-Factor Authentication**: Extend authorization to support MFA for dangerous operations
3. **Dynamic Role Assignment**: Implement role assignment based on project context
4. **Audit Log Analysis**: Add automated analysis of security events
5. **Certificate-Based Authentication**: Consider client certificates for enhanced security
6. **Rate Limiting**: Implement operation rate limits by role and risk level

## References

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [Zero Trust Architecture](https://www.cisa.gov/zero-trust-maturity-model)
- [Principle of Least Privilege](https://csrc.nist.gov/glossary/term/least_privilege)

---
