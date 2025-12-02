# Pantheon Security Guide

## Overview

This guide consolidates security best practices, vulnerability mitigation, and secure implementation patterns for Pantheon framework. It addresses critical security considerations identified in security audits and task analyses.

## Security Architecture

### Defense in Depth

Pantheon implements multiple layers of security:

```typescript
// Security Layers
interface SecurityLayers {
  inputValidation: InputValidationLayer;
  accessControl: AccessControlLayer;
  runtimeSandbox: RuntimeSandboxLayer;
  auditLogging: AuditLoggingLayer;
  encryption: EncryptionLayer;
}
```

### Zero Trust Architecture

All components operate under zero trust principles:

```typescript
// Zero Trust Validation
const validateAllInputs = <T>(
  input: unknown,
  schema: z.ZodSchema<T>,
  context: SecurityContext,
): T => {
  // 1. Schema validation
  const validated = schema.parse(input);
  
  // 2. Context-based validation
  if (!context.isValidInput(validated)) {
    throw new SecurityError('Input not allowed in current context');
  }
  
  // 3. Sanitization
  return sanitizeInput(validated);
};
```

## Input Validation and Sanitization

### Comprehensive Schema Validation

```typescript
import { z } from 'zod';

// Actor Configuration Schema
export const ActorConfigSchema = z.object({
  name: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid characters in actor name'),
  type: z.enum(['llm', 'tool', 'composite']),
  goal: z.string()
    .min(1)
    .max(500)
    .transform(val => val.trim())
    .refine(val => !val.includes('<script>'), 'Script tags not allowed'),
  config: z.record(z.unknown()).optional(),
  model: z.object({
    provider: z.string().min(1),
    name: z.string().min(1),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().positive().optional(),
  }).optional(),
  permissions: z.array(z.string()).optional(),
  runtime: z.enum(['local', 'cloud']).optional(),
});

// Tool Execution Schema
export const ToolExecutionSchema = z.object({
  toolName: z.string().min(1),
  args: z.record(z.unknown()).refine(
    (args) => {
      // Prevent prototype pollution
      const argsStr = JSON.stringify(args);
      return !argsStr.includes('__proto__') && 
             !argsStr.includes('constructor') && 
             !argsStr.includes('prototype');
    },
    { message: 'Prototype pollution detected' }
  ),
});

// Context Source Schema
export const ContextSourceSchema = z.object({
  id: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid source ID format'),
  label: z.string().min(1).max(100),
  where: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});
```

### Safe JSON Parsing

```typescript
export const safeJsonParse = <T>(
  input: string,
  schema: z.ZodSchema<T>,
  options: { maxSize?: number; allowedKeys?: string[] } = {}
): T => {
  const { maxSize = 1024 * 1024, allowedKeys } = options;

  // Size validation
  if (input.length > maxSize) {
    throw new ValidationError('Input too large');
  }

  try {
    const parsed = JSON.parse(input);
    
    // Key filtering if specified
    if (allowedKeys) {
      const filtered: any = {};
      for (const key of allowedKeys) {
        if (key in parsed) {
          filtered[key] = parsed[key];
        }
      }
      return schema.parse(filtered);
    }

    return schema.parse(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON format');
    }
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw new ValidationError('Input validation failed');
  }
};
```

### Input Sanitization

```typescript
// String Sanitization
export const sanitizeString = (
  input: string,
  options: {
    maxLength?: number;
    allowHTML?: boolean;
    allowJS?: boolean;
  } = {}
): string => {
  const { maxLength = 1000, allowHTML = false, allowJS = false } = options;

  let sanitized = input
    .slice(0, maxLength)
    .trim();

  if (!allowHTML) {
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '');
  }

  if (!allowJS) {
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '');
  }

  return sanitized;
};

// File Path Sanitization
export const sanitizeFilePath = (path: string): string => {
  // Prevent path traversal
  const normalized = path
    .replace(/\.\./g, '')
    .replace(/^\//, '')
    .replace(/\/+/g, '/');

  // Validate path components
  const components = normalized.split('/');
  for (const component of components) {
    if (component === '..' || component === '.') {
      throw new SecurityError('Invalid path component');
    }
  }

  return normalized;
};

// Command Argument Sanitization
export const sanitizeCommandArgs = (args: string[]): string[] => {
  return args.map(arg => {
    // Remove dangerous characters
    return arg
      .replace(/[;&|`$(){}[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }).filter(arg => arg.length > 0);
};
```

## Access Control

### Role-Based Access Control (RBAC)

```typescript
// Permission System
interface Permission {
  resource: string;
  action: string;
  conditions?: string[];
}

