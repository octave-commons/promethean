/**
 * Event System Types for Agent OS
 * 
 * Defines event publishing, subscription, and filtering structures.
 */

import { z } from 'zod';
import type { AgentIdentifier, AgentSelector, MessagePriority } from './agent.js';

/**
 * Agent Event - an event published by an agent
 */
export interface AgentEvent {
  id?: string;
  type: string;
  source: AgentIdentifier;
  data: unknown;
  timestamp: string; // ISO8601
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export const AgentEventSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  source: z.any(), // AgentIdentifier - circular reference
  data: z.unknown(),
  timestamp: z.string().datetime(),
  correlationId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Event Filter - for subscribing to specific events
 */
export interface EventFilter {
  sourceAgents?: AgentIdentifier[];
  eventTypes?: string[];
  patterns?: EventPattern[];
  priority?: MessagePriority[];
}

export const EventFilterSchema = z.object({
  sourceAgents: z.array(z.any()).optional(), // AgentIdentifier - circular reference
  eventTypes: z.array(z.string()).optional(),
  patterns: z.array(EventPatternSchema).optional(),
  priority: z.array(z.enum(['critical', 'high', 'normal', 'low', 'background'])).optional(),
});

/**
 * Event Pattern - for flexible event matching
 */
export interface EventPattern {
  type: 'regex' | 'glob' | 'jsonpath';
  pattern: string;
  field?: string; // field to match against
}

export const EventPatternSchema = z.object({
  type: z.enum(['regex', 'glob', 'jsonpath']),
  pattern: z.string(),
  field: z.string().optional(),
});

/**
 * Subscription Options - how to deliver events
 */
export interface SubscriptionOptions {
  durable?: boolean;
  bufferSize?: number;
  timeout?: number;
  delivery?: DeliveryMode;
}

export const SubscriptionOptionsSchema = z.object({
  durable: z.boolean().optional(),
  bufferSize: z.number().optional(),
  timeout: z.number().optional(),
  delivery: DeliveryModeSchema.optional(),
});

/**
 * Delivery Mode - how events are delivered to subscribers
 */
export enum DeliveryMode {
  IMMEDIATE = 'immediate',
  BATCHED = 'batched',
  POLLING = 'polling',
}

export const DeliveryModeSchema = z.nativeEnum(DeliveryMode);

/**
 * Subscription Status - current state of a subscription
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  ERROR = 'error',
}

export const SubscriptionStatusSchema = z.nativeEnum(SubscriptionStatus);

/**
 * Event Subscription - represents an active subscription
 */
export interface EventSubscription {
  id: string;
  filter: EventFilter;
  options: SubscriptionOptions;
  status: SubscriptionStatus;
  subscriberId: string;
  createdAt: string; // ISO8601
  expiresAt?: string; // ISO8601
  lastEventAt?: string; // ISO8601
  eventCount: number;
}

export const EventSubscriptionSchema = z.object({
  id: z.string(),
  filter: EventFilterSchema,
  options: SubscriptionOptionsSchema,
  status: SubscriptionStatusSchema,
  subscriberId: z.string(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  lastEventAt: z.string().datetime().optional(),
  eventCount: z.number(),
});

/**
 * Publish Options - how to publish an event
 */
export interface PublishOptions {
  targetAgents?: AgentSelector;
  priority?: MessagePriority;
  ttl?: number; // seconds
  persistent?: boolean;
}

export const PublishOptionsSchema = z.object({
  targetAgents: z.any().optional(), // AgentSelector - circular reference
  priority: z.enum(['critical', 'high', 'normal', 'low', 'background']).optional(),
  ttl: z.number().optional(),
  persistent: z.boolean().optional(),
});

/**
 * Event Delivery Result - result of publishing an event
 */
export interface EventDeliveryResult {
  eventId: string;
  delivered: number;
  failed: number;
  timestamp: string; // ISO8601
  errors?: DeliveryError[];
}

export const EventDeliveryResultSchema = z.object({
  eventId: z.string(),
  delivered: z.number(),
  failed: z.number(),
  timestamp: z.string().datetime(),
  errors: z.array(DeliveryErrorSchema).optional(),
});

/**
 * Delivery Error - details about failed event delivery
 */
export interface DeliveryError {
  subscriptionId: string;
  subscriberId: string;
  error: string;
  retryable: boolean;
}

export const DeliveryErrorSchema = z.object({
  subscriptionId: z.string(),
  subscriberId: z.string(),
  error: z.string(),
  retryable: z.boolean(),
});

/**
 * Event Handler - function to handle received events
 */
export type EventHandler = (event: AgentEvent) => Promise<void> | void;

/**
 * Event Bus Interface - core event system interface
 */
export interface EventBus {
  publish(event: AgentEvent, options?: PublishOptions): Promise<EventDeliveryResult>;
  subscribe(filter: EventFilter, handler: EventHandler, options?: SubscriptionOptions): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<void>;
  getSubscription(subscriptionId: string): Promise<EventSubscription | null>;
  listSubscriptions(subscriberId?: string): Promise<EventSubscription[]>;
  pauseSubscription(subscriptionId: string): Promise<void>;
  resumeSubscription(subscriptionId: string): Promise<void>;
}

/**
 * Helper functions
 */
export function createAgentEvent(
  type: string,
  source: AgentIdentifier,
  data: unknown,
  options?: Partial<AgentEvent>
): AgentEvent {
  return {
    type,
    source,
    data,
    timestamp: new Date().toISOString(),
    ...options,
  };
}

export function createEventFilter(
  eventTypes?: string[],
  sourceAgents?: AgentIdentifier[],
  patterns?: EventPattern[]
): EventFilter {
  return {
    eventTypes,
    sourceAgents,
    patterns,
  };
}

export function createEventPattern(
  type: EventPattern['type'],
  pattern: string,
  field?: string
): EventPattern {
  return { type, pattern, field };
}

export function createSubscriptionOptions(
  delivery?: DeliveryMode,
  durable?: boolean,
  bufferSize?: number
): SubscriptionOptions {
  return {
    delivery,
    durable,
    bufferSize,
  };
}

export function createPublishOptions(
  priority?: MessagePriority,
  ttl?: number,
  persistent?: boolean
): PublishOptions {
  return {
    priority,
    ttl,
    persistent,
  };
}