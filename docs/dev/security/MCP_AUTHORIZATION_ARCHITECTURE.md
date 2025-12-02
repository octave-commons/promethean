# MCP Authorization Architecture Design

## Executive Summary

This document outlines the comprehensive authorization architecture for securing all MCP (Model Context Protocol) tools in the Promethean framework. The design extends the existing basic role-based access control to provide granular, scalable security for 45+ production tools across multiple endpoints.

## Current State Analysis

### Existing Implementation

- **Location**: `/packages/omni/omni-service/src/adapters/mcp.ts`
- **Current Coverage**: Only 6 demo tools (echo, get_time, get_user_info, list_files, read_file, ping)
- **Security Features**: Basic RBAC, path validation, rate limiting, audit logging
- **Gap**: No coverage for 45+ real production tools

### Production Tools Requiring Authorization

Based on `promethean.mcp.json`, the system must secure:

- **GitHub Tools** (15+): PR management, code review, repository access
- **File System Tools** (6+): Directory listing, file operations, search
- **Execution Tools** (2+): Command execution, process management
- **Package Management** (4+): pnpm operations
- **Communication Tools** (2+): Discord integration
- **Development Tools** (8+): TDD, testing, coverage
- **Process Management** (6+): Task queue, process control

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Authorization Framework                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Tool Registry │  │ Permission      │  │ Security        │  │
│  │   & Discovery   │  │ Matrix          │  │ Context         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │           │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │              Authorization Middleware Layer                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │ RBAC        │  │ Tool Access │  │ Security Context        │  │  │
│  │  │ Engine      │  │ Validator   │  │ Validation              │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│           │                     │                     │           │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                 Audit & Monitoring Layer                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │ Security    │  │ Rate        │  │ Anomaly                 │  │  │
│  │  │ Audit Log   │  │ Limiting    │  │ Detection               │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Enhanced Role Definitions

#### 1.1 Role Hierarchy

```typescript
interface EnhancedRole {
  name: string;
  description: string;
  level: number; // 1-100, higher = more privileged
  permissions: ToolPermission[];
  inherits?: string[];
  conditions?: RoleCondition[];
  metadata: {
    category: 'system' | 'user' | 'service' | 'admin';
    maxSessionDuration?: number;
    ipRestrictions?: string[];
    timeRestrictions?: TimeRestriction[];
  };
}
```

#### 1.2 Tool Categories & Risk Levels

```typescript
enum ToolCategory {
  READ_ONLY = 'read_only', // Safe operations (get_time, echo)
  FILE_READ = 'file_read', // File system reads
  FILE_WRITE = 'file_write', // File system writes
  CODE_EXECUTION = 'code_execution', // Command execution
  EXTERNAL_API = 'external_api', // GitHub, Discord
  SYSTEM_ADMIN = 'system_admin', // Process management
  DESTRUCTIVE = 'destructive', // Delete, overwrite operations
}

enum RiskLevel {
  LOW = 1, // Information gathering
  MEDIUM = 2, // Local file operations
  HIGH = 3, // External API calls
  CRITICAL = 4, // System modification
}
```

#### 1.3 Enhanced Permission Structure

```typescript
interface ToolPermission {
  toolName: string;
  category: ToolCategory;
  riskLevel: RiskLevel;
  actions: PermissionAction[];
  conditions?: PermissionCondition[];
  rateLimit?: RateLimitConfig;
  auditLevel: AuditLevel;
}

interface PermissionCondition {
  type: 'time' | 'ip' | 'resource' | 'context';
  operator: 'equals' | 'contains' | 'regex' | 'in';
  value: any;
  required: boolean;
}
```

### 2. Tool Registry & Discovery

#### 2.1 Tool Registration System

```typescript
interface ToolDefinition {
  name: string;
  category: ToolCategory;
  riskLevel: RiskLevel;
  description: string;
  inputSchema: any;
  endpoint: string;
  requiresAuth: boolean;
  defaultPermissions: string[];
  securityContext: {
    requiresFileAccess?: boolean;
    requiresNetworkAccess?: boolean;
    requiresElevatedPrivileges?: boolean;
    destructiveOperations?: string[];
  };
  rateLimiting: {
    default: RateLimitConfig;
    perRole?: Record<string, RateLimitConfig>;
  };
  auditConfig: {
    logLevel: AuditLevel;
    sensitiveParams: string[];
    sanitizeResponse: boolean;
  };
}
```

