# ADR: AuthConfig Authorization Enforcement Status

## Status
Implemented (Already Wired)

## Date
2025-10-17

## Context
Initial security analysis suggested that AuthConfig toggles (strictMode, requireAuthForDangerous, adminIpWhitelist) were not wired into the authorization decision path in `packages/mcp/src/core/authorization.ts`.

## Decision
After code review, the AuthConfig toggles **ARE already properly implemented** in the `authorizeTool` function (lines 200-242):

1. **Strict Mode** (lines 207-213): Denies unknown tools when `config.strictMode` is enabled
2. **Require Auth for Dangerous** (lines 215-223): Requires authentication for dangerous operations when `config.requireAuthForDangerous` is enabled
3. **Admin IP Whitelist** (lines 225-233): Validates admin IP against whitelist when configured

## Implementation Details

### Strict Mode Enforcement
```typescript
if (!requirements) {
  if (config.strictMode) {
    return {
      allowed: false,
      reason: `Tool '${toolName}' not found in authorization configuration (strict mode enabled)`,
    };
  }
  return { allowed: true };
}
```

### Dangerous Operations Authentication
```typescript
if (requirements.dangerous && config.requireAuthForDangerous) {
  if (authContext.role === 'guest' || authContext.userId === 'anonymous') {
    return {
      allowed: false,
      reason: `Authentication required for dangerous operation '${toolName}' (requireAuthForDangerous enabled)`,
    };
  }
}
```

### Admin IP Whitelist
```typescript
if (authContext.role === 'admin' && config.adminIpWhitelist.length > 0) {
  const clientIp = authContext.ipAddress || 'unknown';
  if (!config.adminIpWhitelist.includes(clientIp)) {
    return {
      allowed: false,
      reason: `Admin access denied from IP ${clientIp}. Whitelisted IPs: ${config.adminIpWhitelist.join(', ')}`,
    };
  }
}
```

## Consequences

### Positive
- RBAC system is fully functional with configurable security policies
- All AuthConfig toggles are working as designed
- Comprehensive test coverage exists in `authorization.test.ts`
- Guest write operations are properly blocked (confirmed by testing)

### Remaining Gaps
1. **Tool Coverage**: Some high-impact tools may need `requiredRoles` expansion beyond permission levels
2. **Documentation**: Need to clarify that AuthConfig is already enforced
3. **Testing**: Additional edge case tests for configuration combinations

## Actions Taken

1. ✅ Verified AuthConfig enforcement in authorization.ts
2. ✅ Confirmed comprehensive test coverage exists
3. ✅ Validated RBAC functionality (guest write blocked)
4. 📝 Created this ADR to document actual implementation status
5. 📋 Identified remaining improvement areas

## Recommendations

1. **Document Current State**: Update security documentation to reflect AuthConfig is enforced
2. **Expand Tool Coverage**: Review and add `requiredRoles` for high-impact GitHub/system/sandbox operations
3. **Add Edge Case Tests**: Test configuration combinations and error scenarios
4. **Monitor Usage**: Track authorization decisions in production to identify gaps

## Configuration Examples

### Enable Strict Mode
```bash
export MCP_STRICT_MODE=true
```

### Require Authentication for Dangerous Operations
```bash
export MCP_REQUIRE_AUTH_DANGEROUS=true
```

### Configure Admin IP Whitelist
```bash
export MCP_ADMIN_IP_WHITELIST="127.0.0.1,192.168.1.100,::1"
```

### Disable Audit Logging
```bash
export MCP_ENABLE_AUDIT=false
```

## Testing Verification

The authorization system includes comprehensive tests covering:
- Role-based access control
- AuthConfig toggle functionality
- Strict mode deny-by-default behavior
- Dangerous operation authentication requirements
- Admin IP whitelist validation
- Audit logging functionality

All tests pass and confirm the system works as designed.