/**
 * Concrete adapter implementations for Pantheon ports
 * Provides default implementations that can be used in development and testing
 */

import type { ContextSource, ToolSpec, Actor, ActorScript, Message } from './types.js';
import type {
  ContextPort,
  ToolPort,
  LlmPort,
  MessageBus,
  Scheduler,
  ActorStatePort,
} from './ports.js';

// === Context Port Implementation ===

export type ContextAdapterDeps = {
  getMessagesForSources: (
    sources: readonly ContextSource[],
    opts?: {
      recentLimit?: number;
      queryLimit?: number;
      limit?: number;
    },
  ) => Promise<Message[]>;
  resolveRole?: (meta?: any) => 'system' | 'user' | 'assistant';
  resolveName?: (meta?: any) => string;
  formatTime?: (ms: number) => string;
};

export const makeContextAdapter = (deps: ContextAdapterDeps): ContextPort => {
  return {
    compile: async (opts) => {
      const { texts = [], sources, recentLimit, queryLimit, limit } = opts;

      // Get messages from sources
      const sourceMessages = await deps.getMessagesForSources(sources, {
        recentLimit,
        queryLimit,
        limit,
      });

      // Convert text inputs to messages
      const textMessages: Message[] = texts.map((text) => ({
        role: 'user',
        content: text,
      }));

      // Combine and limit messages
      const allMessages = [...sourceMessages, ...textMessages];
      const finalLimit = limit || queryLimit || recentLimit || 100;

      return allMessages.slice(-finalLimit);
    },
  };
};

// === Tool Port Implementation ===

export type ToolAdapterDeps = {
  invokeTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  listTools?: () => Promise<string[]>;
  registerTool?: (tool: ToolSpec) => void;
  getToolSchema?: (name: string) => Promise<Record<string, unknown>>;
};