#### 2.2 Dynamic Tool Discovery

- Auto-discover tools from `promethean.mcp.json`
- Categorize tools based on naming patterns and functionality
- Assign risk levels automatically with manual override capability
- Generate permission matrices automatically

### 3. Authorization Middleware Architecture

#### 3.1 Multi-Layer Authorization

```typescript
class MCPAuthorizationMiddleware {
  private toolRegistry: ToolRegistry;
  private rbacEngine: EnhancedRBACEngine;
  private securityContextValidator: SecurityContextValidator;
  private auditLogger: SecurityAuditLogger;

  async authorizeToolAccess(
    request: FastifyRequest,
    toolName: string,
    args: any,
  ): Promise<AuthorizationResult> {
    // Layer 1: Authentication Check
    const authResult = await this.validateAuthentication(request);
    if (!authResult.valid) return authResult;

    // Layer 2: Basic RBAC Check
    const rbacResult = await this.rbacEngine.checkToolAccess(request.user, toolName);
    if (!rbacResult.granted) return rbacResult;

    // Layer 3: Tool-Specific Validation
    const toolDef = this.toolRegistry.getTool(toolName);
    const contextResult = await this.securityContextValidator.validate(request.user, toolDef, args);
    if (!contextResult.valid) return contextResult;

    // Layer 4: Dynamic Condition Evaluation
    const conditionResult = await this.evaluateConditions(request.user, toolDef, args, request);
    if (!conditionResult.valid) return conditionResult;

    return { valid: true, granted: true };
  }
}
```

#### 3.2 Security Context Validation

```typescript
class SecurityContextValidator {
  async validate(user: UserContext, tool: ToolDefinition, args: any): Promise<ValidationResult> {
    // File path security validation
    if (tool.securityContext.requiresFileAccess) {
      const pathValidation = this.validateFilePaths(args);
      if (!pathValidation.valid) return pathValidation;
    }

    // Network access validation
    if (tool.securityContext.requiresNetworkAccess) {
      const networkValidation = this.validateNetworkAccess(args);
      if (!networkValidation.valid) return networkValidation;
    }

    // Destructive operation validation
    if (tool.securityContext.destructiveOperations?.length) {
      const destructiveValidation = this.validateDestructiveOps(user, tool, args);
      if (!destructiveValidation.valid) return destructiveValidation;
    }

    return { valid: true };
  }
}
```

### 4. Comprehensive Audit Logging

#### 4.1 Enhanced Audit Log Structure

```typescript
interface SecurityAuditLog {
  timestamp: Date;
  eventId: string; // UUID for correlation
  userId: string;
  sessionId: string;
  toolName: string;
  category: ToolCategory;
  riskLevel: RiskLevel;
  action: 'access_requested' | 'access_granted' | 'access_denied' | 'executed' | 'failed';
  result: 'success' | 'denied' | 'error' | 'blocked';
  reason?: string;
  context: {
    ipAddress: string;
    userAgent: string;
    requestId: string;
    endpoint: string;
  };
  details: {
    arguments?: any; // Sanitized
    permissionsChecked: string[];
    conditionsEvaluated: ConditionResult[];
    rateLimitStatus?: RateLimitStatus;
    securityViolations?: SecurityViolation[];
  };
  metadata: {
    duration?: number;
    resourceImpact?: ResourceImpact;
    correlationId?: string;
  };
}
```

#### 4.2 Real-time Monitoring & Alerting

```typescript
class SecurityMonitor {
  async detectAnomalies(logEntry: SecurityAuditLog): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Pattern-based detection
    if (await this.detectBruteForce(logEntry)) {
      alerts.push(this.createBruteForceAlert(logEntry));
    }

    // Privilege escalation detection
    if (await this.detectPrivilegeEscalation(logEntry)) {
      alerts.push(this.createPrivilegeEscalationAlert(logEntry));
    }

    // Unusual access patterns
    if (await this.detectUnusualPatterns(logEntry)) {
      alerts.push(this.createUnusualPatternAlert(logEntry));
    }

    return alerts;
  }
}
```

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)

