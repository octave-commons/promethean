# Security Implementation Guide

## Overview

This document provides comprehensive guidance on the security implementation for the indexer-service, focusing on the critical path traversal vulnerability fixes and ongoing security practices.

## Critical Security Fix Summary

### Vulnerability Resolved
- **Type**: Path Traversal via Array Input Bypass
- **Severity**: Critical (P0)
- **Status**: ✅ RESOLVED
- **Fix Date**: 2025-10-18

### Root Cause
Array inputs were bypassing security validation due to type checking occurring before security validation in the request handling flow.

### Solution Implemented
Moved all security validation to occur BEFORE any type checking, ensuring all input types are validated regardless of their structure.

## Security Architecture

### Validation Flow
```
1. Request Received
   ↓
2. Security Validation (ALL inputs)
   ↓
3. Type Checking (AFTER validation)
   ↓
4. Business Logic
   ↓
5. Response
```

### Key Security Principles
1. **Zero Trust**: Validate everything, trust nothing
2. **Fail Secure**: Default to deny on validation errors
3. **Defense in Depth**: Multiple validation layers
4. **Early Validation**: Validate before any processing

## Input Validation Framework

### Path Security Validation
```typescript
export function validatePathSecurity(rel: string): PathValidationResult {
  // 1. Basic property validation
  // 2. Path traversal detection
  // 3. Unicode homograph detection
  // 4. Platform-specific validation
  // 5. Normalization checks
  // 6. Glob pattern validation
}
```

### Attack Vector Coverage
| Attack Type | Detection Method | Status |
|-------------|------------------|---------|
| Path Traversal (`../`) | Path normalization | ✅ BLOCKED |
| Unicode Homograph | NFKC normalization | ✅ BLOCKED |
| URL Encoding (`%2e%2e`) | Decoding + validation | ✅ BLOCKED |
| Array Input Bypass | Validation order fix | ✅ BLOCKED |
| Command Injection | Character filtering | ✅ BLOCKED |
| Glob Pattern Attacks | Pattern matching | ✅ BLOCKED |

## Secure Coding Practices

### Request Handler Pattern
```typescript
function secureRouteHandler(request: FastifyRequest, reply: FastifyReply) {
  // 1. Extract input
  const input = request.body?.field;
  
  // 2. SECURITY VALIDATION FIRST
  const validationResult = validateInput(input);
  if (!validationResult.valid) {
    handleSecureError(reply, new Error(validationResult.error), 400);
    return;
  }
  
  // 3. Type checking AFTER validation
  if (Array.isArray(input)) {
    handleSecureError(reply, new Error('Array input not supported'), 400);
    return;
  }
  
  // 4. Safe business logic
  const result = await processSecurely(input as string);
  reply.send(result);
}
```

### Error Handling
```typescript
function handleSecureError(reply: FastifyReply, error: Error, statusCode: number = 500): void {
  // Log full error for debugging
  reply.log.error({ err: error }, 'Operation failed');
  
  // Send generic error to client
  const message = genericErrorMessages[statusCode] || 'Internal server error';
  reply.code(statusCode).send({
    ok: false,
    error: message,
    ...(reply.request.id && { requestId: reply.request.id }),
  });
}
```

## Testing Strategy

### Security Test Categories
1. **Integration Tests**: End-to-end security validation
2. **Unit Tests**: Individual validation functions
3. **Penetration Tests**: Real attack scenarios
4. **Regression Tests**: Ensure no new vulnerabilities

### Critical Test Cases
```typescript
// Array input bypass prevention
const maliciousArrays = [
  { path: ['../../../etc/passwd'] },
  { path: ['%2e%2e/secret', 'config.json'] },
  { path: ['<script>alert(1)</script>', 'docs.md'] },
];

// Unicode homograph attacks
const unicodeAttacks = [
  '‥/etc/passwd',     // Unicode two-dot leader
  '﹒﹒/etc/passwd',   // Unicode small full stop
  '．．/etc/passwd',   // Unicode fullwidth full stop
];

// Path traversal variations
const traversalAttacks = [
  '../../../etc/passwd',
  '%2e%2e%2fetc%2fpasswd',
  '..%2f..%2f..%2fetc%2fpasswd',
];
```

## Monitoring and Alerting

### Security Events to Monitor
1. **Validation Failures**: All rejected inputs
2. **Attack Patterns**: Repeated malicious attempts
3. **Anomalous Behavior**: Unusual request patterns
4. **Performance Impact**: Validation overhead

### Alert Thresholds
- **Critical**: >10 validation failures/minute
- **Warning**: >5 validation failures/minute  
- **Info**: Single validation failure from new IP

## Incident Response

### Security Incident Procedure
1. **Detection**: Automated monitoring alerts
2. **Assessment**: Security team evaluation
3. **Containment**: Block malicious IPs/requests
4. **Analysis**: Root cause investigation
5. **Remediation**: Patch deployment
6. **Recovery**: Service restoration
7. **Post-mortem**: Lessons learned

### Emergency Contacts
- **Security Lead**: [Contact Information]
- **DevOps Lead**: [Contact Information]
- **Incident Commander**: [Contact Information]

## Deployment Guidelines

### Pre-Deployment Checklist
- [ ] Security tests passing (100%)
- [ ] Code review completed
- [ ] Vulnerability scan clean
- [ ] Performance impact assessed
- [ ] Rollback plan prepared

### Post-Deployment Verification
- [ ] Health checks passing
- [ ] Security monitoring active
- [ ] Error rates within baseline
- [ ] Performance metrics normal
- [ ] No new security events

## Maintenance

### Regular Security Tasks
1. **Weekly**: Review security logs
2. **Monthly**: Update attack patterns
3. **Quarterly**: Security audit
4. **Annually**: Penetration testing

### Dependency Management
- Keep security dependencies updated
- Monitor CVE databases
- Apply security patches promptly
- Test dependency updates thoroughly

## Compliance

### Security Standards
- **OWASP Top 10**: Addressed
- **CWE-22**: Path traversal resolved
- **CWE-20**: Input validation implemented
- **CWE-78**: OS command injection prevented

### Documentation Requirements
- Security architecture documented
- Incident procedures maintained
- Compliance evidence retained
- Training materials updated

## Future Enhancements

### Planned Security Improvements
1. **Machine Learning**: Anomaly detection
2. **Rate Limiting**: DoS protection
3. **Authentication**: Access control
4. **Audit Logging**: Comprehensive tracking

### Research Areas
- Zero-trust architecture
- Homomorphic encryption
- Quantum-resistant cryptography
- Advanced threat detection

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-18  
**Next Review**: 2025-11-18  
**Owner**: Security Team