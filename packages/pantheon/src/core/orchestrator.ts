import type { ToolPort, ContextPort, ActorPort } from './ports.js';
import type { Actor, Context } from './types.js';

export interface OrchestratorDeps {
  toolPort: ToolPort;
  contextPort: ContextPort;
  actorPort: ActorPort;
}

export function makeOrchestrator(deps: OrchestratorDeps) {
  const { toolPort, contextPort, actorPort } = deps;

  return {
    async processCommand(command: string, args?: Record<string, unknown>): Promise<unknown> {
      return await toolPort.execute(command, args);
    },

    async compileContext(sources: string[], text: string): Promise<Context> {
      return await contextPort.compile(sources, text);
    },

    async tickActor(actorId: string): Promise<void> {
      return await actorPort.tick(actorId);
    },

    async createActor(config: any): Promise<string> {
      return await actorPort.create(config);
    },

    async getActor(actorId: string): Promise<Actor | null> {
      return await actorPort.get(actorId);
    },
  };
}
