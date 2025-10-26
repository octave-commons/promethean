import { makeCompletePantheonSystem, makeOrchestrator } from '@promethean-os/pantheon';
import type {
  ActorScript,
  Behavior,
  BehaviorMode,
  Message,
} from '@promethean-os/pantheon-core';

type PantheonComputationOptions<TRequest, TResult> = {
  actorName: string;
  goal: string;
  mode?: BehaviorMode;
  request?: TRequest;
  logger?: (params: { level: 'debug' | 'info' | 'warn' | 'error'; message: string; meta?: unknown }) => void;
  compute: (params: { goal: string; context: Message[]; request: TRequest | undefined }) => Promise<TResult>;
};

/**
 * Runs a lightweight Pantheon actor in-memory to perform a deterministic computation.
 * The computation result is emitted as a message action and captured from the message bus.
 */
export async function runPantheonComputation<TRequest, TResult>(
  options: PantheonComputationOptions<TRequest, TResult>,
): Promise<TResult> {
  const system = makeCompletePantheonSystem({ inMemory: true });

  const context = system.context;
  const tools = system.tools;
  const llm = system.llm;
  const messageBus = system.messageBus;
  const scheduler = system.scheduler;
  const actorState = system.actorState;

  if (!context || !tools || !llm || !messageBus || !scheduler || !actorState) {
    throw new Error('Pantheon runtime is missing required adapters');
  }

  const orchestrator = makeOrchestrator({
    now: () => Date.now(),
    log: (message, meta) => options.logger?.({ level: 'debug', message, meta }),
    context,
    tools,
    llm,
    bus: messageBus,
    schedule: scheduler,
    state: actorState,
  });

  const behavior: Behavior = {
    name: `${options.actorName}-behavior`,
    mode: options.mode ?? 'passive',
    description: 'Auto-generated behavior for Kanban Pantheon integration',
    plan: async ({ goal, context: messages }) => {
      const result = await options.compute({
        goal,
        context: messages,
        request: options.request,
      });

      return {
        actions: [
          {
            type: 'message',
            target: 'user',
            content: JSON.stringify(result),
          } as const,
        ],
      };
    },
  };

  const actorScript: ActorScript = {
    name: options.actorName,
    contextSources: [],
    talents: [
      {
        name: `${options.actorName}-talent`,
        behaviors: [behavior],
        description: 'Generated talent for Kanban Pantheon computations',
      },
    ],
    description: 'Synthetic actor used for Kanban Pantheon integrations',
  };

  const actor = await actorState.spawn(actorScript, options.goal);

  let payload: TResult | undefined;
  const unsubscribe = messageBus.subscribe((msg) => {
    if (msg.to === 'user') {
      try {
        payload = JSON.parse(msg.content) as TResult;
      } catch (error) {
        options.logger?.({
          level: 'warn',
          message: 'Failed to parse Pantheon actor output',
          meta: { error },
        });
      }
    }
  });

  await orchestrator.tickActor(
    actor,
    options.request
      ? { userMessage: JSON.stringify(options.request) }
      : undefined,
  );

  unsubscribe();

  if (payload === undefined) {
    throw new Error(
      `Pantheon actor "${options.actorName}" did not emit a result message`,
    );
  }

  return payload;
}