interface Role {
  name: string;
  permissions: Permission[];
  inherits?: string[];
}

// RBAC Implementation
class RBAC {
  private roles = new Map<string, Role>();
  private userRoles = new Map<string, string[]>();

  constructor(roles: Role[]) {
    roles.forEach(role => this.roles.set(role.name, role));
  }

  assignRoles(userId: string, roleNames: string[]): void {
    this.userRoles.set(userId, roleNames);
  }

  hasPermission(userId: string, resource: string, action: string): boolean {
    const userRoleNames = this.userRoles.get(userId) || [];
    
    for (const roleName of userRoleNames) {
      const role = this.roles.get(roleName);
      if (!role) continue;

      // Check direct permissions
      if (this.checkRolePermissions(role, resource, action)) {
        return true;
      }

      // Check inherited permissions
      if (role.inherits) {
        for (const inheritedRoleName of role.inherits) {
          const inheritedRole = this.roles.get(inheritedRoleName);
          if (inheritedRole && this.checkRolePermissions(inheritedRole, resource, action)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private checkRolePermissions(role: Role, resource: string, action: string): boolean {
    return role.permissions.some(permission => {
      const resourceMatch = this.matchPattern(permission.resource, resource);
      const actionMatch = this.matchPattern(permission.action, action);
      
      if (!resourceMatch || !actionMatch) return false;

      // Check conditions
      if (permission.conditions) {
        return this.evaluateConditions(permission.conditions);
      }

      return true;
    });
  }

  private matchPattern(pattern: string, value: string): boolean {
    // Simple glob pattern matching
    const regex = new RegExp(
      pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
    );
    return regex.test(value);
  }

  private evaluateConditions(conditions: string[]): boolean {
    // Implement condition evaluation logic
    // This could check time-based conditions, IP restrictions, etc.
    return true;
  }
}
```

### Resource Access Control

```typescript
// Resource Access Control
interface ResourceAccessControl {
  canRead(userId: string, resource: string): boolean;
  canWrite(userId: string, resource: string): boolean;
  canExecute(userId: string, resource: string): boolean;
}

class SecureResourceAccess implements ResourceAccessControl {
  constructor(
    private rbac: RBAC,
    private resourceOwnership: Map<string, string>
  ) {}

  canRead(userId: string, resource: string): boolean {
    // Check ownership
    const owner = this.resourceOwnership.get(resource);
    if (owner === userId) return true;

    // Check permissions
    return this.rbac.hasPermission(userId, resource, 'read');
  }

  canWrite(userId: string, resource: string): boolean {
    const owner = this.resourceOwnership.get(resource);
    if (owner === userId) return true;

    return this.rbac.hasPermission(userId, resource, 'write');
  }

  canExecute(userId: string, resource: string): boolean {
    const owner = this.resourceOwnership.get(resource);
    if (owner === userId) return true;

    return this.rbac.hasPermission(userId, resource, 'execute');
  }
}
```

## Runtime Security

### Sandboxing

```typescript
// Actor Sandbox
interface SandboxConfig {
  allowNetwork: boolean;
  allowedDomains: string[];
  maxMemory: number;
  maxCPUTime: number;
  allowedPaths: string[];
  blockedCommands: string[];
}

class ActorSandbox {
  constructor(private config: SandboxConfig) {}

  async executeActor(
    actor: Actor,
    input: any,
    userId: string
  ): Promise<any> {
    // Create isolated environment
    const sandbox = await this.createSandbox();

    try {
      // Set resource limits
      await sandbox.setMemoryLimit(this.config.maxMemory);
      await sandbox.setCPUTimeLimit(this.config.maxCPUTime);

      // Configure network access
      if (!this.config.allowNetwork) {
        await sandbox.blockNetwork();
      } else {
        await sandbox.allowDomains(this.config.allowedDomains);
      }

      // Configure file system access
      await sandbox.restrictPaths(this.config.allowedPaths);

      // Execute actor in sandbox
      const result = await sandbox.run(actor, input);

      return result;
    } finally {
      await sandbox.cleanup();
    }
  }

  private async createSandbox(): Promise<Sandbox> {
    // Implementation depends on platform
    // Could use Docker, VM, or process isolation
    return new ProcessSandbox(this.config);
  }
}
```

### Tool Execution Security

```typescript
// Secure Tool Execution
class SecureToolExecutor {
  constructor(
    private rbac: RBAC,
    private sandbox: ActorSandbox
  ) {}

  async executeTool(
    toolName: string,
    args: any,
    userId: string
  ): Promise<any> {
    // Validate tool name
    if (!this.isValidToolName(toolName)) {
      throw new SecurityError(`Invalid tool: ${toolName}`);
    }

    // Check permissions
    if (!this.rbac.hasPermission(userId, `tool:${toolName}`, 'execute')) {
      throw new SecurityError(`No permission to execute tool: ${toolName}`);
    }

    // Validate arguments
    const validatedArgs = this.validateToolArguments(toolName, args);

    // Execute in sandbox
    const tool = this.getTool(toolName);
    return await this.sandbox.executeTool(tool, validatedArgs);
  }

  private isValidToolName(toolName: string): boolean {
    // Check against allow-list
    const allowedTools = [
      'file-read', 'file-write', 'test-runner',
      'linter', 'formatter', 'git-commands'
    ];
    return allowedTools.includes(toolName);
  }

  private validateToolArguments(toolName: string, args: any): any {
    const schema = this.getToolSchema(toolName);
    return schema.parse(args);
  }
}
```

## Authentication and Authorization

### JWT-Based Authentication

```typescript
import jwt from 'jsonwebtoken';

interface JWTClaims {
  userId: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

class JWTAuthenticator {
  constructor(private secretKey: string, private algorithm: string = 'HS256') {}

  generateToken(claims: Omit<JWTClaims, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const fullClaims: JWTClaims = {
      ...claims,
      iat: now,
      exp: now + (24 * 60 * 60), // 24 hours
    };

    return jwt.sign(fullClaims, this.secretKey, { algorithm: this.algorithm });
  }

  verifyToken(token: string): JWTClaims {
    try {
      const decoded = jwt.verify(token, this.secretKey, { 
        algorithms: [this.algorithm] 
      }) as JWTClaims;

      return decoded;
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }

  refreshToken(token: string): string {
    const claims = this.verifyToken(token);
    
    // Remove old timestamps
    const { iat, exp, ...refreshClaims } = claims;
    
    return this.generateToken(refreshClaims);
  }
}
```

### API Key Security

```typescript
// API Key Management
class APIKeyManager {
  private keys = new Map<string, APIKey>();

  constructor() {
    this.initializeKeys();
  }

  private async initializeKeys(): Promise<void> {
    // Load keys from secure storage
    const storedKeys = await this.loadKeysFromStorage();
    
    for (const keyData of storedKeys) {
      this.keys.set(keyData.keyId, {
        ...keyData,
        lastUsed: null,
        usageCount: 0,
      });
    }
  }

  validateKey(keyId: string, keySecret: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) return false;

    // Check if key is expired
    if (key.expiresAt && Date.now() > key.expiresAt) {
      this.keys.delete(keyId);
      return false;
    }

    // Verify secret
    const isValid = this.verifySecret(keySecret, key.hashedSecret);
    if (!isValid) return false;

    // Update usage
    key.lastUsed = Date.now();
    key.usageCount++;

    return true;
  }

  createKey(permissions: string[], expiresAt?: number): APIKey {
    const keyId = this.generateKeyId();
    const keySecret = this.generateKeySecret();
    const hashedSecret = this.hashSecret(keySecret);

    const apiKey: APIKey = {
      keyId,
      hashedSecret,
      permissions,
      createdAt: Date.now(),
      expiresAt,
      lastUsed: null,
      usageCount: 0,
    };

    this.keys.set(keyId, apiKey);
    
    // Store securely
    this.storeKeySecurely(apiKey);

    return { keyId, keySecret };
  }

  private generateKeyId(): string {
    return `pk_${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateKeySecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashSecret(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  private verifySecret(secret: string, hashedSecret: string): boolean {
    const hash = this.hashSecret(secret);
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(hashedSecret)
    );
  }
}
```

## Data Protection

### Encryption at Rest

```typescript
import crypto from 'crypto';

class EncryptionService {
  constructor(private key: Buffer) {}

  encrypt(data: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.key);
    
    cipher.setAAD(Buffer.from('pantheon-data'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm',
    };
  }

  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipher(
      'aes-256-gcm',
      this.key
    );
    
    decipher.setAAD(Buffer.from('pantheon-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(
      encryptedData.encrypted,
      'hex',
      'utf8'
    );
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Secure Configuration

```typescript
// Secure Configuration Management
class SecureConfig {
  private config = new Map<string, any>();

  constructor() {
    this.loadSecureConfig();
  }

  private async loadSecureConfig(): Promise<void> {
    // Load from environment variables
    this.loadFromEnv();
    
    // Load from encrypted config file
    await this.loadFromEncryptedFile();
    
    // Validate required settings
    this.validateRequiredConfig();
  }

  private loadFromEnv(): void {
    const envVars = [
      'PANTHEON_SECRET_KEY',
      'PANTHEON_DB_URL',
      'PANTHEON_ENCRYPTION_KEY',
    ];

    for (const varName of envVars) {
      const value = process.env[varName];
      if (value) {
        this.config.set(varName, value);
        // Remove from process.env for security
        delete process.env[varName];
      }
    }
  }

  private async loadFromEncryptedFile(): Promise<void> {
    const configPath = process.env.PANTHEON_CONFIG_FILE;
    if (!configPath) return;

    try {
      const encryptedData = await fs.readFile(configPath);
      const encryptionKey = this.getEncryptionKey();
      
      const decrypted = this.decryptConfig(encryptedData, encryptionKey);
      const config = JSON.parse(decrypted);
      
      for (const [key, value] of Object.entries(config)) {
        this.config.set(key, value);
      }
    } catch (error) {
      console.error('Failed to load encrypted config:', error);
    }
  }

  private validateRequiredConfig(): void {
    const required = ['PANTHEON_SECRET_KEY', 'PANTHEON_DB_URL'];
    
    for (const key of required) {
      if (!this.config.has(key)) {
        throw new Error(`Required configuration missing: ${key}`);
      }
    }
  }

  get(key: string): any {
    return this.config.get(key);
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }
}
```

## Audit and Monitoring

### Security Event Logging

```typescript
// Security Audit Logger
interface SecurityEvent {
  timestamp: number;
  type: 'authentication' | 'authorization' | 'validation' | 'execution';
  userId?: string;
  resource?: string;
  action?: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityAuditLogger {
  private events: SecurityEvent[] = [];

  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    // Log to external system
    this.logToExternalSystem(fullEvent);

    // Check for critical events
    if (fullEvent.severity === 'critical') {
      this.alertCriticalEvent(fullEvent);
    }
  }

  logAuthenticationAttempt(
    userId: string,
    success: boolean,
    details?: any
  ): void {
    this.logEvent({
      type: 'authentication',
      userId,
      action: success ? 'login_success' : 'login_failure',
      details,
      severity: success ? 'low' : 'medium',
    });
  }

  logAuthorizationFailure(
    userId: string,
    resource: string,
    action: string,
    details?: any
  ): void {
    this.logEvent({
      type: 'authorization',
      userId,
      resource,
      action,
      details,
      severity: 'high',
    });
  }

  logValidationFailure(
    input: any,
    schema: string,
    details?: any
  ): void {
    this.logEvent({
      type: 'validation',
      action: 'schema_validation_failure',
      details: { input, schema, ...details },
      severity: 'medium',
    });
  }

  private logToExternalSystem(event: SecurityEvent): void {
    // Send to SIEM, logging system, etc.
    console.log('SECURITY EVENT:', JSON.stringify(event));
  }

  private alertCriticalEvent(event: SecurityEvent): void {
    // Send alerts to security team
    console.error('CRITICAL SECURITY EVENT:', JSON.stringify(event));
    
    // Could integrate with alerting systems
    // this.sendAlert(event);
  }
}
```

### Intrusion Detection

```typescript
// Intrusion Detection System
class IntrusionDetection {
  private suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /__proto__/i,  // Prototype pollution
  ];

  private rateLimiter = new Map<string, number[]>();

  detectSuspiciousActivity(
    userId: string,
    input: string,
    context: string
  ): SecurityEvent[] {
    const events: SecurityEvent[] = [];

    // Pattern detection
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(input)) {
        events.push({
          timestamp: Date.now(),
          type: 'validation',
          userId,
          action: 'suspicious_pattern_detected',
          details: { pattern: pattern.source, input, context },
          severity: 'high',
        });
      }
    }

    // Rate limiting detection
    const userRequests = this.rateLimiter.get(userId) || [];
    const now = Date.now();
    const recentRequests = userRequests.filter(time => now - time < 60000); // 1 minute

    if (recentRequests.length > 100) { // 100 requests per minute
      events.push({
        timestamp: now,
        type: 'execution',
        userId,
        action: 'rate_limit_exceeded',
        details: { requestCount: recentRequests.length },
        severity: 'medium',
      });
    }

    this.rateLimiter.set(userId, [...recentRequests, now]);

    return events;
  }
}
```

## Security Testing

### Security Test Suite

```typescript
// Security Testing Framework
class SecurityTester {
  constructor(
    private app: PantheonApp,
    private auditLogger: SecurityAuditLogger
  ) {}

  async runSecurityTests(): Promise<TestResult[]> {
    const tests = [
      this.testInputValidation(),
      this.testAuthenticationBypass(),
      this.testAuthorizationFlaws(),
      this.testInjectionAttacks(),
      this.testRateLimiting(),
    ];

    const results = await Promise.allSettled(tests);
    
    return results.map((result, index) => ({
      testName: this.getTestName(index),
      passed: result.status === 'fulfilled',
      result: result.status === 'fulfilled' ? result.value : result.reason,
    }));
  }

  private async testInputValidation(): Promise<TestResult> {
    const maliciousInputs = [
      '{"__proto__": {"admin": true}}',
      '<script>alert("xss")</script>',
      '../../../etc/passwd',
      '"; DROP TABLE users; --',
    ];

    for (const input of maliciousInputs) {
      try {
        await this.app.processInput(input);
        return { passed: false, reason: `Malicious input accepted: ${input}` };
      } catch (error) {
        if (error instanceof ValidationError) {
          continue; // Expected behavior
        }
        return { passed: false, reason: `Unexpected error: ${error.message}` };
      }
    }

    return { passed: true };
  }

  private async testAuthenticationBypass(): Promise<TestResult> {
    // Test various bypass attempts
    const bypassAttempts = [
      { token: '', message: 'Empty token' },
      { token: 'invalid', message: 'Invalid token' },
      { token: 'Bearer malformed', message: 'Malformed token' },
    ];

    for (const attempt of bypassAttempts) {
      try {
        await this.app.authenticate(attempt.token);
        return { passed: false, reason: attempt.message };
      } catch (error) {
        if (error instanceof AuthenticationError) {
          continue; // Expected behavior
        }
        return { passed: false, reason: `Unexpected error: ${error.message}` };
      }
    }

    return { passed: true };
  }
}
```

## Security Checklist

### Development Security Checklist

- [ ] **Input Validation**
  - [ ] All external inputs validated with schemas
  - [ ] JSON parsing uses safe methods
  - [ ] File paths sanitized against traversal
  - [ ] Command arguments sanitized

- [ ] **Authentication**
  - [ ] Strong password policies enforced
  - [ ] JWT tokens properly signed and verified
  - [ ] API keys securely generated and stored
  - [ ] Session management implemented

- [ ] **Authorization**
  - [ ] RBAC system implemented
  - [ ] Resource access controls enforced
  - [ ] Principle of least privilege applied
  - [ ] Permission inheritance handled

- [ ] **Runtime Security**
  - [ ] Sandboxing for actor execution
  - [ ] Resource limits enforced
  - [ ] Network access controlled
  - [ ] Tool execution secured

- [ ] **Data Protection**
  - [ ] Encryption at rest implemented
  - [ ] Encryption in transit enforced
  - [ ] Secure configuration management
  - [ ] Sensitive data properly handled

- [ ] **Monitoring**
  - [ ] Security events logged
  - [ ] Intrusion detection implemented
  - [ ] Rate limiting enforced
  - [ ] Alerting system configured

### Deployment Security Checklist

- [ ] **Infrastructure Security**
  - [ ] Firewalls configured
  - [ ] SSL/TLS certificates valid
  - [ ] Security headers implemented
  - [ ] DDoS protection enabled

- [ ] **Application Security**
  - [ ] Dependencies scanned for vulnerabilities
  - [ ] Security headers configured
  - [ ] Error messages don't leak information
  - [ ] Debug mode disabled in production

- [ ] **Operational Security**
  - [ ] Backup encryption enabled
  - [ ] Access logs monitored
  - [ ] Security incident response plan
  - [ ] Regular security audits scheduled

## Incident Response

### Security Incident Response Plan

```typescript
// Incident Response Framework
interface SecurityIncident {
  id: string;
  type: 'breach' | 'attempt' | 'vulnerability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSystems: string[];
  timeline: IncidentEvent[];
  mitigation: string[];
  status: 'open' | 'investigating' | 'contained' | 'resolved';
}

class IncidentResponse {
  private incidents = new Map<string, SecurityIncident>();

  createIncident(
    type: SecurityIncident['type'],
    severity: SecurityIncident['severity'],
    description: string
  ): string {
    const incident: SecurityIncident = {
      id: this.generateIncidentId(),
      type,
      severity,
      description,
      affectedSystems: [],
      timeline: [{
        timestamp: Date.now(),
        event: 'incident_detected',
        details: description,
      }],
      mitigation: [],
      status: 'open',
    };

    this.incidents.set(incident.id, incident);
    this.notifyTeam(incident);

    return incident.id;
  }

  updateIncident(
    incidentId: string,
    event: string,
    details?: any
  ): void {
    const incident = this.incidents.get(incidentId);
    if (!incident) return;

    incident.timeline.push({
      timestamp: Date.now(),
      event,
      details,
    });

    this.notifyTeam(incident);
  }

  private generateIncidentId(): string {
    return `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyTeam(incident: SecurityIncident): void {
    // Send notifications to security team
    console.error('SECURITY INCIDENT:', JSON.stringify(incident));
    
    // Could integrate with paging systems, Slack, etc.
  }
}
```

## Conclusion

This security guide provides comprehensive patterns for building secure Pantheon applications. Key security principles:

1. **Validate Everything**: Never trust external inputs
2. **Principle of Least Privilege**: Grant minimal necessary permissions
3. **Defense in Depth**: Multiple security layers
4. **Zero Trust**: Verify everything, trust nothing
5. **Monitor and Respond**: Continuous security monitoring

By implementing these security patterns, you can build Pantheon applications that are resilient against common security threats while maintaining functionality and performance.