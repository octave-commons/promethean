/**
 * Core types for the Pantheon Agent Management Framework
 */

export type Role = 'system' | 'user' | 'assistant';

export type Message = {
  role: Role;
  content: string;
  images?: string[];
};

export type ContextSource = {
  id: string;
  label: string;
  where?: Record<string, unknown>;
};

export type BehaviorMode = 'active' | 'passive' | 'persistent';

export type Behavior = {
  name: string;
  mode: BehaviorMode;
  plan: (input: { goal: string; context: Message[] }) => Promise<{ actions: Action[] }>;
};

export type Talent = {
  name: string;
  behaviors: readonly Behavior[];
};

export type ActorScript = {
  name: string;
  roleName?: string;
  contextSources: readonly ContextSource[];
  talents: readonly Talent[];
  program?: string;
};

export type Action =
  | { type: 'tool'; name: string; args: Record<string, unknown> }
  | { type: 'message'; content: string; target?: string }
  | { type: 'spawn'; actor: ActorScript; goal: string };

export type Actor = {
  id: string;
  script: ActorScript;
  goals: readonly string[];
};

export type ToolSpec = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  runtime: 'mcp' | 'local' | 'http';
  endpoint?: string;
};
