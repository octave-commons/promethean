# Promethean Security Action Plan

## Critical Vulnerability Response

**🚨 CRITICAL PRIORITY - IMMEDIATE ACTION REQUIRED**

This action plan addresses the CRITICAL vulnerabilities identified in the security assessment, focusing on the highest-risk items that require immediate attention.

---

## Executive Summary

**Current Risk Level**: CRITICAL 🔴  
**Primary Threat**: Path traversal vulnerability in actively running indexer service  
**Time to Mitigation**: 24-48 hours  
**Business Impact**: Potential data breach and system compromise

---

## Phase 1: Emergency Hardening (Next 24 Hours)

### 🚨 **CRITICAL TASK 1: Indexer Service Hardening**

**Target**: `packages/file-system/indexer-client/src/path-validation.ts`  
**Current Risk**: CVSS 9.1 - Active exploitation possible  
**PM2 Process**: `opencode-indexer` (PID: 468711)

#### Immediate Fix Implementation

```typescript
// REPLACE the vulnerable validation with comprehensive framework
import { validateMcpOperation } from '@promethean/mcp/validation';

export async function secureIndexerValidation(
  rootPath: string,
  targetPath: string,
  operation: 'read' | 'write' | 'list',
): Promise<{ valid: boolean; sanitizedPath?: string; error?: string }> {
  try {
    // Use the comprehensive MCP validation framework
    const validation = await validateMcpOperation(rootPath, targetPath, {
      type: operation,
      allowedExtensions: ['.ts', '.js', '.json', '.md'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    if (!validation.valid) {
      return {
        valid: false,
        error: `Security validation failed: ${validation.error}`,
      };
    }

    return {
      valid: true,
      sanitizedPath: validation.sanitizedPath,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Validation system error: ${error.message}`,
    };
  }
}
```

#### Deployment Steps

1. **Backup current implementation**

   ```bash
   cp packages/file-system/indexer-client/src/path-validation.ts \
      packages/file-system/indexer-client/src/path-validation.ts.backup
   ```

2. **Apply comprehensive validation**

   ```bash
   # Replace the vulnerable function with secure implementation
   # (Implementation code above)
   ```

3. **Test the fix**

   ```bash
   # Test with known attack vectors
   node -e "
   const { secureIndexerValidation } = require('./dist/indexer-client/src/path-validation.js');
   secureIndexerValidation('/app', 'src/‥/etc/passwd', 'read')
     .then(console.log);
   "
   ```

4. **Restart indexer service**
   ```bash
   pm2 restart opencode-indexer
   ```

### 🛡️ **CRITICAL TASK 2: Add Security Middleware to Indexer**

**Target**: Indexer service endpoints  
**Risk**: No rate limiting or attack detection

#### Implementation

```typescript
// Add to indexer service main file
import { createSecurityMiddleware } from '@promethean/mcp/security';

const securityMiddleware = createSecurityMiddleware({
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100, // Conservative limit
  maxRequestSizeBytes: 5 * 1024 * 1024, // 5MB
  enableAuditLogging: true,
  blockSuspiciousPatterns: true,
});

// Apply to all indexer routes
app.use(securityMiddleware);
```

---

## Phase 2: Validation Standardization (Next 48 Hours)

### 🔧 **TASK 3: Create Unified Validation Package**

**Target**: All services using inconsistent validation  
**Goal**: Single source of truth for security validation

#### Package Structure

```bash
mkdir -p packages/unified-validation/src
cd packages/unified-validation
```

#### Core Implementation

```typescript
// packages/unified-validation/src/index.ts
export { validateMcpOperation } from '@promethean/mcp/validation';
export {
  validateAndNormalizePath,
  validateFileName,
  validateFileExtension,
} from '@promethean/security/path-validation';

export interface ServiceValidatorConfig {
  serviceType: 'mcp' | 'indexer' | 'files' | 'api';
  allowedBasePaths: string[];
  allowedExtensions: string[];
  maxFileSize: number;
  enableRateLimit: boolean;
}

export class UnifiedValidator {
  constructor(private config: ServiceValidatorConfig) {}

