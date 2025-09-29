import test from 'ava';
import { sleep } from '@promethean/utils';

import { createAgentWorld } from './world.js';
import { enqueueUtterance } from './helpers/enqueueUtterance.js';
import { OrchestratorSystem } from './systems/orchestrator.js';

function makePlayer() {
    let playing = false;
    const calls = { play: 0, stop: 0, pause: 0, unpause: 0 };
    return {
        play: (_: any) => {
            calls.play++;
            playing = true;
        },
        stop: (_: boolean) => {
            calls.stop++;
            playing = false;
        },
        pause: (_: boolean) => {
            calls.pause++;
            playing = false;
        },
        unpause: () => {
            calls.unpause++;
            playing = true;
        },
        isPlaying: () => playing,
        __calls: calls,
    };
}

test('agent-ecs: enqueueUtterance visibility across ticks', async (t) => {
    const player = makePlayer();
    const { w, agent, C } = createAgentWorld(player);

    const pq0 = w.get(agent, C.PlaybackQ)!;
    t.deepEqual(pq0.items, []);

    // enqueue one utterance (begins a tick internally but does not end it)
    enqueueUtterance(w, agent, C, { factory: async () => ({}) });

    // still in same frame: prev is updated for out-of-tick write, so it is readable
    const pqPrev = w.get(agent, C.PlaybackQ)!;
    t.is(pqPrev.items.length, 1);

    // swap buffers
    w.endTick();

    const pqNext = w.get(agent, C.PlaybackQ)!;
    t.is(pqNext.items.length, 1);
});

test('agent-ecs: arbiter picks audio and marks playing', async (t) => {
    const player = makePlayer();
    const { w, agent, C, tick } = createAgentWorld(player);

    // enqueue an utterance → commit for next frame
    enqueueUtterance(w, agent, C, { factory: async () => ({ buf: 'audio' }) });
    w.endTick();

    let pq = w.get(agent, C.PlaybackQ)!;
    const [eid] = pq.items;
    t.truthy(eid);

    // run systems once: arbiter should pick and call play
    await tick(0);
    // allow async factory microtask to resolve and invoke player.play
    await sleep(0);

    pq = w.get(agent, C.PlaybackQ)!;
    t.deepEqual(pq.items, []); // dequeued

    const utt = w.get(eid, C.Utterance)!;
    t.is(utt.status, 'playing');
    t.is((player as any).__calls.play, 1);
});

test('agent-ecs: orchestrator clears TranscriptFinal and enqueues', async (t) => {
    const player = makePlayer();
    const { w, agent, C } = createAgentWorld(player);

    // Prepare an orchestrator and mock bus
    const calls: any[] = [];
    const bus = {
        enqueue: (topic: string, msg: any) => calls.push({ topic, msg }),
    } as any;
    const getContext = async (_text: string) => [{ role: 'user' as const, content: 'hi' }];
    const systemPrompt = () => 'test';
    const orch = OrchestratorSystem(w, bus, C as any, { getContext, systemPrompt });

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
    t.is(tf.text, '');
    t.is(calls.length, 1);
    t.is(calls[0].topic, 'llm.generate');
});
