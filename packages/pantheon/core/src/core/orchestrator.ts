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

      case 'wait':
        deps.log(`Actor ${actor.id} waiting for ${action.duration}ms`, {
          reason: action.reason,
        });
        await new Promise((resolve) => setTimeout(resolve, action.duration));
        break;

      case 'context':
        deps.log(`Actor ${actor.id} performing context operation: ${action.operation}`, {
          target: action.target,
        });

        switch (action.operation) {
          case 'read':
            // Context read operations would be handled by the context port
            // This is a placeholder for now - actual implementation depends on context port capabilities
            deps.log(`Reading context from ${action.target}`);
            break;

          case 'write':
            // Context write operations would be handled by the context port
            deps.log(`Writing context data to ${action.target}`, { data: action.data });
            break;

          case 'delete':
            // Context delete operations would be handled by the context port
            deps.log(`Deleting context at ${action.target}`);
            break;

          default:
            throw new Error(`Unknown context operation: ${(action as any).operation}`);
        }
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

    try {
      // Update actor state to running
      await deps.state.update(actor.id, {
        state: 'running',
        updatedAt: new Date(),
      });

      const context = await deps.context.compile({
        texts: input?.userMessage ? [input.userMessage] : [],
        sources: actor.script.contextSources,
      });

      const allowedBehaviors = selectBehaviors(actor, !!input?.userMessage);
      const goal = actor.goals.join('; ');

      let hasErrors = false;
      const errors: Array<{ behavior: string; error: string }> = [];

      for (const behavior of allowedBehaviors) {
        try {
          const plan = await behavior.plan({ goal, context });

          for (const action of plan.actions) {
            try {
              await executeAction(action, actor);
            } catch (actionError) {
              const errorMsg = `Action ${action.type} failed: ${actionError instanceof Error ? actionError.message : String(actionError)}`;
              deps.log(`Action failed in behavior ${behavior.name}`, {
                error: errorMsg,
                action,
              });
              errors.push({ behavior: behavior.name, error: errorMsg });
              hasErrors = true;

              // Continue with other actions unless it's a critical error
              if (actionError instanceof Error && actionError.message.includes('critical')) {
                throw actionError;
              }
            }
          }
        } catch (error) {
          const errorMsg = `Behavior ${behavior.name} failed: ${error instanceof Error ? error.message : String(error)}`;
          deps.log(`Behavior ${behavior.name} failed`, {
            error: errorMsg,
          });
          errors.push({ behavior: behavior.name, error: errorMsg });
          hasErrors = true;
        }
      }

      // Update actor state based on execution results
      const finalState = hasErrors ? 'failed' : 'completed';
      await deps.state.update(actor.id, {
        state: finalState,
        updatedAt: new Date(),
        metadata: {
          ...actor.metadata,
          lastTick: deps.now(),
          errors: errors.length > 0 ? errors : undefined,
        },
      });

      if (hasErrors) {
        deps.log(`Actor ${actor.id} completed with errors`, { errors });
      } else {
        deps.log(`Actor ${actor.id} completed successfully`);
      }
    } catch (error) {
      // Handle critical errors that prevent the actor from completing
      const errorMsg = `Critical error in actor ${actor.id}: ${error instanceof Error ? error.message : String(error)}`;
      deps.log(errorMsg, { error });

      await deps.state.update(actor.id, {
        state: 'failed',
        updatedAt: new Date(),
        metadata: {
          ...actor.metadata,
          lastTick: deps.now(),
          criticalError: errorMsg,
        },
      });

      throw error;
    }
  };

  const startActorLoop = (actor: Actor, intervalMs: number = 5000): (() => void) => {
    let isActive = true;

    const loop = deps.schedule.every(intervalMs, async () => {
      if (!isActive) return;

      try {
        // Check if actor still exists and is in a valid state
        const currentActor = await deps.state.get(actor.id);
        if (!currentActor) {
          deps.log(`Actor ${actor.id} no longer exists, stopping loop`);
          isActive = false;
          return;
        }

        // Skip ticking if actor is paused or completed
        if (currentActor.state === 'paused' || currentActor.state === 'completed') {
          return;
        }

        // Reset failed state to idle for retry
        if (currentActor.state === 'failed') {
          await deps.state.update(actor.id, { state: 'idle' });
        }

        await tickActor(currentActor);
      } catch (error) {
        deps.log(`Actor loop error for ${actor.id}`, {
          error: error instanceof Error ? error.message : String(error),
        });

        // Mark actor as failed but don't stop the loop - allow retry
        try {
          await deps.state.update(actor.id, {
            state: 'failed',
            updatedAt: new Date(),
            metadata: {
              ...(await deps.state.get(actor.id))?.metadata,
              lastLoopError: error instanceof Error ? error.message : String(error),
            },
          });
        } catch (updateError) {
          deps.log(`Failed to update actor state after loop error`, {
            error: updateError instanceof Error ? updateError.message : String(updateError),
          });
        }
      }
    });

    // Return cleanup function
    return () => {
      isActive = false;
      loop();
      deps.log(`Actor loop for ${actor.id} stopped`);
    };
  };

  const cleanupActor = async (actorId: string): Promise<void> => {
    deps.log(`Cleaning up actor: ${actorId}`);

    try {
      const actor = await deps.state.get(actorId);
      if (!actor) {
        deps.log(`Actor ${actorId} not found for cleanup`);
        return;
      }

      // Update actor state to indicate cleanup
      await deps.state.update(actorId, {
        state: 'completed',
        updatedAt: new Date(),
        metadata: {
          ...actor.metadata,
          cleanedUpAt: deps.now(),
        },
      });

      // Perform any additional cleanup here
      // - Close open connections
      // - Clear temporary data
      // - Release resources

      deps.log(`Actor ${actorId} cleaned up successfully`);
    } catch (error) {
      deps.log(`Error cleaning up actor ${actorId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const pauseActor = async (actorId: string): Promise<void> => {
    deps.log(`Pausing actor: ${actorId}`);

    try {
      await deps.state.update(actorId, {
        state: 'paused',
        updatedAt: new Date(),
      });

      deps.log(`Actor ${actorId} paused`);
    } catch (error) {
      deps.log(`Error pausing actor ${actorId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const resumeActor = async (actorId: string): Promise<void> => {
    deps.log(`Resuming actor: ${actorId}`);

    try {
      await deps.state.update(actorId, {
        state: 'idle',
        updatedAt: new Date(),
      });

      deps.log(`Actor ${actorId} resumed`);
    } catch (error) {
      deps.log(`Error resuming actor ${actorId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  return {
    tickActor,
    startActorLoop,
    executeAction: (action: Action, actor: Actor) => executeAction(action, actor),
    cleanupActor,
    pauseActor,
    resumeActor,
  };
};
