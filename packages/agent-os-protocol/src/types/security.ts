/**
 * Security Types for Agent OS
 * 
 * Defines authentication, authorization, and message security structures.
 */

import { z } from 'zod';
import type { AgentIdentifier } from './agent.js';
import type { AgentOSMessage } from './message.js';

/**
 * Agent Credentials - credentials for agent authentication
 */
export interface AgentCredentials {
  type: 'jwt' | 'api_key' | 'certificate';
  value: string;
  metadata?: Record<string, unknown>;
}

export const AgentCredentialsSchema = z.object({
  type: z.enum(['jwt', 'api_key', 'certificate']),
  value: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Auth Token - authentication token
 */
export interface AuthToken {
  token: string;
  type: string;
  expiresAt: string; // ISO8601
  scopes: string[];
  agentId: string;
  metadata?: Record<string, unknown>;
}

export const AuthTokenSchema = z.object({
  token: z.string(),
  type: z.string(),
  expiresAt: z.string().datetime(),
  scopes: z.array(z.string()),
  agentId: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Agent Authentication Interface
 */
export interface AgentAuth {
  authenticate(credentials: AgentCredentials): Promise<AuthToken>;
  validate(token: string): Promise<AgentInfo | null>;
  revoke(token: string): Promise<void>;
  refresh(token: string): Promise<AuthToken>;
}

/**
 * Agent Info - information returned after authentication
 */
export interface AgentInfo {
  id: string;
  type: string;
  capabilities: string[];
  permissions: string[];
  restrictions: Record<string, unknown>;
}

export const AgentInfoSchema = z.object({
  id: z.string(),
  type: z.string(),
  capabilities: z.array(z.string()),
  permissions: z.array(z.string()),
  restrictions: z.record(z.unknown()),
});

/**
 * Signed Message - cryptographically signed message
 */
export interface SignedMessage {
  message: AgentOSMessage;
  signature: string;
  algorithm: string;
  keyId: string;
  timestamp: string; // ISO8601
}

export const SignedMessageSchema = z.object({
  message: z.any(), // AgentOSMessage - circular reference
  signature: z.string(),
  algorithm: z.string(),
  keyId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Encrypted Message - encrypted message
 */
export interface EncryptedMessage {
  data: string;
  algorithm: string;
  keyId: string;
  iv: string;
  timestamp: string; // ISO8601
}

export const EncryptedMessageSchema = z.object({
  data: z.string(),
  algorithm: z.string(),
  keyId: z.string(),
  iv: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Message Security Interface
 */
export interface MessageSecurity {
  sign(message: AgentOSMessage, key: CryptoKey): Promise<SignedMessage>;
  verify(signedMessage: SignedMessage): Promise<boolean>;
  encrypt(message: AgentOSMessage, key: CryptoKey): Promise<EncryptedMessage>;
  decrypt(encryptedMessage: EncryptedMessage, key: CryptoKey): Promise<AgentOSMessage>;
}

/**
 * Security Policy - security configuration
 */
export interface SecurityPolicy {
  encryptionRequired: boolean;
  signatureRequired: boolean;
  allowedAlgorithms: string[];
  keyRotationInterval: number; // seconds
  maxTokenAge: number; // seconds
  auditLogging: boolean;
}

export const SecurityPolicySchema = z.object({
  encryptionRequired: z.boolean(),
  signatureRequired: z.boolean(),
  allowedAlgorithms: z.array(z.string()),
  keyRotationInterval: z.number(),
  maxTokenAge: z.number(),
  auditLogging: z.boolean(),
});

/**
 * Permission - agent permission
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: string[];
  conditions?: PermissionCondition[];
}

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  resource: z.string(),
  actions: z.array(z.string()),
  conditions: z.array(PermissionConditionSchema).optional(),
});

/**
 * Permission Condition - condition for permission evaluation
 */
export interface PermissionCondition {
  type: 'time' | 'ip' | 'resource' | 'custom';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: unknown;
  description?: string;
}

export const PermissionConditionSchema = z.object({
  type: z.enum(['time', 'ip', 'resource', 'custom']),
  operator: z.enum(['equals', 'not_equals', 'in', 'not_in', 'greater_than', 'less_than']),
  value: z.unknown(),
  description: z.string().optional(),
});

/**
 * Authorization Result - result of permission check
 */
export interface AuthorizationResult {
  allowed: boolean;
  permission?: string;
  reason?: string;
  conditions?: string[];
}

export const AuthorizationResultSchema = z.object({
  allowed: z.boolean(),
  permission: z.string().optional(),
  reason: z.string().optional(),
  conditions: z.array(z.string()).optional(),
});

/**
 * Authorization Interface
 */
export interface Authorization {
  check(agentId: string, resource: string, action: string, context?: Record<string, unknown>): Promise<AuthorizationResult>;
  grant(agentId: string, permission: Permission): Promise<void>;
  revoke(agentId: string, permissionId: string): Promise<void>;
  list(agentId: string): Promise<Permission[]>;
}

/**
 * Audit Log - security audit entry
 */
export interface AuditLog {
  id: string;
  timestamp: string; // ISO8601
  agentId: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'denied';
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const AuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  agentId: z.string(),
  action: z.string(),
  resource: z.string(),
  outcome: z.enum(['success', 'failure', 'denied']),
  details: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

/**
 * Security Context - security information for message processing
 */
export interface SecurityContext {
  agentId: string;
  authenticated: boolean;
  permissions: string[];
  tokenExpiry?: string; // ISO8601
  securityLevel: 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';
  metadata?: Record<string, unknown>;
}

export const SecurityContextSchema = z.object({
  agentId: z.string(),
  authenticated: z.boolean(),
  permissions: z.array(z.string()),
  tokenExpiry: z.string().datetime().optional(),
  securityLevel: z.enum(['public', 'internal', 'confidential', 'secret', 'top_secret']),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Helper functions
 */
export function createAgentCredentials(
  type: AgentCredentials['type'],
  value: string,
  metadata?: Record<string, unknown>
): AgentCredentials {
  return { type, value, metadata };
}

export function createAuthToken(
  token: string,
  type: string,
  expiresAt: string,
  scopes: string[],
  agentId: string
): AuthToken {
  return { token, type, expiresAt, scopes, agentId };
}

export function createSignedMessage(
  message: AgentOSMessage,
  signature: string,
  algorithm: string,
  keyId: string
): SignedMessage {
  return {
    message,
    signature,
    algorithm,
    keyId,
    timestamp: new Date().toISOString(),
  };
}

export function createEncryptedMessage(
  data: string,
  algorithm: string,
  keyId: string,
  iv: string
): EncryptedMessage {
  return {
    data,
    algorithm,
    keyId,
    iv,
    timestamp: new Date().toISOString(),
  };
}

export function createPermission(
  id: string,
  name: string,
  description: string,
  resource: string,
  actions: string[]
): Permission {
  return { id, name, description, resource, actions };
}

export function createPermissionCondition(
  type: PermissionCondition['type'],
  operator: PermissionCondition['operator'],
  value: unknown,
  description?: string
): PermissionCondition {
  return { type, operator, value, description };
}

export function createAuthorizationResult(
  allowed: boolean,
  permission?: string,
  reason?: string
): AuthorizationResult {
  return { allowed, permission, reason };
}

export function createAuditLog(
  agentId: string,
  action: string,
  resource: string,
  outcome: AuditLog['outcome'],
  details?: Record<string, unknown>
): AuditLog {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    agentId,
    action,
    resource,
    outcome,
    details,
  };
}

export function createSecurityContext(
  agentId: string,
  authenticated: boolean,
  permissions: string[],
  securityLevel: SecurityContext['securityLevel']
): SecurityContext {
  return { agentId, authenticated, permissions, securityLevel };
}