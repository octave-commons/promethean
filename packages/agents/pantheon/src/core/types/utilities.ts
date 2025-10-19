/**
 * Utility types for the Pantheon Agent Framework
 */

export type DeepPartial<T> = {
  readonly [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

export type AsyncFunction<T = unknown, R = unknown> = (
  ...args: readonly T[]
) => Promise<R>;

export interface Logger {
  debug(message: string, ...args: readonly unknown[]): void;
  info(message: string, ...args: readonly unknown[]): void;
  warn(message: string, ...args: readonly unknown[]): void;
  error(message: string, error?: Error, ...args: readonly unknown[]): void;
}

export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}
