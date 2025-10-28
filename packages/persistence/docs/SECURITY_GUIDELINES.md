# @promethean-os/persistence - Security Guidelines

## Overview

This document provides comprehensive security guidelines for the @promethean-os/persistence package, addressing security best practices, vulnerability mitigation, and secure deployment patterns based on code review findings.

## Table of Contents

-   [Security Architecture](#security-architecture)
-   [Input Validation and Sanitization](#input-validation-and-sanitization)
-   [Authentication and Authorization](#authentication-and-authorization)
-   [Data Protection](#data-protection)
-   [Network Security](#network-security)
-   [Secure Configuration](#secure-configuration)
-   [Vulnerability Management](#vulnerability-management)
-   [Security Monitoring](#security-monitoring)
-   [Compliance Requirements](#compliance-requirements)

---

## Security Architecture

### Defense in Depth

The persistence package implements a multi-layered security approach:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Network   │  │ Application │  │    Data     │  │
│  │   Security  │  │   Security  │  │ Protection  │  │
│  │             │  │             │  │             │  │
│  │ • TLS/SSL   │  │ • Input Val  │  │ • Encryption│  │
│  │ • Firewall  │  │ • AuthN/Z   │  │ • Access    │  │
│  │ • Rate Lim  │  │ • Audit Log │  │ • Backup    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Security Principles

1. **Principle of Least Privilege**: Components only have access to resources they absolutely need
2. **Zero Trust**: No implicit trust between components, all interactions authenticated
3. **Defense in Depth**: Multiple security layers prevent single point failures
4. **Secure by Default**: Security features enabled by default, opt-out rather than opt-in

---

## Input Validation and Sanitization

### Content Validation Rules

```typescript
interface SecurityValidationConfig {
    // Content size limits
    maxContentLength: number; // Default: 1MB
    maxMetadataSize: number; // Default: 100KB
    maxAttachmentSize: number; // Default: 10MB

    // Content type restrictions
    allowedContentTypes: ContentType[];
    allowedMimeTypes: string[];
    blockedFileExtensions: string[];

    // Input sanitization
    sanitizeHtml: boolean;
    stripScripts: boolean;
    validateJson: boolean;
    maxNestingDepth: number;

    // Rate limiting
    maxRequestsPerMinute: number;
    maxContentSizePerMinute: number;
}
```

### Implementation Example

```typescript
import { z } from 'zod';

// Secure content validation schema
const SecureContentSchema = z.object({
    id: z.string().max(255).regex(/^[a-zA-Z0-9_-]+$/),
    type: z.enum(['file', 'message', 'event', 'session', 'attachment', 'thought', 'document', 'task', 'board']),
    source: z.enum(['filesystem', 'discord', 'opencode', 'agent', 'user', 'system', 'external', 'kanban']),
    content: z.string().max(1000000), // 1MB limit
    metadata: z.object({
        // Strict metadata validation
        path: z.string().optional().max(1000),
        filename: z.string().optional().max(255),
        size: z.number().optional().max(10000000000), // 10GB
        mimeType: z.string().optional().max(100),
        tags: z.array(z.string().max(50)).max(100).optional(),
    }),
    timestamp: z.number().min(0).max(Date.now() + 86400000), // Not in future by more than 24h
});

// Sanitization middleware
function sanitizeInput(content: unknown): IndexableContent {
    // Remove potentially dangerous content
    const sanitized = JSON.parse(JSON.stringify(content));
    
    // Strip HTML/JS if present
    if (sanitized.content) {
        sanitized.content = sanitized.content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    }
    
    return SecureContentSchema.parse(sanitized);
}
```

### File Upload Security

```typescript
interface FileSecurityConfig {
    // Allowed file types
    allowedExtensions: string[];
    allowedMimeTypes: string[];
    blockedPatterns: RegExp[];

    // Size limits
    maxFileSize: number;
    maxTotalSize: number;

    // Scanning
    virusScanEnabled: boolean;
    contentInspectionEnabled: boolean;

    // Storage security
    encryptAtRest: boolean;
    secureDelete: boolean;
}

// Secure file processing
async function processSecureFile(file: File, config: FileSecurityConfig): Promise<SecureFileResult> {
    // 1. Extension validation
    const extension = path.extname(file.name).toLowerCase();
    if (!config.allowedExtensions.includes(extension)) {
        throw new SecurityError(`File type ${extension} not allowed`);
    }

    // 2. MIME type validation
    const mimeType = await detectMimeType(file);
    if (!config.allowedMimeTypes.includes(mimeType)) {
        throw new SecurityError(`MIME type ${mimeType} not allowed`);
    }

    // 3. Size validation
    if (file.size > config.maxFileSize) {
        throw new SecurityError(`File size exceeds limit`);
    }

    // 4. Content scanning
    if (config.virusScanEnabled) {
        const scanResult = await scanForMalware(file);
        if (!scanResult.clean) {
            throw new SecurityError('Malware detected');
        }
    }

    // 5. Content inspection
    if (config.contentInspectionEnabled) {
        const content = await file.text();
        if (containsSuspiciousPatterns(content, config.blockedPatterns)) {
            throw new SecurityError('Suspicious content detected');
        }
    }

    return {
        secure: true,
        processedFile: file,
        metadata: {
            originalName: file.name,
            size: file.size,
            mimeType,
            scanned: true,
            timestamp: Date.now(),
        },
    };
}
```

---

## Authentication and Authorization

### API Authentication

```typescript
interface AuthConfig {
    // JWT configuration
    jwtSecret: string;
    jwtExpiration: string;
    jwtRefreshExpiration: string;

    // API key configuration
    apiKeyHeader: string;
    apiKeyValidation: boolean;

    // Rate limiting
    rateLimitEnabled: boolean;
    rateLimitWindow: number; // milliseconds
    rateLimitMax: number;

    // IP restrictions
    allowedIPs: string[];
    blockedIPs: string[];
}

// Authentication middleware
async function authenticateRequest(req: Request, config: AuthConfig): Promise<AuthContext> {
    // 1. Check IP restrictions
    const clientIP = req.ip || req.connection.remoteAddress;
    if (config.allowedIPs.length > 0 && !config.allowedIPs.includes(clientIP)) {
        throw new UnauthorizedError('IP not allowed');
    }
    if (config.blockedIPs.includes(clientIP)) {
        throw new UnauthorizedError('IP blocked');
    }

    // 2. Check rate limits
    if (config.rateLimitEnabled) {
        const key = `rate_limit:${clientIP}`;
        const current = await redis.incr(key);
        if (current === 1) {
            await redis.expire(key, config.rateLimitWindow / 1000);
        }
        if (current > config.rateLimitMax) {
            throw new RateLimitError('Rate limit exceeded');
        }
    }

    // 3. Validate authentication token
    const token = req.headers[config.apiKeyHeader] as string;
    if (!token) {
        throw new UnauthorizedError('Missing authentication token');
    }

    try {
        const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;
        return {
            userId: payload.sub,
            permissions: payload.permissions,
            source: payload.source,
            timestamp: payload.iat,
        };
    } catch (error) {
        throw new UnauthorizedError('Invalid authentication token');
    }
}
```

### Authorization Model

```typescript
interface Permission {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}

interface Role {
    name: string;
    permissions: Permission[];
}

// Authorization check
async function authorizeOperation(
    authContext: AuthContext,
    resource: string,
    action: string,
    context?: any,
): Promise<boolean> {
    const userRoles = await getUserRoles(authContext.userId);
    
    for (const role of userRoles) {
        for (const permission of role.permissions) {
            if (permission.resource === resource && permission.action === action) {
                // Check conditions if present
                if (permission.conditions) {
                    const conditionsMet = await evaluateConditions(
                        permission.conditions,
                        context,
                        authContext,
                    );
                    if (conditionsMet) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Example usage in service methods
class SecureUnifiedIndexerService {
    async search(query: SearchQuery, authContext: AuthContext): Promise<SearchResponse> {
        // Authorize search operation
        const authorized = await authorizeOperation(
            authContext,
            'search',
            'execute',
            { query: query.query },
        );
        
        if (!authorized) {
            throw new ForbiddenError('Not authorized to perform search');
        }

        // Apply data filtering based on permissions
        const filteredQuery = await applyDataFilters(query, authContext);
        
        return this.performSearch(filteredQuery);
    }
}
```

---

## Data Protection

### Encryption at Rest

```typescript
interface EncryptionConfig {
    // Database encryption
    encryptDatabaseFields: boolean;
    encryptedFields: string[];
    encryptionKey: string;
    keyRotationInterval: number;

    // File encryption
    encryptFiles: boolean;
    fileEncryptionAlgorithm: string;
    fileEncryptionKey: string;

    // Vector store encryption
    encryptVectors: boolean;
    vectorEncryptionMethod: string;
}

// Field-level encryption
class FieldEncryption {
    private key: Buffer;
    private algorithm = 'aes-256-gcm';

    constructor(config: EncryptionConfig) {
        this.key = Buffer.from(config.encryptionKey, 'hex');
    }

    encryptField(data: string): EncryptedField {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, this.key);
        cipher.setAAD(Buffer.from('field-data'));
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            data: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            algorithm: this.algorithm,
        };
    }

    decryptField(encrypted: EncryptedField): string {
        const decipher = crypto.createDecipher(this.algorithm, this.key);
        decipher.setAAD(Buffer.from('field-data'));
        decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
        
        let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}
```

### Data Masking and Anonymization

```typescript
interface DataMaskingConfig {
    // PII detection
    detectPII: boolean;
    piiPatterns: RegExp[];
    
    // Masking rules
    maskEmails: boolean;
    maskPhoneNumbers: boolean;
    maskIPAddresses: boolean;
    maskNames: boolean;
    
    // Anonymization
    anonymizeUserIds: boolean;
    anonymizeIPs: boolean;
    hashSensitiveData: boolean;
}

// Data masking implementation
class DataMasker {
    constructor(private config: DataMaskingConfig) {}

    maskContent(content: string): string {
        let masked = content;

        if (this.config.maskEmails) {
            masked = masked.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 
                (match) => this.maskEmail(match));
        }

        if (this.config.maskPhoneNumbers) {
            masked = masked.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, 
                (match) => this.maskPhoneNumber(match));
        }

        if (this.config.maskIPAddresses) {
            masked = masked.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, 
                (match) => this.maskIPAddress(match));
        }

        return masked;
    }

    private maskEmail(email: string): string {
        const [username, domain] = email.split('@');
        const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
        return `${maskedUsername}@${domain}`;
    }

    private maskPhoneNumber(phone: string): string {
        return phone.replace(/\d(?=\d{4})/g, '*');
    }

    private maskIPAddress(ip: string): string {
        const parts = ip.split('.');
        return `${parts[0]}.${parts[1]}.*.*`;
    }
}
```

### Secure Backup and Recovery

```typescript
interface BackupConfig {
    // Backup schedule
    backupInterval: number; // milliseconds
    retentionPeriod: number; // milliseconds
    
    // Backup encryption
    encryptBackups: boolean;
    backupEncryptionKey: string;
    
    // Storage locations
    primaryBackupLocation: string;
    secondaryBackupLocation: string;
    
    // Verification
    verifyBackups: boolean;
    backupTestInterval: number;
}

// Secure backup implementation
class SecureBackupManager {
    constructor(private config: BackupConfig) {}

    async createBackup(): Promise<BackupResult> {
        const timestamp = Date.now();
        const backupId = `backup_${timestamp}`;
        
        try {
            // 1. Create data snapshot
            const snapshot = await this.createDataSnapshot();
            
            // 2. Compress and encrypt if configured
            const compressed = await this.compressData(snapshot);
            const encrypted = this.config.encryptBackups 
                ? await this.encryptData(compressed) 
                : compressed;
            
            // 3. Store in primary location
            await this.storeBackup(backupId, encrypted, this.config.primaryBackupLocation);
            
            // 4. Store in secondary location (replication)
            await this.storeBackup(backupId, encrypted, this.config.secondaryBackupLocation);
            
            // 5. Verify backup integrity
            if (this.config.verifyBackups) {
                const verified = await this.verifyBackup(backupId);
                if (!verified) {
                    throw new Error('Backup verification failed');
                }
            }
            
            return {
                backupId,
                timestamp,
                size: encrypted.length,
                locations: [this.config.primaryBackupLocation, this.config.secondaryBackupLocation],
                verified: true,
            };
        } catch (error) {
            // Cleanup on failure
            await this.cleanupFailedBackup(backupId);
            throw error;
        }
    }

    async restoreFromBackup(backupId: string): Promise<RestoreResult> {
        // 1. Retrieve backup from primary location
        let backupData = await this.retrieveBackup(backupId, this.config.primaryBackupLocation);
        
        // 2. Fallback to secondary if primary fails
        if (!backupData) {
            backupData = await this.retrieveBackup(backupId, this.config.secondaryBackupLocation);
        }
        
        if (!backupData) {
            throw new Error('Backup not found');
        }
        
        // 3. Decrypt if needed
        const decrypted = this.config.encryptBackups 
            ? await this.decryptData(backupData) 
            : backupData;
        
        // 4. Decompress
        const snapshot = await this.decompressData(decrypted);
        
        // 5. Restore data
        await this.restoreDataSnapshot(snapshot);
        
        return {
            backupId,
            restoredAt: Date.now(),
            success: true,
        };
    }
}
```

---

## Network Security

### TLS/SSL Configuration

```typescript
interface TLSConfig {
    // Certificate configuration
    certPath: string;
    keyPath: string;
    caPath?: string;
    
    // Protocol configuration
    minVersion: string;
    maxVersion: string;
    ciphers: string[];
    
    // HSTS
    enableHSTS: boolean;
    hstsMaxAge: number;
    includeSubdomains: boolean;
    
    // Certificate pinning
    enableCertPinning: boolean;
    pinnedCertificates: string[];
}

// Secure HTTPS server setup
function createSecureServer(config: TLSConfig): https.Server {
    const tlsOptions = {
        cert: fs.readFileSync(config.certPath),
        key: fs.readFileSync(config.keyPath),
        ca: config.caPath ? fs.readFileSync(config.caPath) : undefined,
        minVersion: config.minVersion,
        maxVersion: config.maxVersion,
        ciphers: config.ciphers.join(':'),
        honorCipherOrder: true,
        
        // Security options
        secureOptions: crypto.constants.SSL_OP_NO_SSLv3 | 
                     crypto.constants.SSL_OP_NO_TLSv1 |
                     crypto.constants.SSL_OP_NO_TLSv1_1,
    };

    const server = https.createServer(tlsOptions, app);
    
    // HSTS middleware
    if (config.enableHSTS) {
        app.use((req, res, next) => {
            const hstsHeader = `max-age=${config.hstsMaxAge}${config.includeSubdomains ? '; includeSubDomains' : ''}`;
            res.setHeader('Strict-Transport-Security', hstsHeader);
            next();
        });
    }
    
    return server;
}
```

### Network Policies

```yaml
# Kubernetes NetworkPolicy example
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: persistence-network-policy
  namespace: promethean
spec:
  podSelector:
    matchLabels:
      app: unified-indexer
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
    - from:
        - podSelector:
            matchLabels:
              app: monitoring
      ports:
        - protocol: TCP
          port: 9090
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: database
      ports:
        - protocol: TCP
          port: 27017  # MongoDB
        - protocol: TCP
          port: 8000   # ChromaDB
    - to: []
      ports:
        - protocol: TCP
          port: 443    # HTTPS for external APIs
        - protocol: TCP
          port: 53     # DNS
```

---

## Secure Configuration

### Environment Variable Security

```typescript
interface SecureConfig {
    // Database credentials
    mongodbUrl: string;
    mongodbCertPath?: string;
    
    // Vector store credentials
    chromaDbUrl: string;
    chromaDbToken?: string;
    
    // Encryption keys
    encryptionKey: string;
    jwtSecret: string;
    
    // API keys
    openaiApiKey?: string;
    embeddingApiKey?: string;
    
    // Security settings
    enableAuditLogging: boolean;
    logLevel: string;
    maxRequestSize: number;
}

// Secure configuration loading
class SecureConfigLoader {
    static load(): SecureConfig {
        const config: Partial<SecureConfig> = {};
        
        // Required fields
        const requiredFields = [
            'MONGODB_URL',
            'CHROMA_DB_URL',
            'ENCRYPTION_KEY',
            'JWT_SECRET',
        ];
        
        for (const field of requiredFields) {
            const value = process.env[field];
            if (!value) {
                throw new Error(`Required environment variable ${field} is missing`);
            }
            config[this.camelCase(field)] = value;
        }
        
        // Optional fields with defaults
        config.enableAuditLogging = process.env.ENABLE_AUDIT_LOGGING === 'true';
        config.logLevel = process.env.LOG_LEVEL || 'info';
        config.maxRequestSize = parseInt(process.env.MAX_REQUEST_SIZE || '10485760'); // 10MB
        
        // Validate encryption key strength
        if (config.encryptionKey!.length < 32) {
            throw new Error('Encryption key must be at least 32 characters');
        }
        
        return config as SecureConfig;
    }
    
    private static camelCase(str: string): string {
        return str.toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    }
}
```

### Configuration Validation

```typescript
import { z } from 'zod';

const SecurityConfigSchema = z.object({
    mongodbUrl: z.string().url(),
    chromaDbUrl: z.string().url(),
    encryptionKey: z.string().min(32),
    jwtSecret: z.string().min(32),
    enableAuditLogging: z.boolean(),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']),
    maxRequestSize: z.number().min(1024).max(104857600), // 1KB to 100MB
});

// Configuration validation middleware
function validateSecurityConfig(config: unknown): SecureConfig {
    try {
        return SecurityConfigSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            throw new Error(`Security configuration validation failed: ${details}`);
        }
        throw error;
    }
}
```

---

## Vulnerability Management

### Dependency Security Scanning

```bash
# Package.json scripts for security
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:scan": "snyk test --severity-threshold=high",
    "security:check": "pnpm run security:audit && pnpm run security:scan",
    "security:fix": "npm audit fix",
    "security:monitor": "snyk monitor"
  }
}
```

### Runtime Security Monitoring

```typescript
interface SecurityEvent {
    id: string;
    timestamp: number;
    type: SecurityEventType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    description: string;
    metadata: Record<string, any>;
    userId?: string;
    ipAddress?: string;
}

type SecurityEventType = 
    | 'authentication_failure'
    | 'authorization_failure'
    | 'suspicious_input'
    | 'rate_limit_exceeded'
    | 'unusual_access_pattern'
    | 'data_exfiltration_attempt'
    | 'privilege_escalation_attempt'
    | 'system_compromise';

// Security monitoring service
class SecurityMonitor {
    private events: SecurityEvent[] = [];
    private alertThresholds = {
        authenticationFailures: 5, // per minute
        suspiciousInputs: 10, // per minute
        rateLimitExceeded: 3, // per minute
    };

    async recordEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
        const securityEvent: SecurityEvent = {
            ...event,
            id: generateUUID(),
            timestamp: Date.now(),
        };

        this.events.push(securityEvent);
        await this.persistEvent(securityEvent);
        
        // Check for alert conditions
        await this.checkAlertConditions(securityEvent);
    }

    private async checkAlertConditions(event: SecurityEvent): Promise<void> {
        const recentEvents = this.getRecentEvents(60000); // Last minute
        
        switch (event.type) {
            case 'authentication_failure':
                if (this.countEventsByType(recentEvents, 'authentication_failure') >= this.alertThresholds.authenticationFailures) {
                    await this.triggerAlert({
                        type: 'brute_force_attack',
                        severity: 'high',
                        description: 'Multiple authentication failures detected',
                        metadata: { ipAddress: event.ipAddress },
                    });
                }
                break;
                
            case 'suspicious_input':
                if (this.countEventsByType(recentEvents, 'suspicious_input') >= this.alertThresholds.suspiciousInputs) {
                    await this.triggerAlert({
                        type: 'injection_attack',
                        severity: 'critical',
                        description: 'Multiple suspicious inputs detected',
                        metadata: { userId: event.userId },
                    });
                }
                break;
        }
    }

    private async triggerAlert(alert: SecurityAlert): Promise<void> {
        // Log alert
        console.error(`SECURITY ALERT: ${alert.description}`, alert.metadata);
        
        // Send notifications
        await this.sendSecurityNotification(alert);
        
        // Take automated response
        await this.automatedResponse(alert);
    }
}
```

---

## Security Monitoring

### Audit Logging

```typescript
interface AuditLog {
    id: string;
    timestamp: number;
    userId?: string;
    action: string;
    resource: string;
    result: 'success' | 'failure';
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

// Audit logging service
class AuditLogger {
    async log(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
        const auditEntry: AuditLog = {
            ...entry,
            id: generateUUID(),
            timestamp: Date.now(),
        };

        // Store in secure audit log
        await this.persistAuditLog(auditEntry);
        
        // Check for compliance requirements
        await this.checkCompliance(auditEntry);
    }

    // Example usage in service methods
    async logSearchOperation(
        userId: string,
        query: string,
        resultCount: number,
        ipAddress: string,
    ): Promise<void> {
        await this.log({
            userId,
            action: 'search',
            resource: 'unified_indexer',
            result: resultCount >= 0 ? 'success' : 'failure',
            details: {
                query: this.sanitizeQuery(query),
                resultCount,
            },
            ipAddress,
        });
    }

    private sanitizeQuery(query: string): string {
        // Remove sensitive information from query
        return query.replace(/password\s*=\s*['"][^'"]*['"]/gi, 'password=***');
    }
}
```

### Intrusion Detection

```typescript
interface IntrusionDetectionConfig {
    // Anomaly detection
    enableAnomalyDetection: boolean;
    anomalyThreshold: number;
    
    // Pattern detection
    enablePatternDetection: boolean;
    suspiciousPatterns: RegExp[];
    
    // Behavioral analysis
    enableBehavioralAnalysis: boolean;
    baselinePeriod: number; // milliseconds
}

// Intrusion detection system
class IntrusionDetectionSystem {
    constructor(private config: IntrusionDetectionConfig) {}

    async analyzeRequest(request: Request, context: AuthContext): Promise<SecurityAnalysis> {
        const analysis: SecurityAnalysis = {
            riskScore: 0,
            indicators: [],
            recommendations: [],
        };

        // 1. Anomaly detection
        if (this.config.enableAnomalyDetection) {
            const anomalyScore = await this.detectAnomalies(request, context);
            if (anomalyScore > this.config.anomalyThreshold) {
                analysis.riskScore += anomalyScore;
                analysis.indicators.push('anomalous_behavior');
            }
        }

        // 2. Pattern detection
        if (this.config.enablePatternDetection) {
            const patternMatches = this.detectSuspiciousPatterns(request);
            if (patternMatches.length > 0) {
                analysis.riskScore += patternMatches.length * 10;
                analysis.indicators.push(...patternMatches);
            }
        }

        // 3. Behavioral analysis
        if (this.config.enableBehavioralAnalysis) {
            const behaviorScore = await this.analyzeBehavior(request, context);
            if (behaviorScore > 0) {
                analysis.riskScore += behaviorScore;
                analysis.indicators.push('unusual_behavior');
            }
        }

        // Generate recommendations
        if (analysis.riskScore > 50) {
            analysis.recommendations.push('Block request and investigate');
        } else if (analysis.riskScore > 20) {
            analysis.recommendations.push('Require additional authentication');
        }

        return analysis;
    }

    private detectSuspiciousPatterns(request: Request): string[] {
        const patterns = [
            { regex: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, type: 'xss_attempt' },
            { regex: /union\s+select/gi, type: 'sql_injection_attempt' },
            { regex: /\.\.\//g, type: 'path_traversal_attempt' },
            { regex: /cmd\.exe|powershell|bash/gi, type: 'command_injection_attempt' },
        ];

        const matches: string[] = [];
        const requestBody = JSON.stringify(request.body);

        for (const pattern of patterns) {
            if (pattern.regex.test(requestBody)) {
                matches.push(pattern.type);
            }
        }

        return matches;
    }
}
```

---

## Compliance Requirements

### GDPR Compliance

```typescript
interface GDPRConfig {
    // Data subject rights
    enableDataPortability: boolean;
    enableRightToErasure: boolean;
    enableRightToRectification: boolean;
    
    // Data protection
    dataMinimization: boolean;
    purposeLimitation: boolean;
    storageLimitation: boolean;
    
    // Consent management
    requireExplicitConsent: boolean;
    consentExpiration: number; // milliseconds
}

// GDPR compliance implementation
class GDPRComplianceManager {
    constructor(private config: GDPRConfig) {}

    async handleDataSubjectRequest(
        userId: string,
        requestType: 'portability' | 'erasure' | 'rectification',
        context?: any,
    ): Promise<ComplianceResponse> {
        switch (requestType) {
            case 'portability':
                return this.exportUserData(userId);
                
            case 'erasure':
                return this.deleteUserData(userId);
                
            case 'rectification':
                return this.rectifyUserData(userId, context);
                
            default:
                throw new Error(`Unsupported request type: ${requestType}`);
        }
    }

    private async exportUserData(userId: string): Promise<ComplianceResponse> {
        // Collect all user data
        const userData = await this.collectUserData(userId);
        
        // Apply data minimization
        const minimizedData = this.applyDataMinimization(userData);
        
        // Export in machine-readable format
        const exportData = {
            userId,
            exportDate: new Date().toISOString(),
            data: minimizedData,
            format: 'json',
        };

        return {
            success: true,
            data: exportData,
            message: 'Data export completed successfully',
        };
    }

    private async deleteUserData(userId: string): Promise<ComplianceResponse> {
        // Soft delete first
        await this.softDeleteUserData(userId);
        
        // Schedule hard delete after retention period
        await this.scheduleHardDelete(userId);
        
        // Log deletion for audit purposes
        await this.logDataDeletion(userId);

        return {
            success: true,
            message: 'Data deletion initiated successfully',
        };
    }
}
```

### SOC 2 Type II Compliance

```typescript
interface SOC2Config {
    // Security controls
    enableAccessControls: boolean;
    enableEncryption: boolean;
    enableAuditLogging: boolean;
    
    // Availability controls
    enableBackup: boolean;
    enableMonitoring: boolean;
    enableDisasterRecovery: boolean;
    
    // Processing integrity
    enableDataValidation: boolean;
    enableChangeManagement: boolean;
    enableErrorHandling: boolean;
    
    // Confidentiality
    enableDataClassification: boolean;
    enableNetworkSecurity: boolean;
    enableEndpointSecurity: boolean;
    
    // Privacy
    enablePrivacyControls: boolean;
    enableConsentManagement: boolean;
    enableDataMinimization: boolean;
}

// SOC 2 compliance monitoring
class SOC2ComplianceMonitor {
    constructor(private config: SOC2Config) {}

    async generateComplianceReport(): Promise<ComplianceReport> {
        const report: ComplianceReport = {
            timestamp: new Date().toISOString(),
            controls: {},
            overallStatus: 'compliant',
        };

        // Check security controls
        if (this.config.enableAccessControls) {
            report.controls.accessControls = await this.checkAccessControls();
        }

        if (this.config.enableEncryption) {
            report.controls.encryption = await this.checkEncryptionControls();
        }

        if (this.config.enableAuditLogging) {
            report.controls.auditLogging = await this.checkAuditLogging();
        }

        // Check availability controls
        if (this.config.enableBackup) {
            report.controls.backup = await this.checkBackupControls();
        }

        if (this.config.enableMonitoring) {
            report.controls.monitoring = await this.checkMonitoringControls();
        }

        // Determine overall status
        const failedControls = Object.values(report.controls).filter(control => control.status !== 'compliant');
        if (failedControls.length > 0) {
            report.overallStatus = 'non_compliant';
            report.issues = failedControls.map(control => control.issues).flat();
        }

        return report;
    }

    private async checkAccessControls(): Promise<ControlStatus> {
        const status: ControlStatus = {
            status: 'compliant',
            issues: [],
        };

        // Check for proper authentication
        const authEnabled = await this.checkAuthenticationEnabled();
        if (!authEnabled) {
            status.status = 'non_compliant';
            status.issues.push('Authentication not properly configured');
        }

        // Check for proper authorization
        const authzEnabled = await this.checkAuthorizationEnabled();
        if (!authzEnabled) {
            status.status = 'non_compliant';
            status.issues.push('Authorization not properly configured');
        }

        return status;
    }
}
```

---

## Security Best Practices Summary

### Development Security

1. **Secure Coding Practices**
   - Input validation and sanitization
   - Output encoding
   - Parameterized queries
   - Error handling without information disclosure

2. **Dependency Management**
   - Regular security scanning
   - Automated vulnerability detection
   - Timely patch management
   - Supply chain security

3. **Code Review Process**
   - Security-focused code reviews
   - Static analysis integration
   - Security testing in CI/CD
   - Penetration testing

### Operational Security

1. **Access Management**
   - Principle of least privilege
   - Multi-factor authentication
   - Regular access reviews
   - Privileged access monitoring

2. **Monitoring and Alerting**
   - Real-time security monitoring
   - Automated threat detection
   - Incident response procedures
   - Security metrics and KPIs

3. **Backup and Recovery**
   - Encrypted backups
   - Regular testing
   - Geographic distribution
   - Recovery time objectives

### Compliance Management

1. **Regulatory Compliance**
   - GDPR implementation
   - SOC 2 controls
   - Industry-specific requirements
   - Regular compliance audits

2. **Data Governance**
   - Data classification
   - Retention policies
   - Privacy by design
   - Consent management

This security guidelines document provides comprehensive coverage of security considerations for the @promethean-os/persistence package, addressing the critical security findings from code reviews and implementing industry best practices for data protection and compliance.