/**
 * Event system interfaces
 */

import type { EventRecord, UUID, Millis } from './types.js';

export interface EventFilter {
    readonly topic?: string | string[];
    readonly key?: string;
    readonly tags?: string[];
    readonly afterId?: UUID;
    readonly fromTs?: Millis;
    readonly toTs?: Millis;
    readonly limit?: number;
}

export interface EventSubscription {
    readonly id: string;
    readonly topic: string;
    readonly group: string;
    readonly handler: (event: EventRecord, context: EventDeliveryContext) => Promise<void>;
    readonly options: EventSubscriptionOptions;
    readonly active: boolean;
    readonly createdAt: Millis;
}

export interface EventSubscriptionOptions {
    readonly from?: 'latest' | 'earliest' | 'ts' | 'afterId';
    readonly ts?: Millis;
    readonly afterId?: UUID;
    readonly batchSize?: number;
    readonly maxInFlight?: number;
    readonly ackTimeoutMs?: number;
    readonly maxAttempts?: number;
    readonly manualAck?: boolean;
    readonly filter?: (event: EventRecord) => boolean;
}

export interface EventDeliveryContext {
    readonly attempt: number;
    readonly maxAttempts: number;
    readonly cursor?: EventCursor;
    readonly subscriptionId: string;
    readonly deliveredAt: Millis;
}

export interface EventCursor {
    readonly topic: string;
    readonly lastId?: UUID;
    readonly lastTs?: Millis;
    readonly position?: number;
}

export interface EventStoreStats {
    readonly totalEvents: number;
    readonly eventsByTopic: Record<string, number>;
    readonly oldestEvent?: Millis;
    readonly newestEvent?: Millis;
    readonly storageSize?: number;
}

export interface EventBusMetrics {
    readonly publishedEvents: number;
    readonly deliveredEvents: number;
    readonly failedDeliveries: number;
    readonly activeSubscriptions: number;
    readonly averageDeliveryTime: number;
    readonly queueDepth: number;
}
