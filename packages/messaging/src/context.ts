import { randomUUID } from 'crypto';
import type { Channel, ConfirmChannel, ConsumeMessage } from 'amqplib';
import { createRabbitConnectionManager } from './connection.js';
import type { EventRecord } from './types.js';
import { DEFAULT_CONFIG, DEFAULT_NAMESPACE, formatQueueName } from './config.js';
import type { MessagingInstrumentation } from './instrumentation.js';
import {
  type RabbitContext,
  type RabbitPublishOptions,
  type RabbitSubscription,
  type RabbitEnvelope,
  type RabbitAckControls,
  type RpcRequestOptions,
  type RpcResponder,
  type RpcHandlerOptions,
  type RabbitContextOptions,
} from './types.js';

const JSON_CONTENT_TYPE = 'application/json';
const DEFAULT_TIMEOUT_MS = 5000;

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value));

const ensureExchange = async (
  channel: Channel | ConfirmChannel,
  binding: {
    name: string;
    type?: string;
    durable?: boolean;
  },
): Promise<void> => {
  await channel.assertExchange(binding.name, binding.type ?? 'topic', {
    durable: binding.durable ?? true,
  });
};

const ensureQueue = async (
  channel: Channel,
  name: string,
  options: Parameters<Channel['assertQueue']>[1],
): Promise<void> => {
  await channel.assertQueue(name, options);
};

const toBuffer = (value: unknown): Buffer => {
  if (Buffer.isBuffer(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return Buffer.from(value, 'utf8');
  }
  return Buffer.from(JSON.stringify(value), 'utf8');
};

const parseEnvelope = <T>(msg: ConsumeMessage): RabbitEnvelope<T> => {
  const content = msg.content?.toString('utf8') ?? '';
  let parsed: unknown = content;
  if (
    msg.properties.contentType === JSON_CONTENT_TYPE ||
    msg.properties.contentType === undefined
  ) {
    try {
      parsed = content.length ? JSON.parse(content) : null;
    } catch {
      parsed = content;
    }
  }

  if (typeof parsed === 'object' && parsed !== null && 'topic' in parsed && 'payload' in parsed) {
    const record = parsed as EventRecord<T>;
    return {
      topic: record.topic,
      payload: record.payload,
      headers: record.headers ?? {},
      properties: msg.properties,
      raw: msg,
    };
  }

  return {
    topic: msg.fields.routingKey,
    payload: parsed as T,
    headers: (msg.properties.headers as Record<string, unknown>) ?? {},
    properties: msg.properties,
    raw: msg,
  };
};

const createAckControls = (channel: Channel, message: ConsumeMessage): RabbitAckControls => {
  let settled = false;
  return {
    async ack() {
      if (settled) return;
      channel.ack(message);
      settled = true;
    },
    async nack(requeue = false) {
      if (settled) return;
      channel.nack(message, false, requeue);
      settled = true;
    },
    async reject(requeue = false) {
      if (settled) return;
      channel.reject(message, requeue);
      settled = true;
    },
  };
};

const buildRecord = <T>(topic: string, payload: T, opts?: RabbitPublishOptions): EventRecord<T> => {
  return {
    id: opts?.id ?? randomUUID(),
    ts: opts?.ts ?? Date.now(),
    topic,
    key: opts?.key,
    headers: opts?.headers,
    payload,
    tags: opts?.tags,
    caused_by: opts?.caused_by,
    sid: opts?.sid,
    partition: undefined,
  };
};

const publishWithConfirm = async (
  channel: ConfirmChannel,
  exchangeName: string,
  routingKey: string,
  content: Buffer,
  properties: Parameters<ConfirmChannel['publish']>[3],
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    channel.publish(
      exchangeName,
      routingKey,
      content,
      properties,
      (err: Error | null | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    );
  });
};