export const makeToolAdapter = (deps: ToolAdapterDeps): ToolPort => {
  const tools = new Map<string, ToolSpec>();

  return {
    register: (tool: ToolSpec) => {
      tools.set(tool.name, tool);
      deps.registerTool?.(tool);
    },

    invoke: async (name: string, args: Record<string, unknown>): Promise<unknown> => {
      const tool = tools.get(name);
      if (!tool) {
        throw new Error(`Tool '${name}' not found`);
      }

      try {
        return await deps.invokeTool(name, args);
      } catch (error) {
        throw new Error(
          `Tool '${name}' execution failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  };
};

// === LLM Port Implementation ===

export type LlmAdapterDeps = {
  completeLLM: (
    messages: Message[],
    opts?: { model?: string; temperature?: number },
  ) => Promise<Message>;
};

export const makeLlmAdapter = (deps: LlmAdapterDeps): LlmPort => {
  return {
    complete: async (messages: Message[], opts?) => {
      if (!messages || messages.length === 0) {
        throw new Error('No messages provided for completion');
      }

      try {
        return await deps.completeLLM(messages, opts);
      } catch (error) {
        throw new Error(
          `LLM completion failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  };
};

// === Message Bus Implementation ===

export type MessageBusAdapterDeps = {
  sendMessage: (msg: { from: string; to: string; content: string }) => Promise<void>;
  subscribeToMessages?: (
    handler: (msg: { from: string; to: string; content: string }) => void,
  ) => () => void;
};

export const makeMessageBusAdapter = (deps: MessageBusAdapterDeps): MessageBus => {
  const subscribers = new Set<(msg: { from: string; to: string; content: string }) => void>();

  return {
    send: async (msg) => {
      try {
        await deps.sendMessage(msg);

        // Notify all subscribers
        subscribers.forEach((handler) => {
          try {
            handler(msg);
          } catch (error) {
            console.error('Message bus subscriber error:', error);
          }
        });
      } catch (error) {
        throw new Error(
          `Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },

    subscribe: (handler) => {
      subscribers.add(handler);

      // Also subscribe to external message source if available
      const externalUnsubscribe = deps.subscribeToMessages?.(handler);

      return () => {
        subscribers.delete(handler);
        externalUnsubscribe?.();
      };
    },
  };
};

// === Scheduler Implementation ===

export type SchedulerAdapterDeps = {
  scheduleInterval: (ms: number, f: () => Promise<void>) => () => void;
  scheduleTimeout: (ms: number, f: () => Promise<void>) => void;
};

export const makeSchedulerAdapter = (deps: SchedulerAdapterDeps): Scheduler => {
  return {
    every: (ms: number, f: () => Promise<void>) => {
      return deps.scheduleInterval(ms, async () => {
        try {
          await f();
        } catch (error) {
          console.error('Scheduled task error:', error);
        }
      });
    },

    once: (ms: number, f: () => Promise<void>) => {
      deps.scheduleTimeout(ms, async () => {
        try {
          await f();
        } catch (error) {
          console.error('Scheduled timeout error:', error);
        }
      });
    },
  };
};

// === Actor State Port Implementation ===

export type ActorStatePortDeps = {
  createActor: (actor: Omit<Actor, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Actor>;
  getActor: (id: string) => Promise<Actor | null>;
  updateActor: (id: string, updates: Partial<Actor>) => Promise<Actor>;
  listActors: () => Promise<Actor[]>;
  generateId: () => string;
};

export const makeActorStatePort = (deps: ActorStatePortDeps): ActorStatePort => {
  return {
    spawn: async (script: ActorScript, goal: string): Promise<Actor> => {
      const actorData = {
        script,
        goals: [goal],
        state: 'idle' as const,
        metadata: {},
      };

      try {
        return await deps.createActor(actorData);
      } catch (error) {
        throw new Error(
          `Failed to spawn actor: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },

    get: async (id: string): Promise<Actor | null> => {
      try {
        return await deps.getActor(id);
      } catch (error) {
        throw new Error(
          `Failed to get actor ${id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },

    update: async (id: string, updates: Partial<Actor>): Promise<Actor> => {
      try {
        return await deps.updateActor(id, updates);
      } catch (error) {
        throw new Error(
          `Failed to update actor ${id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },

    list: async (): Promise<Actor[]> => {
      try {
        return await deps.listActors();
      } catch (error) {
        throw new Error(
          `Failed to list actors: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  };
};

// === In-Memory Implementations for Testing ===

export const makeInMemoryContextPort = (): ContextPort => {
  const messages = new Map<string, Message[]>();

  return {
    compile: async (opts) => {
      const { texts = [], sources } = opts;

      // Get messages from sources (mock implementation)
      const sourceMessages: Message[] = [];
      for (const source of sources) {
        const sourceMsgs = messages.get(source.id) || [];
        sourceMessages.push(...sourceMsgs);
      }

      // Convert text inputs to messages
      const textMessages: Message[] = texts.map((text) => ({
        role: 'user',
        content: text,
      }));

      return [...sourceMessages, ...textMessages];
    },
  };
};

export const makeInMemoryToolPort = (): ToolPort => {
  const tools = new Map<string, ToolSpec>();

  return {
    register: (tool: ToolSpec) => {
      tools.set(tool.name, tool);
    },

    invoke: async (name: string, args: Record<string, unknown>): Promise<unknown> => {
      const tool = tools.get(name);
      if (!tool) {
        throw new Error(`Tool '${name}' not found`);
      }

      // Mock tool execution
      return {
        tool: name,
        args,
        executed: true,
        timestamp: Date.now(),
      };
    },
  };
};

export const makeInMemoryLlmPort = (): LlmPort => {
  return {
    complete: async (messages: Message[]) => {
      // Mock LLM response
      const lastMessage = messages[messages.length - 1];
      return {
        role: 'assistant',
        content: `Mock response to: ${lastMessage?.content || 'no input'}`,
      };
    },
  };
};

export const makeInMemoryMessageBus = (): MessageBus => {
  const subscribers = new Set<(msg: { from: string; to: string; content: string }) => void>();

  return {
    send: async (msg) => {
      subscribers.forEach((handler) => handler(msg));
    },

    subscribe: (handler) => {
      subscribers.add(handler);
      return () => subscribers.delete(handler);
    },
  };
};

export const makeInMemoryScheduler = (): Scheduler => {
  const intervals = new Set<NodeJS.Timeout>();
  const timeouts = new Set<NodeJS.Timeout>();

  return {
    every: (ms: number, f: () => Promise<void>) => {
      const interval = setInterval(async () => {
        try {
          await f();
        } catch (error) {
          console.error('In-memory scheduler error:', error);
        }
      }, ms);

      intervals.add(interval);

      return () => {
        clearInterval(interval);
        intervals.delete(interval);
      };
    },

    once: (ms: number, f: () => Promise<void>) => {
      const timeout = setTimeout(async () => {
        try {
          await f();
        } catch (error) {
          console.error('In-memory scheduler timeout error:', error);
        }
        timeouts.delete(timeout);
      }, ms);

      timeouts.add(timeout);
    },
  };
};

export const makeInMemoryActorStatePort = (): ActorStatePort => {
  const actors = new Map<string, Actor>();
  let idCounter = 1;

  return {
    spawn: async (script: ActorScript, goal: string): Promise<Actor> => {
      const id = `actor_${idCounter++}`;
      const now = new Date();
      const actor: Actor = {
        id,
        script,
        goals: [goal],
        state: 'idle',
        createdAt: now,
        updatedAt: now,
        metadata: {},
      };

      actors.set(id, actor);
      return actor;
    },

    get: async (id: string): Promise<Actor | null> => {
      return actors.get(id) || null;
    },

    update: async (id: string, updates: Partial<Actor>): Promise<Actor> => {
      const actor = actors.get(id);
      if (!actor) {
        throw new Error(`Actor ${id} not found`);
      }

      const updatedActor = {
        ...actor,
        ...updates,
        updatedAt: new Date(),
      };

      actors.set(id, updatedActor);
      return updatedActor;
    },

    list: async (): Promise<Actor[]> => {
      return Array.from(actors.values());
    },
  };
};
