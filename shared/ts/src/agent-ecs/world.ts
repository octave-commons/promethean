import { World, Entity } from '../ds/ecs';
import { defineAgentComponents } from './components';
import { VADUpdateSystem } from './systems/vad';
import { TurnDetectionSystem } from './systems/turn';
import { SpeechArbiterSystem } from './systems/speechArbiter';
// ecs/carry.ts

// Carry a *subset* of components for all entities that have them in the current buffer.
// This avoids needing a "query all" and keeps it cheap enough for now.
function carryForTick(
  w: World,
  components: Array<any>, // component defs (e.g., C.Turn, C.PlaybackQ, etc.)
) {
  for (const Comp of components) {
    // Query "all entities that have this Comp"
    const q = w.makeQuery({ all: [Comp] });
    for (const [eid, get] of w.iter(q)) {
      const cur = get(Comp); // reads from current buffer
      if (cur !== undefined && cur !== null) {
        // write-through into next buffer unchanged
        w.set(eid as Entity, Comp, cur);
      }
    }
  }
}

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
  cmd.flush();

  w.endTick();

  const systems: Array<(dtMs: number) => void | Promise<void>> = [
    VADUpdateSystem(w, C),
    TurnDetectionSystem(w, C),
    SpeechArbiterSystem(w, C),
  ];

  async function tick(dtMs = 50) {
    const cmd = w.beginTick();

    // 1) Carry: snapshot current → next so reads don't vanish when turn bumps
    // carryForTick(w, [
    //     C.Turn,
    //     C.Policy,
    //     C.PlaybackQ,
    //     C.Utterance,
    //     C.AudioRes,
    //     C.AudioRef,
    //     C.VAD,
    //     C.RawVAD,
    //     C.TranscriptFinal
    // ]);

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
