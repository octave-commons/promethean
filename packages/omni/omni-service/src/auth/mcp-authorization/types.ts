import type { UserContext } from '../types.js';

/**
 * Tool categorization for security classification
 */
export enum ToolCategory {
  READ_ONLY = 'read_only', // Safe operations (get_time, echo, help)
  FILE_READ = 'file_read', // File system reads
  FILE_WRITE = 'file_write', // File system writes
  CODE_EXECUTION = 'code_execution', // Command execution
  EXTERNAL_API = 'external_api', // GitHub, Discord, external services
  SYSTEM_ADMIN = 'system_admin', // Process management, system control
  DESTRUCTIVE = 'destructive', // Delete, overwrite operations
}

/**
 * Risk levels for tools
 */
export enum RiskLevel {
  LOW = 1, // Information gathering, read-only operations
  MEDIUM = 2, // Local file operations, internal APIs
  HIGH = 3, // External API calls, network operations
  CRITICAL = 4, // System modification, destructive operations
}

/**
 * Audit logging levels
 */
export enum AuditLevel {
  BASIC = 'basic', // Only access/denial events
  STANDARD = 'standard', // Include tool execution
  DETAILED = 'detailed', // Include arguments and results
  VERBOSE = 'verbose', // Include full context and timing
}

/**
 * Permission actions for tools
 */
export type PermissionAction = 'read' | 'write' | 'delete' | 'admin' | 'execute';

/**
 * Enhanced role definition with tool-specific permissions
 */
export interface EnhancedRole {
  name: string;
  description: string;
  level: number; // 1-100, higher = more privileged
  permissions: ToolPermission[];
  inherits?: string[]; // Parent roles for inheritance
  conditions?: RoleCondition[];
  metadata: {
    category: 'system' | 'user' | 'service' | 'admin';
    maxSessionDuration?: number;
    ipRestrictions?: string[];
    timeRestrictions?: TimeRestriction[];
  };
}

/**
 * Tool-specific permission definition
 */
export interface ToolPermission {
  toolName: string;
  category: ToolCategory;
  riskLevel: RiskLevel;
  actions: PermissionAction[];
  conditions?: PermissionCondition[];
  rateLimit?: RateLimitConfig;
  auditLevel: AuditLevel;
}

/**
 * Permission condition for dynamic evaluation
 */
export interface PermissionCondition {
  type: 'time' | 'ip' | 'resource' | 'context' | 'user_attribute';
  operator: 'equals' | 'contains' | 'regex' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  required: boolean;
}

/**
 * Role-level conditions
 */
export interface RoleCondition {
  type: 'time' | 'ip' | 'session' | 'concurrent_access';
  operator: 'equals' | 'contains' | 'regex' | 'in' | 'not_in';
  value: any;
  required: boolean;
}

/**
 * Time restriction configuration
 */
export interface TimeRestriction {
  type: 'business_hours' | 'custom_range' | 'weekdays_only' | 'weekends_only';
  timezone: string;
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  days?: number[]; // 0-6 (Sunday-Saturday)
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  requests: number;
  window: number; // in seconds
  burst?: number;
  penaltyMultiplier?: number;
}

/**
 * Tool definition with security context
 */
export interface ToolDefinition {
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
    sensitiveParams?: string[];
    allowedPaths?: string[];
    blockedPaths?: string[];
  };
  rateLimiting: {
    default: RateLimitConfig;
    perRole?: Record<string, RateLimitConfig>;
  };
  auditConfig: {
    logLevel: AuditLevel;
    sensitiveParams: string[];
    sanitizeResponse: boolean;
    includeStackTrace: boolean;
  };
}

/**
 * Authorization request context
 */
export interface AuthorizationContext {
  user: UserContext;
  toolName: string;
  arguments: any;
  request: {
    ip: string;
    userAgent: string;
    requestId: string;
    timestamp: Date;
    endpoint: string;
  };
  session: {
    id: string;
    startTime: Date;
    lastActivity: Date;
    requestCount: number;
  };
}

/**
 * Authorization result
 */
export interface AuthorizationResult {
  valid: boolean;
  granted: boolean;
  reason?: string;
  requiredPermissions?: string[];
  evaluatedConditions?: ConditionResult[];
  rateLimitStatus?: RateLimitStatus;
  securityViolations?: SecurityViolation[];
  metadata?: {
    duration: number;
    cacheHit: boolean;
    riskScore: number;
  };
}

/**
 * Condition evaluation result
 */
