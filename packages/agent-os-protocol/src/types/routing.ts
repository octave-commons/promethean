/**
 * Message Routing Types for Agent OS
 * 
 * Defines message forwarding, broadcasting, and routing structures.
 */

import { z } from 'zod';
import type { AgentIdentifier, AgentSelector } from './agent.js';
import type { AgentOSMessage } from './message.js';
import type { RetryPolicy } from './job-queue.js';

/**
 * Route Options - how to route a message
 */
export interface RouteOptions {
  timeout?: number;
  retryPolicy?: RetryPolicy;
  transform?: MessageTransform;
}

export const RouteOptionsSchema = z.object({
  timeout: z.number().optional(),
  retryPolicy: z.any().optional(), // RetryPolicy - circular reference
  transform: MessageTransformSchema.optional(),
});

/**
 * Message Transform - how to modify a message during routing
 */
export interface MessageTransform {
  type: 'header' | 'payload' | 'full';
  operation: 'add' | 'remove' | 'modify';
  path?: string; // JSONPath for payload transforms
  value?: unknown;
}

export const MessageTransformSchema = z.object({
  type: z.enum(['header', 'payload', 'full']),
  operation: z.enum(['add', 'remove', 'modify']),
  path: z.string().optional(),
  value: z.unknown().optional(),
});

/**
 * Delivery Status - result of message delivery
 */
export enum DeliveryStatus {
  DELIVERED = 'delivered',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  REJECTED = 'rejected',
}

export const DeliveryStatusSchema = z.nativeEnum(DeliveryStatus);

/**
 * Routing Result - result of routing a message
 */
export interface RoutingResult {
  success: boolean;
  route: RouteInfo;
  delivery?: DeliveryResult;
  alternatives?: RouteInfo[];
}

export const RoutingResultSchema = z.object({
  success: z.boolean(),
  route: RouteInfoSchema,
  delivery: DeliveryResultSchema.optional(),
  alternatives: z.array(RouteInfoSchema).optional(),
});

/**
 * Route Info - information about a specific route
 */
export interface RouteInfo {
  id: string;
  priority: number;
  targetAgent: AgentIdentifier;
  endpoint: string;
  estimatedLatency?: number; // milliseconds
  cost?: number;
  metadata?: Record<string, unknown>;
}

