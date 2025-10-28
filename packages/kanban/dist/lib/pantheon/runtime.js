import { makeCompletePantheonSystem, makeOrchestrator } from '@promethean-os/pantheon';
/**
 * Runs a lightweight Pantheon actor in-memory to perform a deterministic computation.
 * The computation result is emitted as a message action and captured from the message bus.
 */
export async function runPantheonComputation(options) {
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
    const behavior = {
        name: `${options.actorName}-behavior`,
        mode: options.mode ?? 'persistent',
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
                    },
                ],
            };
        },
    };
    const actorScript = {
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
    let payload;
    const unsubscribe = messageBus.subscribe((msg) => {
        if (msg.to === 'user') {
            try {
                payload = JSON.parse(msg.content);
            }
            catch (error) {
                options.logger?.({
                    level: 'warn',
                    message: 'Failed to parse Pantheon actor output',
                    meta: { error },
                });
            }
        }
    });
    await orchestrator.tickActor(actor, options.request
        ? { userMessage: JSON.stringify(options.request) }
        : undefined);
    unsubscribe();
    if (payload === undefined) {
        throw new Error(`Pantheon actor "${options.actorName}" did not emit a result message`);
    }
    return payload;
}
//# sourceMappingURL=runtime.js.map