  async validatePath(path: string, operation: string = 'read') {
    // Unified validation logic combining all frameworks
    const mcpValidation = await validateMcpOperation(
      this.config.allowedBasePaths[0] || '/app',
      path,
      { type: operation },
    );

    if (!mcpValidation.valid) {
      return { valid: false, error: mcpValidation.error };
    }

    // Additional service-specific checks
    const pathValidation = validateAndNormalizePath(
      mcpValidation.sanitizedPath || path,
      this.config.allowedBasePaths,
    );

    return {
      valid: true,
      sanitizedPath: pathValidation,
    };
  }
}

export function createServiceValidator(config: ServiceValidatorConfig) {
  return new UnifiedValidator(config);
}
```

### 📊 **TASK 4: Service Migration Plan**

#### Priority Order

1. **Indexer Service** (CRITICAL) - Complete within 48 hours
2. **File Operations** (HIGH) - Complete within 1 week
3. **API Endpoints** (MEDIUM) - Complete within 2 weeks
4. **Legacy Tools** (LOW) - Complete within 1 month

#### Migration Template

```typescript
// Template for service migration
import { createServiceValidator } from '@promethean/unified-validation';

const validator = createServiceValidator({
  serviceType: 'indexer',
  allowedBasePaths: ['/app/data', '/app/cache'],
  allowedExtensions: ['.json', '.md', '.txt'],
  maxFileSize: 10 * 1024 * 1024,
  enableRateLimit: true,
});

// Replace all existing validation calls
export async function secureFileOperation(path: string, operation: string) {
  const validation = await validator.validatePath(path, operation);
  if (!validation.valid) {
    throw new Error(`Security validation failed: ${validation.error}`);
  }
  return validation.sanitizedPath;
}
```

---

## Phase 3: Monitoring & Detection (Next 72 Hours)

### 📈 **TASK 5: Security Monitoring Dashboard**

#### Real-time Metrics

```typescript
// packages/security-monitoring/src/metrics.ts
export interface SecurityMetrics {
  timestamp: Date;
  service: string;
  totalRequests: number;
  blockedRequests: number;
  validationFailures: {
    pathTraversal: number;
    injection: number;
    rateLimit: number;
    sizeLimit: number;
  };
  attackPatterns: string[];
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
}

export class SecurityMonitor {
  private metrics: SecurityMetrics[] = [];

  recordRequest(service: string, result: ValidationResult) {
    // Record security metrics
    // Detect patterns
    // Trigger alerts
  }

  getSecurityReport(timeRange: '1h' | '24h' | '7d'): SecurityReport {
    // Generate comprehensive security report
  }
}
```

#### Alert Configuration

```typescript
// Critical alerts (immediate notification)
const CRITICAL_ALERTS = {
  pathTraversalAttack: {
    threshold: 1, // Any attempt
    notification: ['email', 'slack', 'sms'],
    escalation: 'immediate',
  },
  validationFailureRate: {
    threshold: 0.1, // 10% failure rate
    notification: ['email', 'slack'],
    escalation: '5min',
  },
  unusualTrafficPattern: {
    threshold: '3x_normal',
    notification: ['slack'],
    escalation: '15min',
  },
};
```

---

## Implementation Checklist

### ✅ **24-Hour Checklist (CRITICAL)**

- [ ] **Backup current indexer validation**
- [ ] **Deploy comprehensive validation to indexer service**
- [ ] **Add security middleware to indexer endpoints**
- [ ] **Restart indexer service with new security**
- [ ] **Test with attack vectors to verify protection**
- [ ] **Enable audit logging for indexer service**
- [ ] **Set up basic monitoring alerts**

### ✅ **48-Hour Checklist (HIGH PRIORITY)**

- [ ] **Create unified validation package**
- [ ] **Migrate indexer service to unified validation**
- [ ] **Add rate limiting to all public endpoints**
- [ ] **Implement security headers across services**
- [ ] **Set up comprehensive monitoring dashboard**
- [ ] **Create incident response procedures**

### ✅ **1-Week Checklist (MEDIUM PRIORITY)**

- [ ] **Migrate file operations to unified validation**
- [ ] **Add runtime protection to MCP service**
- [ ] **Implement enhanced session management**
- [ ] **Create security testing pipeline**
- [ ] **Document security procedures**

---

## Testing & Validation

### 🧪 **Security Testing Procedures**

#### 1. Path Traversal Testing

```bash
# Test script for validation verification
#!/bin/bash
# security-test.sh

