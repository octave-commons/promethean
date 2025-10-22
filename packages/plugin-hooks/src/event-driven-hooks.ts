import type {
  EventBus,
  EventRecord,
  HookRegistry,
  PluginManager,
  HookContext,
  HookRegistration,
  PluginName,
  HookName,
  EventContext,
} from './types.js';

/**
 * Event-driven hook configuration
 */
export interface EventDrivenHookConfig {
  /** Topic prefix for hook events */
  topicPrefix?: string;
  /** Whether to automatically publish hook execution events */
  publishHookEvents?: boolean;
  /** Whether to subscribe to external hook trigger events */
  subscribeToTriggers?: boolean;
  /** Event group for hook subscriptions */
  eventGroup?: string;
}

/**
 * Hook execution event payload
 */
export interface HookExecutionEvent {
  hookName: string;
  pluginName: string;
  data: unknown;
  result?: unknown;
  error?: string;
  duration: number;
  timestamp: number;
}

/**
 * Hook trigger event payload
 */
export interface HookTriggerEvent {
  hookName: string;
  data: unknown;
  context?: Partial<HookContext>;
  triggeredBy: string;
  timestamp: number;
}

/**
 * Event-driven hook manager that bridges hooks and events
 */
export class EventDrivenHookManager {
  private config: Required<EventDrivenHookConfig>;
  private hookUnsubscribers: Map<string, () => Promise<void>> = new Map();

  constructor(
    private eventBus: EventBus,
    private pluginManager: PluginManager,
    private hookRegistry: HookRegistry,
    config: EventDrivenHookConfig = {},
  ) {
    this.config = {
      topicPrefix: 'hooks',
      publishHookEvents: true,
      subscribeToTriggers: true,
      eventGroup: 'hook-system',
      ...config,
    };

    this.setupEventSubscriptions();
  }

  /**
   * Execute a hook and publish events for the execution
   */
  async executeHook<T, R>(
    hookName: HookName,
    data: T,
    context?: Partial<HookContext>,
  ): Promise<R[]> {
    const startTime = Date.now();
    const hookId = this.generateHookId();

    try {
      // Publish hook start event if enabled
      if (this.config.publishHookEvents) {
        await this.publishHookEvent('started', hookName, '', data, 0, hookId);
      }

      // Execute the hook through the plugin manager
      const results = await this.pluginManager.executeHook<T, R>(hookName, data, context);
      const duration = Date.now() - startTime;

      // Publish hook completion event if enabled
      if (this.config.publishHookEvents) {
        await this.publishHookEvent('completed', hookName, '', data, duration, hookId, results);
      }

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Publish hook error event if enabled
      if (this.config.publishHookEvents) {
        await this.publishHookEvent(
          'failed',
          hookName,
          '',
          data,
          duration,
          hookId,
          undefined,
          errorMessage,
        );
      }

      throw error;
    }
  }

