/**
 * Agent Registry Types for Agent OS
 * 
 * Defines agent discovery, registration, and management structures.
 */

import { z } from 'zod';
import type { AgentIdentifier, AgentInfo, AgentSelector, AgentStatus } from './agent.js';

/**
 * Agent Registry Interface - central registry for agent management
 */
export interface AgentRegistry {
  register(agent: AgentInfo, ttl?: number): Promise<string>;
  unregister(agentId: string): Promise<void>;
  get(agentId: string): Promise<AgentInfo | null>;
  list(filter?: AgentFilter): Promise<AgentInfo[]>;
  update(agentId: string, updates: Partial<AgentInfo>): Promise<void>;
  discover(query: AgentDiscoveryQuery): Promise<AgentInfo[]>;
  getStatus(agentId: string): Promise<AgentStatus>;
  heartbeat(agentId: string): Promise<void>;
  cleanup(): Promise<void>; // Remove expired agents
}

/**
 * Agent Filter - for filtering agent lists
 */
export interface AgentFilter {
  status?: AgentStatus[];
  type?: string[];
  capabilities?: string[];
  team?: string[];
  limit?: number;
  offset?: number;
}

export const AgentFilterSchema = z.object({
  status: z.array(z.enum(['online', 'offline', 'busy', 'maintenance', 'error'])).optional(),
  type: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  team: z.array(z.string()).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

/**
 * Agent Discovery Query - for finding agents with specific requirements
 */
export interface AgentDiscoveryQuery {
  requiredCapabilities: string[];
  minimumProficiency?: number;
  excludedCapabilities?: string[];
  teamFilter?: string[];
  statusFilter?: AgentStatus[];
  availabilityWindow?: {
    start: string; // ISO8601
    end: string; // ISO8601
  };
  maxWorkload?: number;
  locationConstraint?: string;
  costBudget?: number;
  securityLevel?: string;
  limit?: number;
}

export const AgentDiscoveryQuerySchema = z.object({
  requiredCapabilities: z.array(z.string()),
  minimumProficiency: z.number().optional(),
  excludedCapabilities: z.array(z.string()).optional(),
  teamFilter: z.array(z.string()).optional(),
  statusFilter: z.array(z.enum(['online', 'offline', 'busy', 'maintenance', 'error'])).optional(),
  availabilityWindow: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  maxWorkload: z.number().optional(),
  locationConstraint: z.string().optional(),
  costBudget: z.number().optional(),
  securityLevel: z.string().optional(),
  limit: z.number().optional(),
});

/**
 * Registration Result - result of agent registration
 */
export interface RegistrationResult {
  success: boolean;
  agentId: string;
  expiresAt?: string; // ISO8601
  message?: string;
}

export const RegistrationResultSchema = z.object({
  success: z.boolean(),
  agentId: z.string(),
  expiresAt: z.string().datetime().optional(),
  message: z.string().optional(),
});

/**
 * Registry Statistics - registry performance metrics
 */
export interface RegistryStats {
  totalAgents: number;
  agentsByStatus: Record<AgentStatus, number>;
  agentsByType: Record<string, number>;
  registrationsToday: number;
  unregistrationsToday: number;
  averageRegistrationDuration: number; // milliseconds
  lastCleanup?: string; // ISO8601
}

export const RegistryStatsSchema = z.object({
  totalAgents: z.number(),
  agentsByStatus: z.record(z.enum(['online', 'offline', 'busy', 'maintenance', 'error']), z.number()),
  agentsByType: z.record(z.string(), z.number()),
  registrationsToday: z.number(),
  unregistrationsToday: z.number(),
  averageRegistrationDuration: z.number(),
  lastCleanup: z.string().datetime().optional(),
});

/**
 * Registry Configuration - registry settings
 */
export interface RegistryConfig {
  defaultTTL: number; // seconds
  cleanupInterval: number; // milliseconds
  maxAgents: number;
  persistenceEnabled: boolean;
  persistenceBackend: 'memory' | 'redis' | 'database';
  encryptionEnabled: boolean;
  auditLogging: boolean;
}

export const RegistryConfigSchema = z.object({
  defaultTTL: z.number(),
  cleanupInterval: z.number(),
  maxAgents: z.number(),
  persistenceEnabled: z.boolean(),
  persistenceBackend: z.enum(['memory', 'redis', 'database']),
  encryptionEnabled: z.boolean(),
  auditLogging: z.boolean(),
});

/**
 * Registry Event - events emitted by the registry
 */
export interface RegistryEvent {
  type: 'agent_registered' | 'agent_unregistered' | 'agent_updated' | 'agent_expired' | 'cleanup_performed';
  timestamp: string; // ISO8601
  agentId?: string;
  data?: Record<string, unknown>;
}

export const RegistryEventSchema = z.object({
  type: z.enum(['agent_registered', 'agent_unregistered', 'agent_updated', 'agent_expired', 'cleanup_performed']),
  timestamp: z.string().datetime(),
  agentId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

/**
 * Registry Event Handler
 */
export type RegistryEventHandler = (event: RegistryEvent) => void;

/**
 * Registry Interface with Event Support
 */
export interface AgentRegistryWithEvents extends AgentRegistry {
  on(event: RegistryEvent['type'], handler: RegistryEventHandler): void;
  off(event: RegistryEvent['type'], handler: RegistryEventHandler): void;
  getEvents(filter?: RegistryEventFilter): Promise<RegistryEvent[]>;
}

/**
 * Registry Event Filter - for filtering registry events
 */
export interface RegistryEventFilter {
  eventTypes?: RegistryEvent['type'][];
  agentId?: string;
  after?: string; // ISO8601
  before?: string; // ISO8601
  limit?: number;
}

export const RegistryEventFilterSchema = z.object({
  eventTypes: z.array(z.enum(['agent_registered', 'agent_unregistered', 'agent_updated', 'agent_expired', 'cleanup_performed'])).optional(),
  agentId: z.string().optional(),
  after: z.string().datetime().optional(),
  before: z.string().datetime().optional(),
  limit: z.number().optional(),
});

/**
 * Helper functions
 */
export function createAgentFilter(
  status?: AgentStatus[],
  type?: string[],
  capabilities?: string[],
  limit?: number
): AgentFilter {
  return {
    status,
    type,
    capabilities,
    limit,
  };
}

export function createAgentDiscoveryQuery(
  requiredCapabilities: string[],
  options?: Partial<AgentDiscoveryQuery>
): AgentDiscoveryQuery {
  return {
    requiredCapabilities,
    ...options,
  };
}

export function createRegistrationResult(
  success: boolean,
  agentId: string,
  expiresAt?: string,
  message?: string
): RegistrationResult {
  return { success, agentId, expiresAt, message };
}

export function createRegistryStats(
  totalAgents: number,
  agentsByStatus: Record<AgentStatus, number>,
  agentsByType: Record<string, number>,
  options?: Partial<RegistryStats>
): RegistryStats {
  return {
    totalAgents,
    agentsByStatus,
    agentsByType,
    registrationsToday: 0,
    unregistrationsToday: 0,
    averageRegistrationDuration: 0,
    ...options,
  };
}

export function createRegistryConfig(
  defaultTTL: number,
  cleanupInterval: number,
  maxAgents: number,
  options?: Partial<RegistryConfig>
): RegistryConfig {
  return {
    defaultTTL,
    cleanupInterval,
    maxAgents,
    persistenceEnabled: true,
    persistenceBackend: 'memory',
    encryptionEnabled: false,
    auditLogging: true,
    ...options,
  };
}

export function createRegistryEvent(
  type: RegistryEvent['type'],
  agentId?: string,
  data?: Record<string, unknown>
): RegistryEvent {
  return {
    type,
    timestamp: new Date().toISOString(),
    agentId,
    data,
  };
}

export function createRegistryEventFilter(
  eventTypes?: RegistryEvent['type'][],
  agentId?: string,
  after?: string,
  before?: string
): RegistryEventFilter {
  return {
    eventTypes,
    agentId,
    after,
    before,
  };
}