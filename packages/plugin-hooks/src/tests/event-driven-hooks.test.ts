import test from 'ava';
import { EventDrivenHookManager } from '../event-driven-hooks.js';
import { DefaultPluginManager } from '../plugin-manager.js';
import { DefaultHookRegistry } from '../hook-registry.js';
import { InMemoryEventBus } from '@promethean-os/event';
import type { Plugin, HookRegistration, HookResult, HookContext } from '../types.js';

// Mock event bus for testing
class MockEventBus {
  private events: Array<{ topic: string; payload: unknown }> = [];
  private subscriptions: Map<string, Array<(payload: unknown) => Promise<void>>> = new Map();

  async publish<T>(topic: string, payload: T): Promise<{ id: string; topic: string; payload: T }> {
    this.events.push({ topic, payload });

    // Trigger subscribers
    const subscribers = this.subscriptions.get(topic) || [];
    for (const subscriber of subscribers) {
      await subscriber(payload);
    }

    return { id: 'mock-id', topic, payload };
  }

  async subscribe(
    topic: string,
    _group: string,
    handler: (event: any) => Promise<void>,
  ): Promise<() => Promise<void>> {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }

    const subscribers = this.subscriptions.get(topic)!;
    subscribers.push(handler);

    return async () => {
      const index = subscribers.indexOf(handler);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  async ack(_topic: string, _group: string, _id: string): Promise<void> {
    // Mock implementation
  }

  async nack(_topic: string, _group: string, _id: string, _reason?: string): Promise<void> {
    // Mock implementation
  }

  async getCursor(_topic: string, _group: string): Promise<any> {
    return null;
  }

  async setCursor(_topic: string, _group: string, _cursor: any): Promise<void> {
    // Mock implementation
  }

  getEvents(): Array<{ topic: string; payload: unknown }> {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
    this.subscriptions.clear();
  }
}

test('event-driven hook manager: basic hook execution', async (t) => {
  const eventBus = new MockEventBus() as any;
  const pluginManager = new DefaultPluginManager(eventBus);
  const hookRegistry = new DefaultHookRegistry();

  const eventDrivenManager = new EventDrivenHookManager(eventBus, pluginManager, hookRegistry, {
    publishHookEvents: true,
  });

  // Register a test hook
  let hookExecuted = false;
  const testHook: HookRegistration<string, string> = {
    pluginName: 'test-plugin',
    hookName: 'test-hook',
    handler: async (data: string, context: HookContext): Promise<HookResult<string>> => {
      hookExecuted = true;
      return { success: true, data: data.toUpperCase() };
    },
    priority: 10,
  };

  await eventDrivenManager.registerEventDrivenHook(testHook);

  // Execute the hook
  const results = await eventDrivenManager.executeHook('test-hook', 'hello world');

  t.true(hookExecuted);
  t.is(results.length, 1);
  t.is(results[0], 'HELLO WORLD');

  // Check that events were published
  const events = eventBus.getEvents();
  t.true(events.length >= 2); // started + completed events

  const startedEvent = events.find((e) => e.topic === 'hooks.started');
  const completedEvent = events.find((e) => e.topic === 'hooks.completed');

  t.truthy(startedEvent);
  t.truthy(completedEvent);

  await eventDrivenManager.destroy();
});

test('event-driven hook manager: hook trigger via event', async (t) => {
  const eventBus = new MockEventBus() as any;
  const pluginManager = new DefaultPluginManager(eventBus);
  const hookRegistry = new DefaultHookRegistry();

  const eventDrivenManager = new EventDrivenHookManager(eventBus, pluginManager, hookRegistry, {
    subscribeToTriggers: true,
  });

  // Register a test hook
  let triggeredData: string | undefined;
  const testHook: HookRegistration<string, void> = {
    pluginName: 'trigger-test-plugin',
    hookName: 'trigger-test-hook',
    handler: async (data: string, context: HookContext): Promise<HookResult<void>> => {
      triggeredData = data;
      return { success: true };
    },
    priority: 10,
  };

  await eventDrivenManager.registerEventDrivenHook(testHook);

  // Trigger hook via event
  await eventDrivenManager.triggerHookViaEvent(
    'trigger-test-hook',
    'triggered data',
    'test-system',
  );

  // Wait a bit for async processing
  await new Promise((resolve) => setTimeout(resolve, 10));

  t.is(triggeredData, 'triggered data');

  await eventDrivenManager.destroy();
});

test('event-driven hook manager: hook execution with error', async (t) => {
  const eventBus = new MockEventBus() as any;
  const pluginManager = new DefaultPluginManager(eventBus);
  const hookRegistry = new DefaultHookRegistry();

  const eventDrivenManager = new EventDrivenHookManager(eventBus, pluginManager, hookRegistry, {
    publishHookEvents: true,
  });

  // Register a hook that throws an error
  const errorHook: HookRegistration<string, void> = {
    pluginName: 'error-plugin',
    hookName: 'error-hook',
    handler: async (data: string, context: HookContext): Promise<HookResult<void>> => {
      throw new Error('Test error');
    },
    priority: 10,
  };

  await eventDrivenManager.registerEventDrivenHook(errorHook);

  // Execute the hook and expect it to throw
  await t.throwsAsync(() => eventDrivenManager.executeHook('error-hook', 'test data'), {
    message: 'Test error',
  });

  // Check that error event was published
  const events = eventBus.getEvents();
  const failedEvent = events.find((e) => e.topic === 'hooks.failed');

  t.truthy(failedEvent);
  const payload = failedEvent!.payload as any;
  t.is(payload.hookName, 'error-hook');
  t.is(payload.pluginName, 'error-plugin');
  t.is(payload.error, 'Test error');

  await eventDrivenManager.destroy();
});

test('event-driven hook manager: multiple hooks with priority', async (t) => {
  const eventBus = new MockEventBus() as any;
  const pluginManager = new DefaultPluginManager(eventBus);
  const hookRegistry = new DefaultHookRegistry();

  const eventDrivenManager = new EventDrivenHookManager(eventBus, pluginManager, hookRegistry);

  const executionOrder: string[] = [];

  // Register hooks with different priorities
  const lowPriorityHook: HookRegistration<string, string> = {
    pluginName: 'low-priority-plugin',
    hookName: 'priority-test-hook',
    handler: async (data: string, context: HookContext): Promise<HookResult<string>> => {
      executionOrder.push('low');
      return { success: true, data: 'low' };
    },
    priority: 1,
  };

  const highPriorityHook: HookRegistration<string, string> = {
    pluginName: 'high-priority-plugin',
    hookName: 'priority-test-hook',
    handler: async (data: string, context: HookContext): Promise<HookResult<string>> => {
      executionOrder.push('high');
      return { success: true, data: 'high' };
    },
    priority: 100,
  };

  const mediumPriorityHook: HookRegistration<string, string> = {
    pluginName: 'medium-priority-plugin',
    hookName: 'priority-test-hook',
    handler: async (data: string, context: HookContext): Promise<HookResult<string>> => {
      executionOrder.push('medium');
      return { success: true, data: 'medium' };
    },
    priority: 50,
  };

  await eventDrivenManager.registerEventDrivenHook(lowPriorityHook);
  await eventDrivenManager.registerEventDrivenHook(highPriorityHook);
  await eventDrivenManager.registerEventDrivenHook(mediumPriorityHook);

  // Execute the hook
  const results = await eventDrivenManager.executeHook('priority-test-hook', 'test');

  // Check execution order (high to low priority)
  t.deepEqual(executionOrder, ['high', 'medium', 'low']);
  t.deepEqual(results, ['high', 'medium', 'low']);

  await eventDrivenManager.destroy();
});

test('event-driven hook manager: hook with shouldStop', async (t) => {
  const eventBus = new MockEventBus() as any;
  const pluginManager = new DefaultPluginManager(eventBus);
  const hookRegistry = new DefaultHookRegistry();

  const eventDrivenManager = new EventDrivenHookManager(eventBus, pluginManager, hookRegistry);

  const executionOrder: string[] = [];

  // Register hooks where one stops execution
  const firstHook: HookRegistration<string, string> = {
    pluginName: 'first-plugin',
    hookName: 'stop-test-hook',
    handler: async (data: string, context: HookContext): Promise<HookResult<string>> => {
      executionOrder.push('first');
      return { success: true, data: 'first', shouldStop: true };
    },
    priority: 100,
  };

  const secondHook: HookRegistration<string, string> = {
    pluginName: 'second-plugin',
    hookName: 'stop-test-hook',
    handler: async (data: string, context: HookContext): Promise<HookResult<string>> => {
      executionOrder.push('second');
      return { success: true, data: 'second' };
    },
    priority: 50,
  };

  await eventDrivenManager.registerEventDrivenHook(firstHook);
  await eventDrivenManager.registerEventDrivenHook(secondHook);

  // Execute the hook
  const results = await eventDrivenManager.executeHook('stop-test-hook', 'test');

  // Only first hook should execute
  t.deepEqual(executionOrder, ['first']);
  t.deepEqual(results, ['first']);

  await eventDrivenManager.destroy();
});

test('event-driven hook manager: configuration', async (t) => {
  const eventBus = new MockEventBus() as any;
  const pluginManager = new DefaultPluginManager(eventBus);
  const hookRegistry = new DefaultHookRegistry();

  const customConfig = {
    topicPrefix: 'custom-hooks',
    publishHookEvents: false,
    subscribeToTriggers: false,
    eventGroup: 'custom-group',
  };

  const eventDrivenManager = new EventDrivenHookManager(
    eventBus,
    pluginManager,
    hookRegistry,
    customConfig,
  );

  const config = eventDrivenManager.getConfig();

  t.is(config.topicPrefix, 'custom-hooks');
  t.is(config.publishHookEvents, false);
  t.is(config.subscribeToTriggers, false);
  t.is(config.eventGroup, 'custom-group');

  await eventDrivenManager.destroy();
});
