export type UUID = string;
export type Millis = number;

export type EventRecord<T = unknown> = {
  id: UUID;
  sid?: UUID;
  ts: Millis;
  topic: string;
  key?: string;
  partition?: number;
  headers?: Record<string, string>;
  payload: T;
  caused_by?: UUID[];
  tags?: string[];
};

export type EventBusOptions = Record<string, unknown>;
export type EventContext = Record<string, unknown>;
export type EventCursor = unknown;

export type EventBus = {
  publish<T>(topic: string, payload: T, opts?: EventBusOptions): Promise<EventRecord<T>>;
  subscribe(
    topic: string,
    group: string,
    handler: (e: EventRecord, ctx: EventContext) => Promise<void>,
    opts?: EventBusOptions,
  ): Promise<() => Promise<void>>;
  ack(topic: string, group: string, id: UUID): Promise<void>;
  nack(topic: string, group: string, id: UUID, reason?: string): Promise<void>;
  getCursor(topic: string, group: string): Promise<EventCursor>;
  setCursor(topic: string, group: string, cursor: EventCursor): Promise<void>;
};

export type HookName = string;
export type PluginName = string;
export type HookPriority = number;

export interface HookContext {
  pluginName: PluginName;
  hookName: HookName;
  event?: EventRecord;
  metadata?: Record<string, unknown>;
}

export interface HookResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
  shouldStop?: boolean;
}

export type HookHandler<T = unknown, R = unknown> = (
  data: T,
  context: HookContext,
) => HookResult<R> | Promise<HookResult<R>>;

export interface HookRegistration<T = unknown, R = unknown> {
  pluginName: PluginName;
  hookName: HookName;
  handler: HookHandler<T, R>;
  priority: HookPriority;
}

export interface PluginMetadata {
  name: PluginName;
  version: string;
  description?: string;
  dependencies?: PluginName[];
  hooks?: HookName[];
}

export interface Plugin {
  metadata: PluginMetadata;
  initialize?(context: PluginContext): Promise<void> | void;
  destroy?(): Promise<void> | void;
  getHooks?(): HookRegistration[];
}

export interface PluginContext {
  eventBus: EventBus;
  hookRegistry: HookRegistry;
  registerHook<T, R>(registration: HookRegistration<T, R>): void;
  unregisterHook(pluginName: PluginName, hookName: HookName): void;
}

export interface HookRegistry {
  register<T, R>(registration: HookRegistration<T, R>): void;
  unregister(pluginName: PluginName, hookName: HookName): void;
  execute<T, R>(hookName: HookName, data: T, context?: Partial<HookContext>): Promise<R[]>;
  executeWithPriority<T, R>(
    hookName: HookName,
    data: T,
    context?: Partial<HookContext>,
  ): Promise<R[]>;
  getRegisteredHooks(hookName?: HookName): HookRegistration[];
  hasHook(hookName: HookName): boolean;
}

export interface PluginManager {
  loadPlugin(plugin: Plugin): Promise<void>;
  unloadPlugin(pluginName: PluginName): Promise<void>;
  getPlugin(name: PluginName): Plugin | undefined;
  getAllPlugins(): Plugin[];
  isLoaded(name: PluginName): boolean;
  executeHook<T, R>(hookName: HookName, data: T, context?: Partial<HookContext>): Promise<R[]>;
}

export interface PluginHooksConfig {
  autoLoad?: boolean;
  hookTimeout?: number;
  maxConcurrentHooks?: number;
  enableHookLogging?: boolean;
}
