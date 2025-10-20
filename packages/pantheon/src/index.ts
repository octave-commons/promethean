// Core types
export type { Actor, ActorConfig, Context, Message } from './core/types.js';

// Core ports
export type { ToolPort, ContextPort, ActorPort } from './core/ports.js';

// Core factories
export { makeContextAdapter } from './core/context.js';

export { makeActorAdapter } from './core/actors.js';

export { makeOrchestrator } from './core/orchestrator.js';