export const createRabbitContext = (options: RabbitContextOptions = {}): RabbitContext => {
  const config = options.config ?? DEFAULT_CONFIG;
  const instrumentation: MessagingInstrumentation = options.instrumentation ?? {};
  const manager = options.manager ?? createRabbitConnectionManager(config, instrumentation);

  const publish: RabbitContext['publish'] = async (topic, payload, opts) => {
    const record = buildRecord(topic, payload, opts);
    const exchangeName =
      opts?.exchange ?? config.exchange?.name ?? `${config.namespace ?? DEFAULT_NAMESPACE}.events`;
    const routingKey = opts?.routingKey ?? topic;
    await manager.withConfirmChannel(async (channel) => {
      await ensureExchange(channel, {
        name: exchangeName,
        type: config.exchange?.type,
        durable: config.exchange?.durable,
      });
      await publishWithConfirm(channel, exchangeName, routingKey, toBuffer(record), {
        contentType: JSON_CONTENT_TYPE,
        persistent: opts?.persistent ?? true,
        headers: record.headers,
        correlationId: opts?.correlationId,
        replyTo: opts?.replyTo,
      });
    });
    instrumentation.onPublish?.({ exchange: exchangeName, routingKey, topic });
    return record;
  };

  const subscribe: RabbitContext['subscribe'] = async (binding, handler) => {
    const channel = await manager.createChannel();
    const exchangeName =
      binding.exchange ??
      config.exchange?.name ??
      `${config.namespace ?? DEFAULT_NAMESPACE}.events`;
    await ensureExchange(channel, {
      name: exchangeName,
      type: binding.exchangeType ?? config.exchange?.type,
      durable: binding.durable ?? config.exchange?.durable,
    });

    const queueName =
      binding.queue ??
      formatQueueName(config.namespace ?? DEFAULT_NAMESPACE, `consumer.${randomUUID()}`);
    const queueOptions = binding.queue
      ? {
          durable: binding.durable ?? config.defaultQueue?.durable ?? true,
          deadLetterExchange: binding.deadLetterExchange ?? `${exchangeName}.dlx`,
          deadLetterRoutingKey: binding.deadLetterRoutingKey ?? `${queueName}.dlq`,
          ...(config.defaultQueue ?? {}),
          ...(binding.queueOptions ?? {}),
        }
      : {
          exclusive: true,
          autoDelete: true,
          durable: false,
          ...(binding.queueOptions ?? {}),
        };

    await ensureQueue(channel, queueName, queueOptions);

    const routingKeys = binding.routingKeys?.length ? binding.routingKeys : ['#'];
    for (const key of routingKeys) {
      await channel.bindQueue(queueName, exchangeName, key);
    }

    const prefetch = binding.prefetch ?? config.prefetch;
    if (prefetch) {
      await channel.prefetch(prefetch);
    }

    const consumer = await channel.consume(
      queueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          return;
        }
        const controls = createAckControls(channel, msg);
        try {
          const envelope = parseEnvelope(msg);
          instrumentation.onDelivery?.({
            queue: queueName,
            routingKey: msg.fields.routingKey,
            topic: envelope.topic,
          });
          await handler(envelope, controls);
          if (!(binding.autoAck ?? false)) {
            await controls.ack();
          }
        } catch (error) {
          instrumentation.onError?.({ stage: 'consumer', error: toError(error) });
          if (!(binding.autoAck ?? false)) {
            await controls.nack(false);
          }
        }
      },
      {
        noAck: binding.autoAck ?? false,
        ...(binding.consumerOptions ?? {}),
      },
    );

    return async () => {
      await channel.cancel(consumer.consumerTag);
      await channel.close();
    };
  };

  const request = async <TRequest, TResponse>(
    queue: string,
    payload: TRequest,
    opts?: RpcRequestOptions,
  ): Promise<TResponse> => {
    const channel = await manager.createChannel();
    const { queue: replyQueue } = await channel.assertQueue('', { exclusive: true });
    const correlationId = randomUUID();
    const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    return new Promise<TResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        void channel.close();
        reject(new Error(`RPC request timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      channel.consume(
        replyQueue,
        (msg: ConsumeMessage | null) => {
          if (!msg) {
            return;
          }
          if (msg.properties.correlationId !== correlationId) {
            return;
          }
          clearTimeout(timer);
          const envelope = parseEnvelope(msg);
          instrumentation.onRpcResponse?.({
            queue,
            correlationId,
            success: true,
          });
          void channel.close();
          resolve(envelope.payload as TResponse);
        },
        { noAck: true },
      );

      channel.sendToQueue(queue, toBuffer(payload), {
        contentType: JSON_CONTENT_TYPE,
        persistent: opts?.persistent ?? true,
        correlationId,
        replyTo: replyQueue,
        headers: opts?.headers,
      });
      instrumentation.onRpcRequest?.({ queue, correlationId });
    });
  };

  const respond = async <TRequest, TResponse>(
    queue: string,
    handler: RpcResponder<TRequest, TResponse>,
    opts?: RabbitSubscription & RpcHandlerOptions,
  ): Promise<() => Promise<void>> => {
    const channel = await manager.createChannel();
    await channel.assertQueue(queue, {
      durable: opts?.durable ?? true,
      ...(opts?.queueOptions ?? {}),
    });
    const prefetch = opts?.prefetch ?? config.prefetch;
    if (prefetch) {
      await channel.prefetch(prefetch);
    }

    const consumer = await channel.consume(
      queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) {
          return;
        }
        const controls = createAckControls(channel, msg);
        const reply = async (body: unknown) => {
          if (!msg.properties.replyTo) {
            return;
          }
          channel.sendToQueue(msg.properties.replyTo, toBuffer(body), {
            contentType: JSON_CONTENT_TYPE,
            correlationId: msg.properties.correlationId,
            persistent: opts?.persistent ?? false,
          });
          instrumentation.onRpcResponse?.({
            queue,
            correlationId: msg.properties.correlationId ?? '',
            success: true,
          });
        };

        try {
          await handler(parseEnvelope(msg), { ...controls, reply });
          if (!(opts?.autoAck ?? false)) {
            await controls.ack();
          }
        } catch (error) {
          instrumentation.onError?.({ stage: 'rpc-handler', error: toError(error) });
          if (!(opts?.autoAck ?? false)) {
            await controls.nack(false);
          }
          instrumentation.onRpcResponse?.({
            queue,
            correlationId: msg.properties.correlationId ?? '',
            success: false,
          });
        }
      },
      {
        noAck: opts?.autoAck ?? false,
        ...(opts?.consumerOptions ?? {}),
      },
    );

    return async () => {
      await channel.cancel(consumer.consumerTag);
      await channel.close();
    };
  };

  const close = async () => {
    await manager.close();
  };

  return {
    publish,
    subscribe,
    request,
    respond,
    close,
  };
};
