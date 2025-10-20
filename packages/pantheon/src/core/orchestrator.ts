/**
 * Orchestrator — Core coordination engine for actors, behaviors, and actions
 */

import type { Actor, Action } from './types.js';
import type {
  ContextPort as IContextPort,
  ToolPort as IToolPort,
  LlmPort as ILlmPort,
  MessageBus as IMessageBus,
  Scheduler as IScheduler,
  ActorStatePort as IActorStatePort,
} from './ports.js';

export type OrchestratorDeps = {
  now: () => number;
  log: (msg: string, meta?: unknown) => void;
  context: IContextPort;
  tools: IToolPort;
  llm: ILlmPort;
  bus: IMessageBus;
  schedule: IScheduler;
  state: IActorStatePort;
};

export const makeOrchestrator = (deps: OrchestratorDeps) => {
  const executeAction = async (action: Action, actor: Actor): Promise<void> => {
    deps.log(`Executing action: ${action.type}`, { actorId: actor.id, action });

    switch (action.type) {
      case 'message':
        await deps.bus.send({
          from: actor.id,
          to: action.target ?? 'user',
          content: action.content,
        });
        break;

      case 'tool':
        await deps.tools.invoke(action.name, action.args);
        break;

      case 'spawn':
        await deps.state.spawn(action.actor, action.goal);
        break;

      default:
        throw new Error(`Unknown action type: ${(action as any).type}`);
    }
  };

  const selectBehaviors = (
    actor: Actor,
    hasUserInput: boolean,
  ): (typeof actor.script.talents)[number]['behaviors'] => {
    const allBehaviors = actor.script.talents.flatMap((t) => t.behaviors);

    return allBehaviors.filter((behavior) => {
      if (hasUserInput) {
        return behavior.mode === 'active' || behavior.mode === 'persistent';
      }
      return behavior.mode !== 'active'; // passive + persistent
    });
  };

  const tickActor = async (actor: Actor, input?: { userMessage?: string }): Promise<void> => {
    deps.log(`Ticking actor: ${actor.id}`, { goals: actor.goals, hasInput: !!input?.userMessage });

    const context = await deps.context.compile({
      texts: input?.userMessage ? [input.userMessage] : [],
      sources: actor.script.contextSources,
    });

    const allowedBehaviors = selectBehaviors(actor, !!input?.userMessage);
    const goal = actor.goals.join('; ');

    for (const behavior of allowedBehaviors) {
      try {
        const plan = await behavior.plan({ goal, context });

        for (const action of plan.actions) {
          await executeAction(action, actor);
        }
      } catch (error) {
        deps.log(`Behavior ${behavior.name} failed`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  };

  const startActorLoop = (actor: Actor, intervalMs: number = 5000): (() => void) => {
    return deps.schedule.every(intervalMs, async () => {
      try {
        await tickActor(actor);
      } catch (error) {
        deps.log(`Actor loop error for ${actor.id}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  };

  return {
    tickActor,
    startActorLoop,
    executeAction: (action: Action, actor: Actor) => executeAction(action, actor),
  };
};
