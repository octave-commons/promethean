import { enqueueUtterance } from "../helpers/enqueueUtterance";

export function wireAdapters(
  world: ReturnType<typeof import("../world").createAgentWorld>,
  deps: {
    tts: { synth: (text: string) => Promise<any> }; // returns AudioResource-compatible stream
  },
) {
  const { w, agent, C } = world;

  return {
    onRawLevel(level: number) {
      const vad = w.get(agent, C.RawVAD)!; // ensure RawVAD is added if you want per-agent source
      if (!vad) {
        const cmd = w.beginTick();
        cmd.add(agent, C.RawVAD, { level, ts: Date.now() });
        cmd.flush();
        w.endTick();
      } else {
        vad.level = level;
        vad.ts = Date.now();
        w.set(agent, C.RawVAD, vad);
      }
    },
    onFinalTranscript(text: string) {
      const cmd = w.beginTick();
      cmd.add(agent, C.TranscriptFinal, { text, ts: Date.now() });
      cmd.flush();
      w.endTick();
    },
    speak(text: string) {
      enqueueUtterance(w, agent, {
        group: "agent-speech",
        priority: 1,
        bargeIn: "pause",
        factory: async () => deps.tts.synth(text),
      });
    },
  };
}