  /**
   * Register a hook with event-driven capabilities
   */
  async registerEventDrivenHook<T, R>(registration: HookRegistration<T, R>): Promise<void> {
    // Wrap the original handler to add event publishing
    const wrappedHandler = async (data: T, context: HookContext) => {
      const startTime = Date.now();
      const hookId = this.generateHookId();

      try {
        // Call original handler
        const result = await registration.handler(data, context);
        const duration = Date.now() - startTime;

        // Publish individual hook execution event
        if (this.config.publishHookEvents) {
          await this.publishHookEvent(
            'executed',
            context.hookName,
            context.pluginName,
            data,
            duration,
            hookId,
            result.success ? result.data : undefined,
            result.error?.message,
          );
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Publish hook execution error event
        if (this.config.publishHookEvents) {
          await this.publishHookEvent(
            'execution_failed',
            context.hookName,
            context.pluginName,
            data,
            duration,
            hookId,
            undefined,
            errorMessage,
          );
        }

        throw error;
      }
    };

    // Register the wrapped hook
    const wrappedRegistration: HookRegistration<T, R> = {
      ...registration,
      handler: wrappedHandler,
    };

    this.hookRegistry.register(wrappedRegistration);
  }

  /**
   * Trigger a hook execution via event
   */
  async triggerHookViaEvent(
    hookName: HookName,
    data: unknown,
    triggeredBy: string,
    context?: Partial<HookContext>,
  ): Promise<void> {
    const triggerEvent: HookTriggerEvent = {
      hookName,
      data,
      context,
      triggeredBy,
      timestamp: Date.now(),
    };

    await this.eventBus.publish(`${this.config.topicPrefix}.trigger`, triggerEvent);
  }

  /**
   * Setup event subscriptions for hook triggers
   */
  private setupEventSubscriptions(): void {
    if (!this.config.subscribeToTriggers) {
      return;
    }

    // Subscribe to hook trigger events
    this.eventBus
      .subscribe(
        `${this.config.topicPrefix}.trigger`,
        this.config.eventGroup,
        async (event: EventRecord, _ctx: EventContext) => {
          const payload = event.payload as HookTriggerEvent;

          try {
            await this.executeHook(payload.hookName, payload.data, payload.context);
          } catch (error) {
            console.error(`Failed to execute triggered hook ${payload.hookName}:`, error);
          }
        },
      )
      .then((unsubscribe) => {
        this.hookUnsubscribers.set('trigger', unsubscribe);
      });

    // Subscribe to hook management events (load/unload plugins)
    this.eventBus
      .subscribe(
        `${this.config.topicPrefix}.manage`,
        this.config.eventGroup,
        async (event: EventRecord) => {
          await this.handleManagementEvent(event);
        },
      )
      .then((unsubscribe) => {
        this.hookUnsubscribers.set('manage', unsubscribe);
      });
  }

  /**
   * Handle plugin management events
   */
  private async handleManagementEvent(event: EventRecord): Promise<void> {
    const { action, pluginName, data } = event.payload as {
      action: 'load' | 'unload' | 'reload';
      pluginName: PluginName;
      data?: unknown;
    };

    try {
      switch (action) {
        case 'load':
          if (data) {
            await this.pluginManager.loadPlugin(data as any);
          }
          break;
        case 'unload':
          await this.pluginManager.unloadPlugin(pluginName);
          break;
        case 'reload':
          await this.pluginManager.unloadPlugin(pluginName);
          if (data) {
            await this.pluginManager.loadPlugin(data as any);
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to handle management event ${action} for plugin ${pluginName}:`, error);
    }
  }

  /**
   * Publish hook execution events
   */
  private async publishHookEvent(
    status: 'started' | 'completed' | 'failed' | 'executed' | 'execution_failed',
    hookName: HookName,
    pluginName: string,
    data: unknown,
    duration: number,
    hookId: string,
    result?: unknown,
    error?: string,
  ): Promise<void> {
    const eventPayload: HookExecutionEvent = {
      hookName,
      pluginName,
      data,
      result,
      error,
      duration,
      timestamp: Date.now(),
    };

    await this.eventBus.publish(`${this.config.topicPrefix}.${status}`, eventPayload, {
      headers: {
        'x-hook-id': hookId,
        'x-hook-name': hookName,
        'x-plugin-name': pluginName,
        'x-status': status,
      },
    });
  }

  /**
   * Generate unique hook execution ID
   */
  private generateHookId(): string {
    return `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get hook execution statistics from events
   */
  async getHookStats(
    _hookName?: HookName,
    _timeRange?: { start: number; end: number },
  ): Promise<{
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    errorCount: number;
  }> {
    // This would typically query the event store for hook execution events
    // For now, return placeholder data
    return {
      totalExecutions: 0,
      successRate: 0,
      averageDuration: 0,
      errorCount: 0,
    };
  }

  /**
   * Cleanup event subscriptions
   */
  async destroy(): Promise<void> {
    for (const [name, unsubscribe] of this.hookUnsubscribers.entries()) {
      try {
        await unsubscribe();
      } catch (error) {
        console.error(`Error unsubscribing from ${name}:`, error);
      }
    }
    this.hookUnsubscribers.clear();
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<EventDrivenHookConfig> {
    return { ...this.config };
  }
}
