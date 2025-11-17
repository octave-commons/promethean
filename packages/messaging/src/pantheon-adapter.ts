import { randomUUID } from "crypto";
import { DEFAULT_EXCHANGE_NAME, DEFAULT_NAMESPACE, formatQueueName } from "./config.js";
import { createRabbitContext } from "./context.js";
import type {
  BasicMessage,
  BasicMessageBus,
  RabbitContext,
  RabbitContextOptions,
  RabbitMessageBusOptions,
  RabbitSubscription,
} from "./types.js";

const DEFAULT_TOPIC_PREFIX = "pantheon.messages";

const resolveContext = (
  provided?: RabbitContext,
  contextOptions?: RabbitContextOptions,
): { context: RabbitContext; options: RabbitContextOptions } => {
  if (provided) {
    return { context: provided, options: contextOptions ?? {} };
  }
  const normalized = contextOptions ?? {};
  return { context: createRabbitContext(normalized), options: normalized };
};

const deriveExchange = (namespace: string, options?: RabbitMessageBusOptions): string => {
  if (options?.exchange) {
    return options.exchange;
  }
  const candidate = options?.contextOptions?.config?.exchange?.name;
  if (candidate) {
    return candidate;
  }
  if (namespace === DEFAULT_NAMESPACE) {
    return DEFAULT_EXCHANGE_NAME;
  }
  return `${namespace}.events`;
};

const deriveNamespace = (options?: RabbitMessageBusOptions): string => {
  return options?.namespace ?? options?.contextOptions?.config?.namespace ?? DEFAULT_NAMESPACE;
};

const ensureRoutingKeys = (topicPrefix: string, subscription?: RabbitSubscription): readonly string[] => {
  if (subscription?.routingKeys?.length) {
    return subscription.routingKeys;
  }
  return [`${topicPrefix}.#`];
};

const normalizeSubscription = (
  namespace: string,
  exchange: string,
  routingKeys: readonly string[],
  subscription?: RabbitSubscription,
): RabbitSubscription => {
  const queueName = subscription?.queue ?? formatQueueName(namespace, `pantheon.${randomUUID()}`);
  return {
    exchange,
    queue: queueName,
    routingKeys,
    durable: subscription?.durable ?? Boolean(subscription?.queue),
    deadLetterExchange: subscription?.deadLetterExchange,
    deadLetterRoutingKey: subscription?.deadLetterRoutingKey,
    prefetch: subscription?.prefetch,
    autoAck: subscription?.autoAck,
    exclusive: subscription?.exclusive,
    queueOptions: subscription?.queueOptions,
    consumerOptions: subscription?.consumerOptions,
  } satisfies RabbitSubscription;
};

export const createRabbitMessageBus = (options: RabbitMessageBusOptions = {}): BasicMessageBus => {
  const { context, options: contextOpts } = resolveContext(options.context, options.contextOptions);
  const namespace = deriveNamespace({ ...options, contextOptions: contextOpts });
  const exchange = deriveExchange(namespace, { ...options, contextOptions: contextOpts });
  const topicPrefix = options.routing?.topicPrefix ?? `${namespace}.${DEFAULT_TOPIC_PREFIX}`;
  const buildTopic = options.routing?.buildTopic ?? ((msg: BasicMessage) => `${topicPrefix}.${msg.to}`);
  const buildRoutingKey = options.routing?.buildRoutingKey ?? ((msg: BasicMessage) => `${topicPrefix}.${msg.to}`);

  const send: BasicMessageBus["send"] = async (msg) => {
    const topic = buildTopic(msg);
    const routingKey = buildRoutingKey(msg);
    await context.publish(topic, msg, {
      exchange,
      routingKey,
      headers: {
        "pantheon.from": msg.from,
        "pantheon.to": msg.to,
      },
    });
  };

  const subscribe: BasicMessageBus["subscribe"] = (handler) => {
    let disposed = false;
    let stopFn: (() => Promise<void>) | undefined;
    const routingKeys = ensureRoutingKeys(topicPrefix, options.subscription);
    const binding = normalizeSubscription(namespace, exchange, routingKeys, options.subscription);

    void context
      .subscribe(binding, async (envelope) => {
        const payload = envelope.payload as BasicMessage;
        handler(payload);
      })
      .then((stop) => {
        stopFn = stop;
        if (disposed) {
          void stopFn();
        }
      })
      .catch((error) => {
        // Surface subscription failures without crashing caller synchronously
        queueMicrotask(() => {
          throw error;
        });
      });

    return () => {
      if (disposed) {
        return;
      }
      disposed = true;
      if (stopFn) {
        void stopFn();
      }
    };
  };

  return {
    send,
    subscribe,
  };
};
