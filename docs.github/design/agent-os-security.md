# Agent OS Security Model

This document defines the comprehensive security architecture for Agent OS, ensuring agent instances operate in a secure, isolated, and controlled environment.

## Table of Contents

- [Security Principles](#security-principles)
- [Threat Model](#threat-model)
- [Agent Isolation & Sandboxing](#agent-isolation--sandboxing)
- [Authentication & Authorization](#authentication--authorization)
- [Permission System](#permission-system)
- [Resource Security](#resource-security)
- [Communication Security](#communication-security)
- [Audit & Monitoring](#audit--monitoring)
- [Security Policies](#security-policies)
- [Compliance & Governance](#compliance--governance)

## Security Principles

### 1. Zero Trust Architecture
- **Never trust, always verify**: All agent interactions require authentication and authorization
- **Principle of least privilege**: Agents receive only the permissions necessary for their tasks
- **Micro-segmentation**: Each agent instance operates in an isolated security domain

### 2. Defense in Depth
- **Multiple security layers**: Network, application, container, and process-level protections
- **Fail-safe defaults**: Secure configurations that require explicit permission to relax
- **Reduced attack surface**: Minimal exposure of agent capabilities and system resources

### 3. Transparency & Auditability
- **Complete traceability**: All agent actions are logged and auditable
- **Immutable audit trails**: Tamper-evident logging of all security-relevant events
- **Real-time monitoring**: Continuous security monitoring and alerting

## Threat Model

### Attack Vectors

#### External Threats
1. **Malicious Task Injection**
   - Attacker submits tasks designed to compromise agents
   - Mitigation: Task validation, sandboxing, and capability restrictions

2. **Agent Impersonation**
   - Attacker attempts to spoof legitimate agent instances
   - Mitigation: Strong authentication, certificate-based identity

3. **Resource Exhaustion**
   - Attacker overwhelms system with resource-intensive tasks
   - Mitigation: Resource quotas, rate limiting, and monitoring

#### Internal Threats
1. **Privileged Agent Compromise**
   - An agent instance is compromised and attempts lateral movement
   - Mitigation: Container isolation, network segmentation, minimal privileges

2. **Data Exfiltration**
   - Compromised agent attempts to access unauthorized data
   - Mitigation: Data access controls, encryption, audit logging

3. **Unauthorized Capability Usage**
   - Agent attempts to use capabilities beyond its assigned scope
   - Mitigation: Capability enforcement, runtime monitoring

### Risk Assessment

| Risk Category | Likelihood | Impact | Mitigation |
|---------------|------------|--------|------------|
| Task Injection | Medium | High | Task validation, sandboxing |
| Agent Compromise | Low | Critical | Container isolation, monitoring |
| Data Leakage | Low | High | Access controls, encryption |
| Resource Abuse | Medium | Medium | Quotas, rate limiting |
| Privilege Escalation | Low | Critical | Minimal privileges, auditing |

## Agent Isolation & Sandboxing

### Container Security

#### Multi-Level Isolation
```yaml
# Agent Container Security Profile
agent_security_profile:
  # Level 1: Process Isolation
  process_isolation:
    - Dedicated PID namespace
    - Separate user namespace (non-root)
    - Limited process capabilities
    - No privileged operations

  # Level 2: Filesystem Isolation
  filesystem_isolation:
    - Read-only base filesystem
    - Ephemeral writable layer
    - Restricted mount points
    - No access to host filesystem

  # Level 3: Network Isolation
  network_isolation:
    - Isolated network namespace
    - Egress filtering via firewall rules
    - No inbound connections
    - Encrypted communication only

  # Level 4: Resource Isolation
  resource_isolation:
    - CPU limits (shares/quota)
    - Memory limits and swap control
    - Disk I/O throttling
    - Network bandwidth limits
```

#### Container Security Configuration
```dockerfile
# Agent Runtime Container
FROM scratch

# Security-hardened base
ADD --chmod=0755 agent-runtime /agent-runtime

# Non-root user
USER 65534

# Security labels
LABEL security.status="sandboxed"
LABEL capabilities="restricted"

# Resource limits
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/agent-runtime", "health-check"]

# No shell, no package manager, minimal attack surface
ENTRYPOINT ["/agent-runtime", "execute"]
```

### Runtime Sandboxing

#### Capability Restrictions
```typescript
interface AgentSandboxPolicy {
  // Allowed system calls
  allowedSyscalls: string[];

  // File access patterns
  fileAccess: {
    readonly: string[];
    readwrite: string[];
    forbidden: string[];
  };

  // Network access rules
  networkRules: {
    allowedHosts: string[];
    allowedPorts: number[];
    protocols: string[];
  };

  // Resource limits
  resourceLimits: {
    maxMemory: number;
    maxCpuTime: number;
    maxFileSize: number;
    maxProcesses: number;
  };

  // Capability permissions
  capabilities: {
    allowed: string[];
    forbidden: string[];
  };
}

// Example: Code Review Agent Policy
const codeReviewerPolicy: AgentSandboxPolicy = {
  allowedSyscalls: [
    'read', 'write', 'open', 'close', 'stat', 'fstat',
    'mmap', 'munmap', 'brk', 'rt_sigaction'
  ],
  fileAccess: {
    readonly: [
      '/workspace/**/*.ts',
      '/workspace/**/*.js',
      '/workspace/**/*.json',
      '/usr/lib/**',
      '/etc/ssl/**'
    ],
    readwrite: [
      '/tmp/**',
      '/workspace/.agent-workspace/**'
    ],
    forbidden: [
      '/etc/**',
      '/root/**',
      '/home/**',
      '/var/**',
      '/sys/**',
      '/proc/**'
    ]
  },
  networkRules: {
    allowedHosts: ['api.github.com', 'registry.npmjs.org'],
    allowedPorts: [443, 80],
    protocols: ['https', 'http']
  },
  resourceLimits: {
    maxMemory: 1024 * 1024 * 1024, // 1GB
    maxCpuTime: 30 * 60 * 1000,    // 30 minutes
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxProcesses: 10
  },
  capabilities: {
    allowed: ['read_files', 'write_files', 'network_access'],
    forbidden: ['system_admin', 'file_system_admin', 'network_admin']
  }
};
```

#### Dynamic Capability Enforcement
```typescript
class AgentCapabilityGuard {
  private policy: AgentSandboxPolicy;
  private auditLogger: AuditLogger;

  constructor(agentId: string, policy: AgentSandboxPolicy) {
    this.policy = policy;
    this.auditLogger = new AuditLogger(agentId);
  }

  async enforceCapabilityAttempt(
    capability: string,
    resource: string,
    context: any
  ): Promise<boolean> {
    // Check if capability is allowed
    if (!this.isCapabilityAllowed(capability)) {
      await this.auditLogger.logSecurityEvent({
        type: 'capability_denied',
        capability,
        resource,
        reason: 'capability_not_in_policy'
      });
      return false;
    }

    // Check resource access permissions
    if (!this.isResourceAccessAllowed(capability, resource)) {
      await this.auditLogger.logSecurityEvent({
        type: 'resource_access_denied',
        capability,
        resource,
        reason: 'resource_not_permitted'
      });
      return false;
    }

    // Log successful capability usage
    await this.auditLogger.logSecurityEvent({
      type: 'capability_used',
      capability,
      resource,
      context
    });

    return true;
  }

  private isCapabilityAllowed(capability: string): boolean {
    return this.policy.capabilities.allowed.includes(capability) &&
           !this.policy.capabilities.forbidden.includes(capability);
  }

  private isResourceAccessAllowed(capability: string, resource: string): boolean {
    // Implementation depends on capability type
    switch (capability) {
      case 'read_files':
        return this.checkFileAccess(resource, this.policy.fileAccess.readonly);
      case 'write_files':
        return this.checkFileAccess(resource, this.policy.fileAccess.readwrite);
      case 'network_access':
        return this.checkNetworkAccess(resource);
      default:
        return false;
    }
  }
}
```

## Authentication & Authorization

### Agent Identity Management

#### Cryptographic Identity
```typescript
interface AgentIdentity {
  // Cryptographic identifiers
  instanceId: string;           // UUID v4
  publicKey: string;           // PEM-encoded public key
  certificate: string;         // X.509 certificate
  certificateChain: string[];  // CA chain

  // Identity metadata
  agentType: string;
  version: string;
  createdAt: string;
  expiresAt: string;

  // Trust anchors
  issuer: string;              // Certificate issuer
  subject: string;             // Certificate subject
  fingerprint: string;         // SHA-256 fingerprint
}

// Agent Certificate Structure
interface AgentCertificate {
  version: 3;
  serialNumber: string;
  issuer: string;
  subject: string;
  validity: {
    notBefore: string;
    notAfter: string;
  };
  subjectPublicKeyInfo: {
    algorithm: 'RSA' | 'ECDSA';
    publicKey: string;
  };
  extensions: {
    agentType: string;
    capabilities: string[];
    restrictions: string[];
  };
  signature: {
    algorithm: string;
    value: string;
  };
}
```

#### Mutual Authentication
```typescript
class AgentAuthenticator {
  private caStore: CertificateAuthority;
  private identityStore: AgentIdentityStore;

  async authenticateAgent(
    clientCertificate: string,
    clientSignature: string,
    challenge: string
  ): Promise<AgentIdentity | null> {
    try {
      // 1. Validate certificate chain
      const cert = await this.validateCertificate(clientCertificate);
      if (!cert) return null;

      // 2. Verify certificate is not revoked
      if (await this.caStore.isRevoked(cert.serialNumber)) {
        return null;
      }

      // 3. Verify signature against challenge
      const publicKey = await this.extractPublicKey(cert);
      const isValidSignature = await this.verifySignature(
        publicKey,
        challenge,
        clientSignature
      );

      if (!isValidSignature) return null;

      // 4. Load agent identity
      const identity = await this.identityStore.getById(cert.subject);
      if (!identity || identity.expiresAt < new Date().toISOString()) {
        return null;
      }

      return identity;
    } catch (error) {
      console.error('Authentication failed:', error);
      return null;
    }
  }

  private async validateCertificate(certPem: string): Promise<AgentCertificate | null> {
    // Certificate validation logic
    // - Verify signature
    // - Check certificate chain
    // - Validate extensions
    // - Check expiration
    return null; // Implementation details
  }
}
```

### Permission System

#### Role-Based Access Control (RBAC)
```typescript
interface AgentRole {
  name: string;
  description: string;
  permissions: Permission[];
  constraints: RoleConstraint[];
}

interface Permission {
  resource: string;           // Resource type (e.g., 'file', 'network', 'task')
  action: string;            // Action (e.g., 'read', 'write', 'execute')
  effect: 'allow' | 'deny';  // Allow or deny
  conditions?: Condition[];  // Conditions for permission
}

interface Condition {
  field: string;             // Field to check
  operator: 'eq' | 'ne' | 'in' | 'contains';
  value: any;                // Expected value
}

// Predefined Agent Roles
const AGENT_ROLES: Record<string, AgentRole> = {
  'code-reviewer': {
    name: 'code-reviewer',
    description: 'Agent specialized in code review and analysis',
    permissions: [
      {
        resource: 'file',
        action: 'read',
        effect: 'allow',
        conditions: [
          { field: 'extension', operator: 'in', value: ['.ts', '.js', '.jsx', '.tsx'] }
        ]
      },
      {
        resource: 'network',
        action: 'connect',
        effect: 'allow',
        conditions: [
          { field: 'host', operator: 'in', value: ['api.github.com', 'registry.npmjs.org'] }
        ]
      },
      {
        resource: 'system',
        action: 'execute',
        effect: 'deny'
      }
    ],
    constraints: [
      { type: 'time_limit', value: 3600000 },  // 1 hour
      { type: 'memory_limit', value: 1024 * 1024 * 1024 }  // 1GB
    ]
  },

  'task-orchestrator': {
    name: 'task-orchestrator',
    description: 'Agent that manages task assignment and coordination',
    permissions: [
      {
        resource: 'agent',
        action: 'read',
        effect: 'allow'
      },
      {
        resource: 'task',
        action: 'assign',
        effect: 'allow'
      },
      {
        resource: 'system',
        action: 'monitor',
        effect: 'allow'
      }
    ],
    constraints: [
      { type: 'max_concurrent_tasks', value: 10 }
    ]
  }
};
```

#### Attribute-Based Access Control (ABAC)
```typescript
interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  target: TargetExpression;
  condition: BooleanExpression;
  effect: 'allow' | 'deny';
  priority: number;
}

interface TargetExpression {
  resource: AttributeExpression;
  action: AttributeExpression;
  subject: AttributeExpression;
}

interface AttributeExpression {
  attribute: string;
  operator: 'eq' | 'ne' | 'in' | 'contains' | 'matches';
  value: any;
}

// Dynamic Policy Evaluation
class PolicyEngine {
  private policies: AccessPolicy[];
  private attributeResolver: AttributeResolver;

  async evaluateAccess(
    subject: AgentIdentity,
    resource: any,
    action: string,
    context: any
  ): Promise<{ allowed: boolean; reason: string }> {
    // Resolve attributes
    const subjectAttrs = await this.attributeResolver.resolveSubject(subject);
    const resourceAttrs = await this.attributeResolver.resolveResource(resource);
    const contextAttrs = await this.attributeResolver.resolveContext(context);

    // Sort policies by priority (highest first)
    const sortedPolicies = this.policies.sort((a, b) => b.priority - a.priority);

    for (const policy of sortedPolicies) {
      const targetMatch = await this.evaluateTarget(
        policy.target,
        subjectAttrs,
        resourceAttrs,
        { action }
      );

      if (targetMatch) {
        const conditionMatch = await this.evaluateCondition(
          policy.condition,
          subjectAttrs,
          resourceAttrs,
          contextAttrs
        );

        if (conditionMatch) {
          return {
            allowed: policy.effect === 'allow',
            reason: `Policy ${policy.id} (${policy.effect})`
          };
        }
      }
    }

    // Default deny
    return { allowed: false, reason: 'No matching policy found' };
  }

  private async evaluateTarget(
    target: TargetExpression,
    subject: any,
    resource: any,
    actionContext: any
  ): Promise<boolean> {
    const resourceMatch = await this.evaluateExpression(
      target.resource,
      resource
    );

    const actionMatch = await this.evaluateExpression(
      target.action,
      actionContext
    );

    const subjectMatch = await this.evaluateExpression(
      target.subject,
      subject
    );

    return resourceMatch && actionMatch && subjectMatch;
  }
}
```

## Resource Security

### Data Protection

#### Encryption-at-Rest
```typescript
class AgentDataProtector {
  private encryptionKey: CryptoKey;
  private keyId: string;

  constructor(keyId: string, keyMaterial: Uint8Array) {
    this.keyId = keyId;
    this.encryptionKey = this.importKey(keyMaterial);
  }

  async encryptSensitiveData(data: any): Promise<EncryptedData> {
    const dataString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt with AES-GCM
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      dataBuffer
    );

    return {
      keyId: this.keyId,
      algorithm: 'AES-GCM',
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(encryptedBuffer)),
      timestamp: new Date().toISOString()
    };
  }

  async decryptSensitiveData(encryptedData: EncryptedData): Promise<any> {
    const iv = new Uint8Array(encryptedData.iv);
    const ciphertext = new Uint8Array(encryptedData.ciphertext);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      ciphertext
    );

    const decoder = new TextDecoder();
    const dataString = decoder.decode(decryptedBuffer);

    return JSON.parse(dataString);
  }
}
```

#### Data Access Controls
```typescript
interface DataAccessPolicy {
  // Data classification
  classification: 'public' | 'internal' | 'confidential' | 'restricted';

  // Access rules
  accessRules: {
    readRoles: string[];
    writeRoles: string[];
    deleteRoles: string[];
  };

  // Retention policies
  retention: {
    retentionPeriod: number;  // milliseconds
    autoDelete: boolean;
  };

  // Audit requirements
  audit: {
    logReads: boolean;
    logWrites: boolean;
    logDeletes: boolean;
  };
}

// Data Access Enforcement
class DataAccessGuard {
  private policies: Map<string, DataAccessPolicy>;
  private auditLogger: AuditLogger;

  async checkDataAccess(
    agentId: string,
    dataId: string,
    operation: 'read' | 'write' | 'delete',
    context: any
  ): Promise<boolean> {
    const policy = this.policies.get(dataId);
    if (!policy) {
      await this.auditLogger.logSecurityEvent({
        type: 'data_access_denied',
        agentId,
        dataId,
        operation,
        reason: 'no_policy_found'
      });
      return false;
    }

    const agentRoles = await this.getAgentRoles(agentId);
    const requiredRoles = this.getRequiredRoles(policy, operation);

    const hasPermission = requiredRoles.some(role => agentRoles.includes(role));

    if (!hasPermission) {
      await this.auditLogger.logSecurityEvent({
        type: 'data_access_denied',
        agentId,
        dataId,
        operation,
        reason: 'insufficient_permissions',
        agentRoles,
        requiredRoles
      });
      return false;
    }

    // Log successful access if required
    if (this.shouldLogAccess(policy, operation)) {
      await this.auditLogger.logDataAccess({
        agentId,
        dataId,
        operation,
        timestamp: new Date().toISOString(),
        context
      });
    }

    return true;
  }
}
```

### Resource Quotas & Limits

```typescript
interface ResourceQuota {
  // CPU quotas
  cpuQuota: {
    shares: number;           // CPU shares (relative weight)
    quota: number;            // CPU time in microseconds
    period: number;           // Period in microseconds
  };

  // Memory limits
  memoryLimits: {
    limit: number;            // Memory limit in bytes
    swapLimit: number;        // Swap limit in bytes
    reservation: number;      // Memory reservation
  };

  // Storage quotas
  storageQuotas: {
    diskQuota: number;        // Disk quota in bytes
    maxFiles: number;         // Maximum number of files
    maxFileSize: number;      // Maximum file size
  };

  // Network limits
  networkLimits: {
    bandwidthLimit: number;   // Bandwidth limit in bytes per second
    connectionLimit: number;  // Maximum concurrent connections
    packetRateLimit: number;  // Packets per second
  };
}

// Quota Enforcement
class ResourceQuotaEnforcer {
  private quotas: Map<string, ResourceQuota>;
  private monitors: Map<string, ResourceMonitor>;

  async enforceQuotas(agentId: string): Promise<void> {
    const quota = this.quotas.get(agentId);
    if (!quota) return;

    const monitor = this.monitors.get(agentId);
    if (!monitor) return;

    const currentUsage = await monitor.getCurrentUsage();

    // Check CPU usage
    if (currentUsage.cpuUsage > quota.cpuQuota.quota) {
      await this.throttleCpu(agentId, quota.cpuQuota);
    }

    // Check memory usage
    if (currentUsage.memoryUsage > quota.memoryLimits.limit) {
      await this.enforceMemoryLimit(agentId, quota.memoryLimits);
    }

    // Check storage usage
    if (currentUsage.diskUsage > quota.storageQuotas.diskQuota) {
      await this.enforceStorageLimit(agentId, quota.storageQuotas);
    }

    // Check network usage
    if (currentUsage.networkUsage > quota.networkLimits.bandwidthLimit) {
      await this.throttleNetwork(agentId, quota.networkLimits);
    }
  }
}
```

## Communication Security

### Secure Agent Communication

#### Message Authentication & Integrity
```typescript
interface SecureMessage {
  header: {
    version: number;
    messageType: string;
    senderId: string;
    recipientId: string;
    timestamp: string;
    messageId: string;
  };

  payload: any;

  security: {
    signature: string;        // Digital signature
    encryptionKey?: string;   // Encrypted symmetric key
    mac: string;             // Message authentication code
  };
}

class SecureMessageHandler {
  private privateKey: CryptoKey;
  private publicKeyStore: Map<string, CryptoKey>;

  async signMessage(message: any, senderId: string): Promise<string> {
    const messageString = JSON.stringify(message);
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(messageString);

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      this.privateKey,
      messageBuffer
    );

    return Array.from(new Uint8Array(signature)).join(',');
  }

  async verifyMessage(
    message: SecureMessage,
    senderPublicKey: CryptoKey
  ): Promise<boolean> {
    const messageString = JSON.stringify({
      header: message.header,
      payload: message.payload
    });

    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(messageString);

    const signature = new Uint8Array(
      message.security.signature.split(',').map(Number)
    );

    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      senderPublicKey,
      signature,
      messageBuffer
    );
  }

  async encryptMessage(message: any, recipientPublicKey: CryptoKey): Promise<EncryptedMessage> {
    // Generate ephemeral symmetric key
    const symmetricKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Encrypt message with symmetric key
    const messageString = JSON.stringify(message);
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(messageString);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      symmetricKey,
      messageBuffer
    );

    // Encrypt symmetric key with recipient's public key
    const symmetricKeyBuffer = await crypto.subtle.exportKey('raw', symmetricKey);
    const encryptedKey = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      recipientPublicKey,
      symmetricKeyBuffer
    );

    return {
      encryptedData: Array.from(new Uint8Array(encryptedBuffer)),
      encryptedKey: Array.from(new Uint8Array(encryptedKey)),
      iv: Array.from(iv)
    };
  }
}
```

#### Secure Channel Establishment
```typescript
class AgentSecureChannel {
  private localKeyPair: CryptoKeyPair;
  private remotePublicKey?: CryptoKey;
  private sessionKey?: CryptoKey;
  private channelEstablished: boolean = false;

  async initiateHandshake(remoteAgentId: string): Promise<HandshakeMessage> {
    // Generate ephemeral key pair for this session
    const ephemeralKeyPair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey']
    );

    // Create handshake message
    const handshakeMessage: HandshakeMessage = {
      type: 'handshake_initiate',
      senderId: this.localAgentId,
      recipientId: remoteAgentId,
      timestamp: new Date().toISOString(),
      ephemeralPublicKey: await this.exportPublicKey(ephemeralKeyPair.publicKey),
      signature: await this.signHandshake(ephemeralKeyPair.publicKey)
    };

    this.ephemeralKeyPair = ephemeralKeyPair;
    return handshakeMessage;
  }

  async completeHandshake(handshakeMessage: HandshakeMessage): Promise<boolean> {
    try {
      // Verify handshake signature
      const isValidSignature = await this.verifyHandshakeSignature(handshakeMessage);
      if (!isValidSignature) {
        throw new Error('Invalid handshake signature');
      }

      // Import remote ephemeral public key
      const remoteEphemeralPublicKey = await this.importPublicKey(
        handshakeMessage.ephemeralPublicKey
      );

      // Derive shared secret
      const sharedSecret = await crypto.subtle.deriveKey(
        { name: 'ECDH', public: remoteEphemeralPublicKey },
        this.ephemeralKeyPair!.privateKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      this.sessionKey = sharedSecret;
      this.remotePublicKey = remoteEphemeralPublicKey;
      this.channelEstablished = true;

      return true;
    } catch (error) {
      console.error('Handshake failed:', error);
      return false;
    }
  }

  async sendSecureMessage(message: any): Promise<SecureMessage> {
    if (!this.channelEstablished || !this.sessionKey) {
      throw new Error('Secure channel not established');
    }

    // Encrypt message with session key
    const messageString = JSON.stringify(message);
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(messageString);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.sessionKey,
      messageBuffer
    );

    // Create secure message
    const secureMessage: SecureMessage = {
      header: {
        version: 1,
        messageType: 'secure_message',
        senderId: this.localAgentId,
        recipientId: this.remoteAgentId!,
        timestamp: new Date().toISOString(),
        messageId: crypto.randomUUID()
      },
      payload: {
        encryptedData: Array.from(new Uint8Array(encryptedBuffer)),
        iv: Array.from(iv)
      },
      security: {
        mac: await this.calculateMAC(encryptedBuffer)
      }
    };

    return secureMessage;
  }
}
```

## Audit & Monitoring

### Security Event Logging

```typescript
interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';

  // Event details
  agentId: string;
  resource?: string;
  action?: string;
  outcome: 'success' | 'failure' | 'blocked';

  // Context
  source: string;
  userAgent?: string;
  ipAddress?: string;

  // Additional data
  details: Record<string, any>;

  // Integrity
  checksum: string;
}

type SecurityEventType =
  | 'authentication_success' | 'authentication_failure'
  | 'authorization_granted' | 'authorization_denied'
  | 'capability_used' | 'capability_denied'
  | 'resource_access_granted' | 'resource_access_denied'
  | 'policy_violation' | 'security_alert'
  | 'data_access' | 'data_modification'
  | 'agent_spawn' | 'agent_terminate'
  | 'system_anomaly';

class SecurityAuditLogger {
  private logStore: AuditLogStore;
  private alertManager: SecurityAlertManager;

  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'checksum'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      checksum: ''
    };

    // Calculate checksum for integrity
    securityEvent.checksum = await this.calculateEventChecksum(securityEvent);

    // Store event
    await this.logStore.storeEvent(securityEvent);

    // Check for security alerts
    await this.checkForSecurityAlerts(securityEvent);

    // Forward to monitoring systems
    await this.forwardToMonitoring(securityEvent);
  }

  private async checkForSecurityAlerts(event: SecurityEvent): Promise<void> {
    // Failed authentication patterns
    if (event.eventType === 'authentication_failure') {
      const recentFailures = await this.logStore.getRecentFailures(
        event.agentId,
        5 * 60 * 1000  // 5 minutes
      );

      if (recentFailures.length >= 5) {
        await this.alertManager.raiseAlert({
          type: 'brute_force_attack',
          severity: 'high',
          agentId: event.agentId,
          details: {
            failureCount: recentFailures.length,
            timeWindow: '5 minutes'
          }
        });
      }
    }

    // Policy violations
    if (event.eventType === 'policy_violation') {
      await this.alertManager.raiseAlert({
        type: 'security_policy_violation',
        severity: event.severity === 'critical' ? 'critical' : 'high',
        agentId: event.agentId,
        resource: event.resource,
        details: event.details
      });
    }

    // Unusual resource access
    if (event.eventType === 'resource_access_denied') {
      const recentDenials = await this.logStore.getRecentResourceDenials(
        event.agentId,
        event.resource!,
        60 * 60 * 1000  // 1 hour
      );

      if (recentDenials.length >= 10) {
        await this.alertManager.raiseAlert({
          type: 'suspicious_resource_access',
          severity: 'medium',
          agentId: event.agentId,
          resource: event.resource,
          details: {
            denialCount: recentDenials.length,
            timeWindow: '1 hour'
          }
        });
      }
    }
  }
}
```

### Real-time Security Monitoring

```typescript
class SecurityMonitor {
  private anomalyDetector: AnomalyDetector;
  private threatIntel: ThreatIntelligence;
  private metricsCollector: MetricsCollector;

  async monitorAgentActivity(agentId: string): Promise<void> {
    const agentMetrics = await this.metricsCollector.getAgentMetrics(agentId);

    // Detect anomalies in agent behavior
    const anomalies = await this.anomalyDetector.detectAnomalies(agentMetrics);

    for (const anomaly of anomalies) {
      await this.handleAnomaly(agentId, anomaly);
    }

    // Check against threat intelligence
    const threats = await this.threatIntel.checkAgentThreats(agentId);

    for (const threat of threats) {
      await this.handleThreat(agentId, threat);
    }
  }

  private async handleAnomaly(agentId: string, anomaly: Anomaly): Promise<void> {
    switch (anomaly.type) {
      case 'unusual_resource_usage':
        await this.respondToResourceAnomaly(agentId, anomaly);
        break;

      case 'suspicious_network_activity':
        await this.respondToNetworkAnomaly(agentId, anomaly);
        break;

      case 'abnormal_task_patterns':
        await this.respondToTaskAnomaly(agentId, anomaly);
        break;

      case 'potential_compromise':
        await this.respondToCompromiseAttempt(agentId, anomaly);
        break;
    }
  }

  private async respondToCompromiseAttempt(agentId: string, anomaly: Anomaly): Promise<void> {
    // Immediate quarantine
    await this.quarantineAgent(agentId, 'Potential compromise detected');

    // Terminate active tasks
    await this.terminateAgentTasks(agentId);

    // Raise critical alert
    await this.raiseCriticalAlert({
      type: 'agent_compromise_suspected',
      agentId,
      severity: 'critical',
      details: anomaly
    });

    // Preserve forensic evidence
    await this.preserveForensicData(agentId);
  }
}
```

## Security Policies

### Agent Security Policy Framework

```typescript
interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  version: string;

  // Policy scope
  scope: {
    agentTypes?: string[];
    environments?: string[];
    dataClassifications?: string[];
  };

  // Policy rules
  rules: SecurityRule[];

  // Enforcement
  enforcement: {
    mode: 'advisory' | 'enforcing' | 'blocking';
    exceptions: PolicyException[];
  };

  // Metadata
  metadata: {
    createdBy: string;
    createdAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    approvedBy?: string;
    approvedAt?: string;
  };
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;

  // Rule condition
  condition: {
    when: EventCondition;
    where: ContextCondition;
  };

  // Rule action
  action: {
    type: 'allow' | 'deny' | 'log' | 'alert' | 'quarantine';
    parameters?: Record<string, any>;
  };

  // Rule metadata
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  tags: string[];
}

// Example Security Policies
const SECURITY_POLICIES: SecurityPolicy[] = [
  {
    id: 'policy-001',
    name: 'Agent Network Isolation',
    description: 'Agents must only communicate through approved channels',
    version: '1.0',
    scope: {
      agentTypes: ['code-reviewer', 'task-orchestrator']
    },
    rules: [
      {
        id: 'rule-001-1',
        name: 'Block External Network Access',
        description: 'Prevent agents from accessing external networks directly',
        condition: {
          when: { eventType: 'network_connection_attempt' },
          where: { destination: { notIn: ['api.github.com', 'registry.npmjs.org'] } }
        },
        action: {
          type: 'deny',
          parameters: { reason: 'External network access not permitted' }
        },
        severity: 'high',
        category: 'network_security',
        tags: ['network', 'isolation']
      }
    ],
    enforcement: {
      mode: 'enforcing',
      exceptions: []
    },
    metadata: {
      createdBy: 'security-admin',
      createdAt: '2025-01-15T10:00:00Z'
    }
  },

  {
    id: 'policy-002',
    name: 'Data Access Classification',
    description: 'Enforce data classification-based access controls',
    version: '1.0',
    scope: {
      dataClassifications: ['confidential', 'restricted']
    },
    rules: [
      {
        id: 'rule-002-1',
        name: 'Require MFA for Restricted Data',
        description: 'Multi-factor authentication required for restricted data access',
        condition: {
          when: { eventType: 'data_access_attempt' },
          where: { dataClassification: 'restricted', mfaVerified: false }
        },
        action: {
          type: 'deny',
          parameters: { reason: 'MFA required for restricted data access' }
        },
        severity: 'critical',
        category: 'data_security',
        tags: ['data', 'authentication', 'mfa']
      }
    ],
    enforcement: {
      mode: 'blocking',
      exceptions: []
    },
    metadata: {
      createdBy: 'security-admin',
      createdAt: '2025-01-15T10:00:00Z'
    }
  }
];
```

## Compliance & Governance

### Regulatory Compliance

```typescript
interface ComplianceFramework {
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
}

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'privacy' | 'governance' | 'operational';

  // Requirement details
  controls: ComplianceControl[];
  evidence: EvidenceRequirement[];
  monitoring: MonitoringRequirement[];

  // Compliance status
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_assessed';
  lastAssessment: string;
  nextAssessment: string;
}

// Example: GDPR Compliance
const GDPR_COMPLIANCE: ComplianceFramework = {
  name: 'GDPR',
  version: '2018',
  requirements: [
    {
      id: 'gdpr-art-32',
      name: 'Security of Processing',
      description: 'Implement appropriate technical and organizational measures',
      category: 'security',
      controls: [
        {
          id: 'control-encryption',
          name: 'Data Encryption',
          description: 'Encrypt personal data at rest and in transit',
          implementation: 'aes-256-encryption',
          automated: true
        },
        {
          id: 'control-access-logs',
          name: 'Access Logging',
          description: 'Log all access to personal data',
          implementation: 'comprehensive-audit-logging',
          automated: true
        }
      ],
      evidence: [
        {
          type: 'technical_documentation',
          description: 'Encryption implementation documentation',
          automated: true
        },
        {
          type: 'audit_logs',
          description: 'Sample of access logs covering 6 months',
          automated: true
        }
      ],
      monitoring: [
        {
          type: 'continuous',
          description: 'Monitor encryption key rotation',
          frequency: 'daily'
        },
        {
          type: 'periodic',
          description: 'Review access log integrity',
          frequency: 'monthly'
        }
      ],
      status: 'compliant',
      lastAssessment: '2025-01-01T00:00:00Z',
      nextAssessment: '2025-07-01T00:00:00Z'
    }
  ]
};

class ComplianceManager {
  private frameworks: Map<string, ComplianceFramework>;
  private auditLogger: ComplianceAuditLogger;

  async assessCompliance(frameworkId: string): Promise<ComplianceAssessment> {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) {
      throw new Error(`Compliance framework ${frameworkId} not found`);
    }

    const assessment: ComplianceAssessment = {
      frameworkId,
      frameworkName: framework.name,
      assessedAt: new Date().toISOString(),
      requirements: []
    };

    for (const requirement of framework.requirements) {
      const requirementAssessment = await this.assessRequirement(requirement);
      assessment.requirements.push(requirementAssessment);
    }

    // Calculate overall compliance status
    assessment.overallStatus = this.calculateOverallStatus(assessment.requirements);

    // Store assessment
    await this.auditLogger.storeAssessment(assessment);

    return assessment;
  }

  private async assessRequirement(
    requirement: ComplianceRequirement
  ): Promise<RequirementAssessment> {
    const assessment: RequirementAssessment = {
      requirementId: requirement.id,
      requirementName: requirement.name,
      status: 'not_assessed',
      controls: [],
      evidence: [],
      risks: []
    };

    // Assess each control
    for (const control of requirement.controls) {
      const controlAssessment = await this.assessControl(control);
      assessment.controls.push(controlAssessment);
    }

    // Collect evidence
    for (const evidenceReq of requirement.evidence) {
      const evidence = await this.collectEvidence(evidenceReq);
      assessment.evidence.push(evidence);
    }

    // Determine requirement status
    assessment.status = this.determineRequirementStatus(assessment.controls);

    return assessment;
  }
}
```

This comprehensive security model ensures that Agent OS provides a secure, compliant, and auditable environment for AI agent operations while maintaining the flexibility needed for dynamic task execution and collaboration.