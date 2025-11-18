import type { Channel, ConfirmChannel, ConsumeMessage, Options } from 'amqplib';
import type { MessagingInstrumentation } from './instrumentation.js';

export type EventRecord<T = unknown> = {
  id: string;
  sid?: string;
  ts: number;
  topic: string;
  key?: string;
  partition?: number;
  headers?: Record<string, unknown>;
  payload: T;
  caused_by?: string[];
  tags?: string[];
};

export type PublishOptions = {
  readonly id?: string;
  readonly ts?: number;
  readonly headers?: Record<string, unknown>;
  readonly key?: string;
  readonly tags?: string[];
  readonly caused_by?: string[];
  readonly sid?: string;
  readonly partition?: number;
};

export type RabbitExchangeConfig = {
  readonly name: string;
  readonly type?: 'topic' | 'direct' | 'fanout' | 'headers';
  readonly durable?: boolean;
  readonly autoDelete?: boolean;
  readonly internal?: boolean;
};

export type RabbitQueueConfig = {
  readonly name?: string;
  readonly durable?: boolean;
  readonly exclusive?: boolean;
  readonly autoDelete?: boolean;
  readonly deadLetterExchange?: string;
  readonly deadLetterRoutingKey?: string;
  readonly messageTtl?: number;
  readonly expires?: number;
  readonly maxPriority?: number;
  readonly arguments?: Options.AssertQueue['arguments'];
};

export type RabbitReconnectConfig = {
  readonly retries?: number;
  readonly intervalMs?: number;
  readonly maxIntervalMs?: number;
};

export type RabbitConnectionConfig = {
  readonly url: string;
  readonly namespace?: string;
  readonly socketOptions?: Options.Connect;
  readonly exchange?: RabbitExchangeConfig;
  readonly defaultQueue?: RabbitQueueConfig;
  readonly prefetch?: number;
  readonly reconnect?: RabbitReconnectConfig;
};

export type RabbitConnectionManagerLike = {
  withConfirmChannel<T>(fn: (channel: ConfirmChannel) => Promise<T>): Promise<T>;
  createChannel(): Promise<Channel>;
  close(): Promise<void>;
};

export type RabbitContextOptions = {
  readonly config?: RabbitConnectionConfig;
  readonly instrumentation?: MessagingInstrumentation;
  readonly manager?: RabbitConnectionManagerLike;
};

export type RabbitPublishOptions = PublishOptions & {
  readonly exchange?: string;
  readonly routingKey?: string;
  readonly persistent?: boolean;
  readonly confirm?: boolean;
  readonly replyTo?: string;
  readonly correlationId?: string;
};

export type RabbitSubscription = {
  readonly queue?: string;
  readonly exchange?: string;
  readonly exchangeType?: 'topic' | 'direct' | 'fanout' | 'headers';
  readonly routingKeys?: readonly string[];
  readonly durable?: boolean;
  readonly deadLetterExchange?: string;
  readonly deadLetterRoutingKey?: string;
  readonly prefetch?: number;
  readonly autoAck?: boolean;
  readonly exclusive?: boolean;
  readonly queueOptions?: Options.AssertQueue;
  readonly consumerOptions?: Options.Consume;
};

export type RabbitEnvelope<T = unknown> = {
  readonly topic: string;
  readonly payload: T;
  readonly headers: Record<string, unknown>;
  readonly properties: ConsumeMessage['properties'];
  readonly raw: ConsumeMessage;
};

export type RabbitAckControls = {
  ack(): Promise<void>;
  nack(requeue?: boolean): Promise<void>;
  reject(requeue?: boolean): Promise<void>;
};

export type RabbitDeliveryHandler<T = unknown> = (
  envelope: RabbitEnvelope<T>,
  controls: RabbitAckControls,
) => Promise<void> | void;

export type RpcRequestOptions = {
  readonly timeoutMs?: number;
  readonly headers?: Record<string, unknown>;
  readonly persistent?: boolean;
};

export type RpcHandlerOptions = {
  readonly prefetch?: number;
  readonly autoAck?: boolean;
  readonly persistent?: boolean;
};

export type RpcResponder<TReq = unknown, TRes = unknown> = (
  envelope: RabbitEnvelope<TReq>,
  helpers: RabbitAckControls & {
    reply(payload: TRes): Promise<void>;
  },
) => Promise<void>;

export type RabbitContext = {
  publish<T>(topic: string, payload: T, opts?: RabbitPublishOptions): Promise<EventRecord<T>>;
  subscribe(
    binding: RabbitSubscription,
    handler: RabbitDeliveryHandler,
  ): Promise<() => Promise<void>>;
  request<TRequest, TResponse>(
    queue: string,
    payload: TRequest,
    opts?: RpcRequestOptions,
  ): Promise<TResponse>;
  respond<TRequest, TResponse>(
    queue: string,
    handler: RpcResponder<TRequest, TResponse>,
    opts?: RabbitSubscription & RpcHandlerOptions,
  ): Promise<() => Promise<void>>;
  close(): Promise<void>;
};

export type BasicMessage = {
  readonly from: string;
  readonly to: string;
  readonly content: string;
};

export type RabbitMessageBusRouting = {
  readonly topicPrefix?: string;
  readonly buildTopic?: (msg: BasicMessage) => string;
  readonly buildRoutingKey?: (msg: BasicMessage) => string;
};

export type RabbitMessageBusOptions = {
  readonly context?: RabbitContext;
  readonly contextOptions?: RabbitContextOptions;
  readonly exchange?: string;
  readonly namespace?: string;
  readonly routing?: RabbitMessageBusRouting;
  readonly subscription?: RabbitSubscription;
};

export type BasicMessageBus = {
  send(msg: BasicMessage): Promise<void>;
  subscribe(handler: (msg: BasicMessage) => void): () => void;
};