export interface ConditionResult {
  condition: PermissionCondition | RoleCondition;
  result: boolean;
  reason?: string;
  evaluatedAt: Date;
}

/**
 * Rate limiting status
 */
export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
  window: number;
  currentUsage: number;
}

/**
 * Security violation information
 */
export interface SecurityViolation {
  type:
    | 'path_traversal'
    | 'command_injection'
    | 'privilege_escalation'
    | 'unauthorized_access'
    | 'rate_limit_exceeded'
    | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  context: any;
  blocked: boolean;
}

/**
 * Enhanced security audit log entry
 */
export interface SecurityAuditLog {
  timestamp: Date;
  eventId: string; // UUID for correlation
  userId: string;
  sessionId: string;
  toolName: string;
  category: ToolCategory;
  riskLevel: RiskLevel;
  action:
    | 'access_requested'
    | 'access_granted'
    | 'access_denied'
    | 'executed'
    | 'failed'
    | 'blocked';
  result: 'success' | 'denied' | 'error' | 'blocked';
  reason?: string;
  context: {
    ipAddress: string;
    userAgent: string;
    requestId: string;
    endpoint: string;
    duration?: number;
  };
  details: {
    arguments?: any; // Sanitized
    permissionsChecked: string[];
    conditionsEvaluated: ConditionResult[];
    rateLimitStatus?: RateLimitStatus;
    securityViolations?: SecurityViolation[];
    riskScore: number;
  };
  metadata: {
    correlationId?: string;
    cacheHit: boolean;
    enforcementMode: 'monitor' | 'enforce';
  };
}

/**
 * Security alert for anomaly detection
 */
export interface SecurityAlert {
  id: string;
  type:
    | 'brute_force'
    | 'privilege_escalation'
    | 'unusual_pattern'
    | 'mass_access_denial'
    | 'suspicious_activity'
    | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  userId?: string;
  ipAddress?: string;
  toolName?: string;
  events: SecurityAuditLog[];
  metrics: {
    eventCount: number;
    timeWindow: number;
    frequency: number;
    riskScore: number;
  };
  actions: {
    autoBlocked: boolean;
    requiresInvestigation: boolean;
    notified: boolean;
  };
}

/**
 * Resource impact assessment
 */
export interface ResourceImpact {
  cpu: number; // CPU usage percentage
  memory: number; // Memory usage in MB
  disk: number; // Disk I/O in MB
  network: number; // Network usage in MB
  duration: number; // Execution time in ms
  affectedUsers: number;
}

/**
 * Security monitoring configuration
 */
export interface SecurityMonitoringConfig {
  anomalyDetection: {
    enabled: boolean;
    thresholds: {
      failedAttemptsPerMinute: number;
      unusualToolAccess: number;
      privilegeEscalationAttempts: number;
      suspiciousPatterns: string[];
    };
    alerting: {
      enabled: boolean;
      channels: ('email' | 'slack' | 'webhook' | 'log')[];
      thresholds: {
        low: number;
        medium: number;
        high: number;
        critical: number;
      };
    };
  };
  rateLimiting: {
    enabled: boolean;
    global: RateLimitConfig;
    perTool: Record<string, RateLimitConfig>;
    perRole: Record<string, RateLimitConfig>;
    adaptive: {
      enabled: boolean;
      sensitivity: number; // 0-1
      learningPeriod: number; // in hours
    };
  };
  audit: {
    retention: number; // in days
    compression: boolean;
    encryption: boolean;
    backup: {
      enabled: boolean;
      frequency: string; // cron expression
      location: string;
    };
  };
}

/**
 * Tool registry configuration
 */
export interface ToolRegistryConfig {
  autoDiscovery: boolean;
  configPath: string;
  validation: {
    strict: boolean;
    requiredFields: string[];
    securityValidation: boolean;
  };
  caching: {
    enabled: boolean;
    ttl: number; // in seconds
    maxSize: number;
  };
}

/**
 * Authorization engine configuration
 */
export interface AuthorizationEngineConfig {
  enforcementMode: 'monitor' | 'enforce';
  caching: {
    enabled: boolean;
    ttl: number; // in seconds
    maxSize: number;
  };
  performance: {
    maxEvaluationTime: number; // in ms
    parallelEvaluation: boolean;
    batchProcessing: boolean;
  };
  security: {
    failClosed: boolean;
    auditAllChecks: boolean;
    logSensitiveData: boolean;
  };
}