export const RouteInfoSchema = z.object({
  id: z.string(),
  priority: z.number(),
  targetAgent: z.any(), // AgentIdentifier - circular reference
  endpoint: z.string(),
  estimatedLatency: z.number().optional(),
  cost: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Delivery Result - detailed delivery information
 */
export interface DeliveryResult {
  messageId: string;
  agentId: string;
  status: DeliveryStatus;
  result?: unknown;
  error?: string;
  deliveredAt?: string; // ISO8601
  duration?: number; // milliseconds
  attempts: number;
}

export const DeliveryResultSchema = z.object({
  messageId: z.string(),
  agentId: z.string(),
  status: DeliveryStatusSchema,
  result: z.unknown().optional(),
  error: z.string().optional(),
  deliveredAt: z.string().datetime().optional(),
  duration: z.number().optional(),
  attempts: z.number(),
});

/**
 * Broadcast Options - how to broadcast a message
 */
export interface BroadcastOptions {
  parallel?: boolean;
  timeout?: number;
  aggregation?: AggregationStrategy;
}

export const BroadcastOptionsSchema = z.object({
  parallel: z.boolean().optional(),
  timeout: z.number().optional(),
  aggregation: AggregationStrategySchema.optional(),
});

/**
 * Aggregation Strategy - how to aggregate broadcast results
 */
export interface AggregationStrategy {
  type: 'all' | 'any' | 'majority' | 'first';
  timeout?: number;
}

export const AggregationStrategySchema = z.object({
  type: z.enum(['all', 'any', 'majority', 'first']),
  timeout: z.number().optional(),
});

/**
 * Broadcast Result - result of broadcasting a message
 */
export interface BroadcastResult {
  messageId: string;
  deliveries: DeliveryResult[];
  summary?: BroadcastSummary;
}

export const BroadcastResultSchema = z.object({
  messageId: z.string(),
  deliveries: z.array(DeliveryResultSchema),
  summary: BroadcastSummarySchema.optional(),
});

/**
 * Broadcast Summary - summary of broadcast results
 */
export interface BroadcastSummary {
  total: number;
  successful: number;
  failed: number;
  timeout: number;
}

export const BroadcastSummarySchema = z.object({
  total: z.number(),
  successful: z.number(),
  failed: z.number(),
  timeout: z.number(),
});

/**
 * Route Pattern - pattern for matching messages to routes
 */
export interface RoutePattern {
  id: string;
  priority: number;
  condition: RouteCondition;
  target: RouteTarget;
}

export const RoutePatternSchema = z.object({
  id: z.string(),
  priority: z.number(),
  condition: RouteConditionSchema,
  target: RouteTargetSchema,
});

/**
 * Route Condition - condition for matching messages
 */
export interface RouteCondition {
  agentType?: string;
  capability?: string;
  messageType?: string;
  custom?: (message: AgentOSMessage) => boolean;
}

export const RouteConditionSchema = z.object({
  agentType: z.string().optional(),
  capability: z.string().optional(),
  messageType: z.string().optional(),
  custom: z.function().optional(),
});

/**
 * Route Target - where to route matching messages
 */
export interface RouteTarget {
  agentId?: string;
  agentType?: string;
  endpoint?: string;
  loadBalancing?: LoadBalancingStrategy;
}

export const RouteTargetSchema = z.object({
  agentId: z.string().optional(),
  agentType: z.string().optional(),
  endpoint: z.string().optional(),
  loadBalancing: LoadBalancingStrategySchema.optional(),
});

/**
 * Load Balancing Strategy - how to select among multiple targets
 */
export enum LoadBalancingStrategy {
  ROUND_ROBIN = 'round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  LEAST_RESPONSE_TIME = 'least_response_time',
  RANDOM = 'random',
  WEIGHTED = 'weighted',
}

export const LoadBalancingStrategySchema = z.nativeEnum(LoadBalancingStrategy);

/**
 * Message Router Interface
 */
export interface MessageRouter {
  route(message: AgentOSMessage): Promise<RoutingResult>;
  addRoute(pattern: RoutePattern, handler: RouteHandler): void;
  removeRoute(routeId: string): void;
  getRoutes(): RouteInfo[];
  updateRoute(routeId: string, pattern: Partial<RoutePattern>): void;
}

/**
 * Route Handler - function to handle routed messages
 */
export type RouteHandler = (message: AgentOSMessage, route: RoutePattern) => Promise<DeliveryResult>;

/**
 * Helper functions
 */
export function createRouteOptions(
  timeout?: number,
  retryPolicy?: RetryPolicy,
  transform?: MessageTransform
): RouteOptions {
  return { timeout, retryPolicy, transform };
}

export function createMessageTransform(
  type: MessageTransform['type'],
  operation: MessageTransform['operation'],
  path?: string,
  value?: unknown
): MessageTransform {
  return { type, operation, path, value };
}

export function createBroadcastOptions(
  parallel?: boolean,
  timeout?: number,
  aggregation?: AggregationStrategy
): BroadcastOptions {
  return { parallel, timeout, aggregation };
}

export function createAggregationStrategy(
  type: AggregationStrategy['type'],
  timeout?: number
): AggregationStrategy {
  return { type, timeout };
}

export function createRoutePattern(
  id: string,
  priority: number,
  condition: RouteCondition,
  target: RouteTarget
): RoutePattern {
  return { id, priority, condition, target };
}

export function createRouteCondition(
  agentType?: string,
  capability?: string,
  messageType?: string
): RouteCondition {
  return { agentType, capability, messageType };
}

export function createRouteTarget(
  agentId?: string,
  agentType?: string,
  endpoint?: string,
  loadBalancing?: LoadBalancingStrategy
): RouteTarget {
  return { agentId, agentType, endpoint, loadBalancing };
}