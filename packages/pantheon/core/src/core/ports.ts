/**
 * Port definitions for the Pantheon Framework (Hexagonal Architecture)
 * All external dependencies are injected through these ports
 */

import type { Message, ContextSource, ToolSpec, Actor, ActorScript } from './types.js';

export type ContextPort = {
  compile: (opts: {
    texts?: readonly string[];
    sources: readonly ContextSource[];
    recentLimit?: number;
    queryLimit?: number;
    limit?: number;
  }) => Promise<Message[]>;
};

export type ToolPort = {
  register: (tool: ToolSpec) => void;
  invoke: (name: string, args: Record<string, unknown>) => Promise<unknown>;
};

export type LlmPort = {
  complete: (
    messages: Message[],
    opts?: { model?: string; temperature?: number },
  ) => Promise<Message>;
};

export type MessageBus = {
  send: (msg: { from: string; to: string; content: string }) => Promise<void>;
  subscribe: (handler: (msg: { from: string; to: string; content: string }) => void) => () => void;
};

export type Scheduler = {
  every: (ms: number, f: () => Promise<void>) => () => void;
  once: (ms: number, f: () => Promise<void>) => void;
  cleanup?: () => void;
};

export type ActorStatePort = {
  spawn: (script: ActorScript, goal: string) => Promise<Actor>;
  list: () => Promise<Actor[]>;
  get: (id: string) => Promise<Actor | null>;
  update: (id: string, updates: Partial<Actor>) => Promise<Actor>;
};