echo "Testing path traversal protection..."

# Test cases that should be BLOCKED
test_cases=(
  "src/‥/etc/passwd"           # Unicode homograph
  "src/%2e%2e%2f/etc/passwd"    # Double-encoded
  "src/....//....//etc/passwd"  # Nested traversal
  "src/..%2fetc/passwd"         # Mixed encoding
  "src/..%5cetc/passwd"         # Windows-style
)

for case in "${test_cases[@]}"; do
  echo "Testing: $case"
  curl -X POST "http://localhost:8001/search" \
    -H "Content-Type: application/json" \
    -d "{\"path\": \"$case\"}" \
    -w "Status: %{http_code}\n"
done
```

#### 2. Load Testing

```bash
# Test rate limiting
for i in {1..150}; do
  curl -X GET "http://localhost:8001/status" &
done
wait
echo "Rate limiting test completed"
```

#### 3. Integration Testing

```typescript
// packages/security-tests/src/indexer-validation.test.ts
import { secureIndexerValidation } from '@promethean/indexer-client';

describe('Indexer Security Validation', () => {
  test('should block Unicode homograph attacks', async () => {
    const result = await secureIndexerValidation('/app', 'src/‥/etc/passwd', 'read');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Security validation failed');
  });

  test('should block double-encoded attacks', async () => {
    const result = await secureIndexerValidation('/app', 'src/%252e%252e%252f/etc/passwd', 'read');
    expect(result.valid).toBe(false);
  });

  test('should allow legitimate paths', async () => {
    const result = await secureIndexerValidation('/app', 'src/components/Button.tsx', 'read');
    expect(result.valid).toBe(true);
  });
});
```

---

## Incident Response

### 🚨 **Security Incident Procedures**

#### Immediate Response (First 15 Minutes)

1. **Isolate affected service**

   ```bash
   pm2 stop opencode-indexer
   ```

2. **Preserve evidence**

   ```bash
   # Collect logs
   pm2 logs opencode-indexer --lines 1000 > incident-logs-$(date +%s).txt

   # Collect system state
   ps aux > process-list-$(date +%s).txt
   netstat -tulpn > network-connections-$(date +%s).txt
   ```

3. **Notify security team**
   - Email: security-emergency@promethean.dev
   - Slack: #security-incidents
   - Phone: [Emergency contact number]

#### Investigation (First 2 Hours)

1. **Analyze attack vectors**
2. **Determine data exposure**
3. **Identify attacker entry points**
4. **Assess system impact**

#### Recovery (Next 24 Hours)

1. **Patch vulnerabilities**
2. **Restore services with enhanced security**
3. **Monitor for continued attacks**
4. **Post-incident analysis**

---

## Success Metrics

### 📊 **Key Performance Indicators**

| Metric                   | Current | Target (24h) | Target (1w) | Target (1m) |
| ------------------------ | ------- | ------------ | ----------- | ----------- |
| Validation Coverage      | 60%     | 80%          | 95%         | 100%        |
| Blocked Attacks/hr       | 0       | 10+          | 25+         | 50+         |
| Response Time            | N/A     | <5min        | <2min       | <1min       |
| False Positive Rate      | N/A     | <5%          | <2%         | <1%         |
| Critical Vulnerabilities | 1       | 0            | 0           | 0           |

### 🎯 **Acceptance Criteria**

- ✅ Zero critical vulnerabilities in production
- ✅ 100% of public endpoints use comprehensive validation
- ✅ Real-time attack detection and blocking
- ✅ Automated incident response procedures
- ✅ Comprehensive audit trail for all security events

---

## Emergency Contacts

| Role              | Name   | Email                      | Phone    |
| ----------------- | ------ | -------------------------- | -------- |
| Security Lead     | [Name] | security@promethean.dev    | [Number] |
| DevOps Lead       | [Name] | devops@promethean.dev      | [Number] |
| Engineering Lead  | [Name] | engineering@promethean.dev | [Number] |
| Executive Sponsor | [Name] | exec@promethean.dev        | [Number] |

---

**Action Plan Status**: 🚨 ACTIVE  
**Last Updated**: October 21, 2025  
**Next Review**: October 22, 2025  
**Document Owner**: Security Team

---

_This action plan should be updated daily during the emergency response phase, then weekly during the standardization phase._