#### 1.1 Enhanced Type Definitions

- Extend existing auth types with tool-specific permissions
- Create tool categorization enums and interfaces
- Define security context validation interfaces

#### 1.2 Tool Registry Implementation

- Create `ToolRegistry` class for dynamic tool discovery
- Implement tool categorization logic
- Build permission matrix generator

#### 1.3 Enhanced RBAC Engine

- Extend existing `RBACManager` with tool-specific permissions
- Add condition evaluation engine
- Implement role hierarchy validation

### Phase 2: Authorization Middleware (Week 2-3)

#### 2.1 Multi-Layer Authorization

- Implement `MCPAuthorizationMiddleware` class
- Create security context validator
- Build condition evaluation system

#### 2.2 Integration with Existing MCP Adapter

- Extend `MCPAdapter` class with new authorization
- Maintain backward compatibility
- Add comprehensive error handling

#### 2.3 Configuration Management

- Create security policy configuration system
- Implement dynamic permission updates
- Build configuration validation

### Phase 3: Audit & Monitoring (Week 3-4)

#### 3.1 Enhanced Audit Logging

- Extend existing audit log structure
- Implement real-time log processing
- Add log aggregation and analysis

#### 3.2 Security Monitoring

- Implement anomaly detection algorithms
- Create alerting system
- Build security dashboard integration

#### 3.3 Rate Limiting Enhancement

- Extend existing rate limiting
- Add per-tool rate limits
- Implement adaptive rate limiting

### Phase 4: Testing & Validation (Week 4-5)

#### 4.1 Comprehensive Testing Suite

- Unit tests for all authorization components
- Integration tests with real MCP tools
- Security penetration testing

#### 4.2 Performance Optimization

- Optimize permission checking performance
- Implement caching strategies
- Add performance monitoring

#### 4.3 Documentation & Deployment

- Complete API documentation
- Create deployment guides
- Build monitoring dashboards

## Security Configuration Examples

### 4.1 Role Definitions

```typescript
const ENHANCED_ROLES: EnhancedRole[] = [
  {
    name: 'guest',
    description: 'Unauthenticated access',
    level: 10,
    permissions: [
      {
        toolName: 'mcp.help',
        category: ToolCategory.READ_ONLY,
        riskLevel: RiskLevel.LOW,
        actions: ['read'],
        auditLevel: AuditLevel.BASIC,
      },
    ],
    metadata: {
      category: 'user',
      maxSessionDuration: 3600,
    },
  },
  {
    name: 'developer',
    description: 'Development access',
    level: 50,
    permissions: [
      {
        toolName: 'files.*',
        category: ToolCategory.FILE_READ,
        riskLevel: RiskLevel.MEDIUM,
        actions: ['read'],
        conditions: [
          {
            type: 'resource',
            operator: 'regex',
            value: '^/home/err/devel/promethean/.*',
            required: true,
          },
        ],
      },
      {
        toolName: 'github.request',
        category: ToolCategory.EXTERNAL_API,
        riskLevel: RiskLevel.HIGH,
        actions: ['read'],
        rateLimit: { requests: 100, window: 3600 },
      },
    ],
    metadata: {
      category: 'user',
      ipRestrictions: ['10.0.0.0/8', '192.168.0.0/16'],
    },
  },
  {
    name: 'admin',
    description: 'Full system access',
    level: 100,
    permissions: [
      {
        toolName: '*',
        category: ToolCategory.SYSTEM_ADMIN,
        riskLevel: RiskLevel.CRITICAL,
        actions: ['read', 'write', 'delete', 'admin'],
        auditLevel: AuditLevel.DETAILED,
      },
    ],
    metadata: {
      category: 'admin',
      maxSessionDuration: 7200,
    },
  },
];
```

### 4.2 Tool Security Configuration

