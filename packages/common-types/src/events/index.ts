import { z } from 'zod';

export interface EventContext {
  readonly correlationId?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly timestamp: Date;
  readonly source: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface Event<T = unknown> {
  readonly id: string;
  readonly type: string;
  readonly data: T;
  readonly context: EventContext;
  readonly version: number;
}

export interface EventHandler<T = unknown> {
  readonly eventType: string;
  readonly handler: (event: Event<T>, context: EventContext) => Promise<void> | void;
  readonly options?: {
    readonly once?: boolean;
    readonly priority?: number;
    readonly timeout?: number;
  };
}

export interface EventBus {
  publish<T = unknown>(event: Event<T>): Promise<void>;
  subscribe<T = unknown>(eventType: string, handler: EventHandler<T>): () => void;
  unsubscribe(eventType: string, handler: EventHandler): void;
  clear(): void;
}

export interface EventStore {
  append(event: Event): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<ReadonlyArray<Event>>;
  getEventsByType(eventType: string, from?: Date, to?: Date): Promise<ReadonlyArray<Event>>;
  getEventsByCorrelation(correlationId: string): Promise<ReadonlyArray<Event>>;
}

export const EventContextSchema = z.object({
  correlationId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.date(),
  source: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export const EventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.unknown(),
  context: EventContextSchema,
  version: z.number(),
});

export const EventHandlerSchema = z.object({
  eventType: z.string(),
  handler: z.function(),
  options: z
    .object({
      once: z.boolean().optional(),
      priority: z.number().optional(),
      timeout: z.number().optional(),
    })
    .optional(),
});

export type EventFilter = {
  eventType?: string;
  correlationId?: string;
  userId?: string;
  from?: Date;
  to?: Date;
};

export type EventMiddleware = (event: Event, next: () => Promise<void>) => Promise<void>;
export type EventAggregator<T> = (events: ReadonlyArray<Event>) => T;
