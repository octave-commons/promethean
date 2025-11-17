import type { Channel, ConfirmChannel, ChannelModel } from "amqplib";
import { connect as amqpConnect } from "amqplib";
import { DEFAULT_CONFIG } from "./config.js";
import type { MessagingInstrumentation } from "./instrumentation.js";
import type { RabbitConnectionConfig } from "./types.js";

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
const toError = (value: unknown): Error => (value instanceof Error ? value : new Error(String(value)));

const mergeConfig = (config?: RabbitConnectionConfig): RabbitConnectionConfig => {
  const exchange = { ...(DEFAULT_CONFIG.exchange ?? {}), ...(config?.exchange ?? {}) } as RabbitConnectionConfig["exchange"];
  const defaultQueue = { ...(DEFAULT_CONFIG.defaultQueue ?? {}), ...(config?.defaultQueue ?? {}) };
  const reconnect = { ...(DEFAULT_CONFIG.reconnect ?? {}), ...(config?.reconnect ?? {}) };
  return {
    ...DEFAULT_CONFIG,
    ...config,
    exchange,
    defaultQueue,
    reconnect,
  };
};

export class RabbitConnectionManager {
  private connection?: ChannelModel;
  private confirmChannel?: ConfirmChannel;
  private establishing?: Promise<ChannelModel>;
  private closing = false;

  constructor(
    private readonly config: RabbitConnectionConfig,
    private readonly instrumentation: MessagingInstrumentation,
    private readonly dialer: typeof amqpConnect = amqpConnect,
  ) {}

  async getConnection(): Promise<ChannelModel> {
    if (this.connection) return this.connection;
    if (this.establishing) return this.establishing;

    this.establishing = this.open();
    try {
      const conn = await this.establishing;
      this.connection = conn;
      return conn;
    } finally {
      this.establishing = undefined;
    }
  }

  private async open(attempt = 1): Promise<ChannelModel> {
    try {
      const connection = await this.dialer(this.config.url, this.config.socketOptions);
      this.instrumentation.onConnect?.({ url: this.config.url });
      connection.on("close", (reason: unknown) => this.handleClose(reason instanceof Error ? reason : undefined));
      connection.on("error", (err: unknown) =>
        this.instrumentation.onError?.({ stage: "connection", error: err instanceof Error ? err : new Error(String(err)) }),
      );
      return connection;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const retries = this.config.reconnect?.retries ?? Infinity;
      if (attempt > retries) {
        this.instrumentation.onError?.({ stage: "connection", error: err });
        throw err;
      }
      const base = this.config.reconnect?.intervalMs ?? 500;
      const max = this.config.reconnect?.maxIntervalMs ?? 10_000;
      const delayMs = Math.min(base * 2 ** (attempt - 1), max);
      this.instrumentation.onRetry?.({ attempt, delayMs, error: err });
      await wait(delayMs);
      return this.open(attempt + 1);
    }
  }

  private handleClose(error?: Error) {
    this.instrumentation.onClose?.({ reason: error });
    this.connection = undefined;
    this.confirmChannel = undefined;
    if (this.closing) {
      return;
    }
    this.getConnection().catch((err: unknown) => {
      this.instrumentation.onError?.({ stage: "reconnect", error: toError(err) });
    });
  }

  async withConfirmChannel<T>(fn: (channel: ConfirmChannel) => Promise<T>): Promise<T> {
    const channel = await this.getConfirmChannel();
    return fn(channel);
  }

  private async getConfirmChannel(): Promise<ConfirmChannel> {
    if (this.confirmChannel) return this.confirmChannel;
    const connection = await this.getConnection();
    const channel = await connection.createConfirmChannel();
    if (this.config.prefetch) {
      await channel.prefetch(this.config.prefetch);
    }
    channel.on("error", (err: unknown) =>
      this.instrumentation.onError?.({ stage: "confirm-channel", error: toError(err) }),
    );
    channel.on("close", () => {
      if (!this.closing) {
        this.confirmChannel = undefined;
      }
    });
    this.confirmChannel = channel;
    return channel;
  }

  async createChannel(): Promise<Channel> {
    const connection = await this.getConnection();
    const channel = await connection.createChannel();
    if (this.config.prefetch) {
      await channel.prefetch(this.config.prefetch);
    }
    channel.on("error", (err: unknown) => this.instrumentation.onError?.({ stage: "channel", error: toError(err) }));
    return channel;
  }

  async close(): Promise<void> {
    this.closing = true;
    const tasks: Array<Promise<unknown>> = [];
    if (this.confirmChannel) {
      tasks.push(
        this.confirmChannel.close().catch((err: unknown) => {
          this.instrumentation.onError?.({ stage: "confirm-channel-close", error: toError(err) });
        }),
      );
      this.confirmChannel = undefined;
    }
    if (this.connection) {
      tasks.push(
        this.connection.close().catch((err: unknown) => {
          this.instrumentation.onError?.({ stage: "connection-close", error: toError(err) });
        }),
      );
      this.connection = undefined;
    }
    await Promise.allSettled(tasks);
    this.closing = false;
  }
}

export const createRabbitConnectionManager = (
  config?: RabbitConnectionConfig,
  instrumentation: MessagingInstrumentation = {},
  dialer: typeof amqpConnect = amqpConnect,
): RabbitConnectionManager => {
  return new RabbitConnectionManager(mergeConfig(config), instrumentation, dialer);
};
