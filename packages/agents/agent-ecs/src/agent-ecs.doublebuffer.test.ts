import test from 'ava';
import { sleep } from '@promethean/utils';

import type { AudioPlayer } from './types.js';
import { createAgentWorld } from './world.js';
import { enqueueUtterance } from './helpers/enqueueUtterance.js';
import { OrchestratorSystem, type OrchestratorBus } from './systems/orchestrator.js';

type PlayerCallCounts = {
    readonly play: number;
    readonly stop: number;
    readonly pause: number;
    readonly unpause: number;
};

class TestAudioPlayer implements AudioPlayer {
    #playing = false;
    #playCount = 0;
    #stopCount = 0;
    #pauseCount = 0;
    #unpauseCount = 0;

    play(): void {
        this.#playCount += 1;
        this.#playing = true;
    }

    stop(): void {
        this.#stopCount += 1;
        this.#playing = false;
    }

    pause(): void {
        this.#pauseCount += 1;
        this.#playing = false;
    }

    unpause(): void {
        this.#unpauseCount += 1;
        this.#playing = true;
    }

    isPlaying(): boolean {
        return this.#playing;
    }

    get calls(): PlayerCallCounts {
        return {
            play: this.#playCount,
            stop: this.#stopCount,
            pause: this.#pauseCount,
            unpause: this.#unpauseCount,
        };
    }
}

const makePlayer = (): TestAudioPlayer => new TestAudioPlayer();

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

    const initialQueue = w.get(agent, C.PlaybackQ)!;
    const [maybeEntity] = initialQueue.items;
    if (!maybeEntity) {
        t.fail('expected queued utterance');
        return;
    }
    const eid = maybeEntity;

    // run systems once: arbiter should pick and call play
    await tick(0);
    // allow async factory microtask to resolve and invoke player.play
    await sleep(0);

    const afterTick = w.get(agent, C.PlaybackQ)!;
    t.deepEqual(afterTick.items, []); // dequeued

    const utt = w.get(eid, C.Utterance)!;
    t.is(utt.status, 'playing');
    t.is(player.calls.play, 1);
});

test('agent-ecs: orchestrator clears TranscriptFinal and enqueues', async (t) => {
    const player = makePlayer();
    const { w, agent, C } = createAgentWorld(player);

    // Prepare an orchestrator and mock bus
    const calls: Array<{ topic: string; msg: unknown }> = [];
    const bus: OrchestratorBus = {
        enqueue: (topic: string, msg: unknown) => {
            calls.push({ topic, msg });
        },
    };
    const getContext = async (_text: string) => [{ role: 'user' as const, content: 'hi' }];
    const systemPrompt = () => 'test';
    const orch = OrchestratorSystem({
        world: w,
        bus,
        components: C,
        getContext,
        systemPrompt,
    });

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
    const [firstCall] = calls;
    if (!firstCall) {
        t.fail('expected LLM enqueue');
        return;
    }
    t.is(firstCall.topic, 'llm.generate');
});
