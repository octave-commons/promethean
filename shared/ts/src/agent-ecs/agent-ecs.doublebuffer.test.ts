import { createAgentWorld } from './world';
import { defineAgentComponents } from './components';
import { enqueueUtterance } from './helpers/enqueueUtterance';
import { OrchestratorSystem } from './systems/orchestrator';

describe('agent-ecs double buffer semantics', () => {
  function makePlayer() {
    let playing = false;
    return {
      play: jest.fn((_: any) => {
        playing = true;
      }),
      stop: jest.fn((_: boolean) => {
        playing = false;
      }),
      pause: jest.fn((_: boolean) => {
        playing = false;
      }),
      unpause: jest.fn(() => {
        playing = true;
      }),
      isPlaying: jest.fn(() => playing),
    };
  }

  test('enqueueUtterance appends and is visible to next tick (also readable immediately)', async () => {
    const player = makePlayer();
    const { w, agent, C } = createAgentWorld(player);

    const pq0 = w.get(agent, C.PlaybackQ)!;
    expect(pq0.items).toEqual([]);

    // enqueue one utterance (begins a tick internally but does not end it)
    enqueueUtterance(w, agent, C, { factory: async () => ({}) });

    // still in same frame: prev is updated for out-of-tick write, so it is readable
    const pqPrev = w.get(agent, C.PlaybackQ)!;
    expect(pqPrev.items.length).toBe(1);

    // swap buffers
    w.endTick();

    const pqNext = w.get(agent, C.PlaybackQ)!;
    expect(pqNext.items.length).toBe(1);
  });

  test('SpeechArbiter picks next audio and marks utterance playing', async () => {
    const player = makePlayer();
    const { w, agent, C, tick } = createAgentWorld(player);

    // enqueue an utterance → commit for next frame
    enqueueUtterance(w, agent, C, { factory: async () => ({ buf: 'audio' }) });
    w.endTick();

    let pq = w.get(agent, C.PlaybackQ)!;
    const [eid] = pq.items;
    expect(eid).toBeDefined();

    // run systems once: arbiter should pick and call play
    await tick(0);
    // allow async factory microtask to resolve and invoke player.play
    await new Promise((r) => setTimeout(r, 0));

    pq = w.get(agent, C.PlaybackQ)!;
    expect(pq.items).toEqual([]); // dequeued

    const utt = w.get(eid, C.Utterance)!;
    expect(utt.status).toBe('playing');
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  test('Orchestrator clears TranscriptFinal via next-buffer write', async () => {
    const player = makePlayer();
    const { w, agent, C } = createAgentWorld(player);

    // Prepare an orchestrator and mock bus
    const calls: any[] = [];
    const bus = {
      enqueue: jest.fn((topic: string, msg: any) => calls.push({ topic, msg })),
    } as any;
    const getContext = async (_text: string) => [{ role: 'user' as const, content: 'hi' }];
    const systemPrompt = () => 'test';
    const orch = OrchestratorSystem(w as any, bus, C as any, getContext, systemPrompt);

    // Set a transcript in one frame
    const cmd = w.beginTick();
    w.set(agent, C.TranscriptFinal, { text: 'hello', ts: Date.now() });
    cmd.flush();
    w.endTick(); // now changedPrev sees TranscriptFinal changed

    // Run orchestrator in next frame
    w.beginTick();
    await orch();
    w.endTick();

    // It should clear text and enqueue an LLM request
    const tf = w.get(agent, C.TranscriptFinal)!;
    expect(tf.text).toBe('');
    expect(bus.enqueue).toHaveBeenCalledTimes(1);
    expect(calls[0].topic).toBe('llm.generate');
  });
});
