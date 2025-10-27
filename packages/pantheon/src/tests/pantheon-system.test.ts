import test from 'ava';
import {
  makeCompletePantheonSystem,
  makeOrchestrator,
  createToolActor,
} from '../index.js';

test('in-memory pantheon system orchestrates a tool actor', async (t) => {
  const { context, tools, llm, messageBus, scheduler, actorState } =
    makeCompletePantheonSystem({ inMemory: true });

  t.truthy(context);
  t.truthy(tools);
  t.truthy(llm);
  t.truthy(messageBus);
  t.truthy(scheduler);
  t.truthy(actorState);

  const orchestrator = makeOrchestrator({
    now: () => Date.now(),
    log: () => undefined,
    context: context!,
    tools: tools!,
    llm: llm!,
    bus: messageBus!,
    schedule: scheduler!,
    state: actorState!,
  });

  await tools!.register({
    name: 'test_tool',
    description: 'Tool used in pantheon integration test',
    parameters: {},
    runtime: 'local',
  });

  const toolActor = createToolActor('tool-runner', {
    tools: [
      {
        name: 'test_tool',
        description: 'Delegates to the shared tool adapter',
        handler: async () => ({ ok: true }),
      },
    ],
  });

  const actor = await actorState!.spawn(toolActor, 'exercise test_tool');

  await t.notThrowsAsync(() =>
    orchestrator.tickActor(actor, { userMessage: 'please run test_tool' }),
  );

  const updated = await actorState!.get(actor.id);
  t.is(updated?.state, 'completed');
});