```typescript
const TOOL_SECURITY_CONFIG: Record<string, ToolDefinition> = {
  'exec.run': {
    name: 'exec.run',
    category: ToolCategory.CODE_EXECUTION,
    riskLevel: RiskLevel.CRITICAL,
    description: 'Execute system commands',
    inputSchema: {
      /* ... */
    },
    endpoint: '/exec/run',
    requiresAuth: true,
    defaultPermissions: ['admin'],
    securityContext: {
      requiresElevatedPrivileges: true,
      destructiveOperations: ['execute', 'modify'],
    },
    rateLimiting: {
      default: { requests: 10, window: 300 },
      perRole: {
        admin: { requests: 50, window: 300 },
      },
    },
    auditConfig: {
      logLevel: AuditLevel.DETAILED,
      sensitiveParams: ['command'],
      sanitizeResponse: true,
    },
  },
  'github.pr.review.submit': {
    name: 'github.pr.review.submit',
    category: ToolCategory.EXTERNAL_API,
    riskLevel: RiskLevel.HIGH,
    description: 'Submit GitHub PR review',
    inputSchema: {
      /* ... */
    },
    endpoint: '/github/review/submit',
    requiresAuth: true,
    defaultPermissions: ['developer', 'admin'],
    securityContext: {
      requiresNetworkAccess: true,
    },
    rateLimiting: {
      default: { requests: 20, window: 3600 },
    },
    auditConfig: {
      logLevel: AuditLevel.STANDARD,
      sensitiveParams: ['githubToken'],
    },
  },
};
```

## Integration Points

### 5.1 Existing System Integration

- **Auth Manager**: Extend existing `AuthManager` with tool-specific permissions
- **RBAC Manager**: Enhance existing `RBACManager` with condition evaluation
- **MCP Adapter**: Integrate authorization middleware into existing adapter
- **Configuration**: Extend existing config system with security policies

### 5.2 External System Integration

- **Monitoring**: Integrate with existing logging infrastructure
- **Alerting**: Connect to existing notification systems
- **Metrics**: Export security metrics to monitoring systems
- **Audit**: Store audit logs in existing audit storage

## Testing Strategy

### 6.1 Security Testing

- **Authorization Bypass Attempts**: Test all possible bypass vectors
- **Privilege Escalation**: Verify no privilege escalation is possible
- **Injection Attacks**: Test for command injection and path traversal
- **Rate Limiting**: Verify rate limiting works correctly
- **Audit Logging**: Ensure all security events are logged

### 6.2 Performance Testing

- **Permission Check Performance**: Measure authorization overhead
- **Concurrent Access**: Test under high load conditions
- **Memory Usage**: Monitor memory consumption
- **Cache Efficiency**: Validate caching strategies

### 6.3 Integration Testing

- **End-to-End Flows**: Test complete authorization flows
- **Tool Integration**: Test with all 45+ MCP tools
- **Error Handling**: Verify proper error responses
- **Recovery**: Test system recovery from security violations

## Deployment Considerations

### 7.1 Gradual Rollout

1. **Phase 1**: Deploy with logging-only mode (no blocking)
2. **Phase 2**: Enable blocking for low-risk tools
3. **Phase 3**: Enable blocking for medium-risk tools
4. **Phase 4**: Enable blocking for high-risk tools
5. **Phase 5**: Full enforcement with monitoring

### 7.2 Monitoring & Alerting

- Real-time security dashboards
- Automated alerting for security violations
- Regular security audit reports
- Performance impact monitoring

### 7.3 Backup & Recovery

- Configuration backup procedures
- Rollback strategies for authorization failures
- Emergency access procedures
- Disaster recovery testing

## Conclusion

This comprehensive authorization architecture provides:

1. **Granular Control**: Fine-grained permissions for all 45+ MCP tools
2. **Scalable Design**: Extensible framework for future tools
3. **Comprehensive Security**: Multi-layer authorization with context validation
4. **Real-time Monitoring**: Complete audit trail with anomaly detection
5. **Performance Optimized**: Efficient permission checking with caching
6. **Production Ready**: Thorough testing and gradual deployment strategy

The implementation will secure the Promethean framework's MCP tools while maintaining usability and performance for legitimate users.
