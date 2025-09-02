import { World } from '@promethean/ds/ecs.js';
import { defineAgentComponents } from './components.js';
import { VADUpdateSystem } from './systems/vad.js';
import { TurnDetectionSystem } from './systems/turn.js';
import { SpeechArbiterSystem } from './systems/speechArbiter.js';

export function createAgentWorld(audioPlayer: any) {
    const w = new World();
    const C = defineAgentComponents(w);

    // create agent entity
    const cmd = w.beginTick();
    const agent = cmd.createEntity();
    cmd.add(agent, C.Turn);
    cmd.add(agent, C.PlaybackQ, { items: [] });
    cmd.add(agent, C.Policy, { defaultBargeIn: 'pause' as const });
    cmd.add(agent, C.AudioRef, { player: audioPlayer });
    cmd.add(agent, C.RawVAD);
    cmd.add(agent, C.VAD);
    cmd.add(agent, C.TranscriptFinal);
    cmd.add(agent, C.BargeState);
    cmd.add(agent, C.VisionRing);
    cmd.add(agent, C.VoiceState);
    cmd.flush();

    w.endTick();

    const systems: Array<(dtMs: number) => void | Promise<void>> = [
        VADUpdateSystem(w, C),
        TurnDetectionSystem(w, C),
        SpeechArbiterSystem(w, C),
    ];

    async function tick(dtMs = 50) {
        const cmd = w.beginTick();

        for (const s of systems) await s(dtMs);

        cmd.flush();
        w.endTick();
    }

    function addSystem(s: (dtMs: number) => void | Promise<void>) {
        systems.push(s);
    }
    let running = false;
    let tickPromise = Promise.resolve();
    function sleep(ms: number) {
        return new Promise((resolve, _) => {
            setTimeout(resolve, ms);
        });
    }
    async function start(delay: number) {
        let tickStart,
            tickStop,
            dT = 0;
        running = true;
        while (running) {
            tickStart = Date.now();
            await tickPromise;
            tickPromise = tick(dT);
            tickStop = Date.now();
            dT = tickStop - tickStart;
            if (delay >= dT) {
                await sleep(delay - dT);
            }
        }
    }
    async function stop() {
        if (!running) throw new Error('There is no ticker to stop');
        await tickPromise;
        running = false;
    }

    return { w, agent, C, tick, addSystem, start, stop };
}
