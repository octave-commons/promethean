import type { RabbitConnectionConfig } from "./types.js";

export const DEFAULT_NAMESPACE = "promethean";
export const DEFAULT_EXCHANGE_NAME = `${DEFAULT_NAMESPACE}.events`;

const BASE_EXCHANGE = {
  name: DEFAULT_EXCHANGE_NAME,
  type: "topic" as const,
  durable: true,
};

const BASE_QUEUE = {
  durable: true,
};

export const DEFAULT_CONFIG: RabbitConnectionConfig = {
  url: "amqp://localhost:5672",
  namespace: DEFAULT_NAMESPACE,
  prefetch: 50,
  exchange: BASE_EXCHANGE,
  defaultQueue: BASE_QUEUE,
  reconnect: {
    retries: Infinity,
    intervalMs: 500,
    maxIntervalMs: 10_000,
  },
};

export const resolveRabbitConfigFromEnv = (
  env: NodeJS.ProcessEnv = process.env,
): RabbitConnectionConfig => {
  const namespace = env.MESSAGE_BUS_NAMESPACE?.trim() || DEFAULT_NAMESPACE;
  const exchangeName = env.MESSAGE_BUS_EXCHANGE?.trim() || `${namespace}.events`;
  const prefetch = env.MESSAGE_BUS_PREFETCH ? Number(env.MESSAGE_BUS_PREFETCH) : DEFAULT_CONFIG.prefetch;
  type ExchangeType = NonNullable<RabbitConnectionConfig["exchange"]>["type"];
  const exchangeType = (env.MESSAGE_BUS_EXCHANGE_TYPE as ExchangeType | undefined) || DEFAULT_CONFIG.exchange?.type;
  const exchangeDurable = env.MESSAGE_BUS_EXCHANGE_DURABLE?.length
    ? env.MESSAGE_BUS_EXCHANGE_DURABLE === "true"
    : DEFAULT_CONFIG.exchange?.durable;
  const queueDurable = env.MESSAGE_BUS_QUEUE_DURABLE?.length
    ? env.MESSAGE_BUS_QUEUE_DURABLE === "true"
    : DEFAULT_CONFIG.defaultQueue?.durable;

  return {
    url: env.MESSAGE_BUS_URI?.trim() || env.RABBITMQ_URI?.trim() || DEFAULT_CONFIG.url,
    namespace,
    prefetch,
    exchange: {
      name: exchangeName,
      type: exchangeType,
      durable: exchangeDurable,
    },
    defaultQueue: {
      durable: queueDurable,
    },
    reconnect: DEFAULT_CONFIG.reconnect,
  };
};

export const formatQueueName = (namespace: string, suffix: string): string =>
  [namespace.trim(), suffix.trim()].filter(Boolean).join(".");
