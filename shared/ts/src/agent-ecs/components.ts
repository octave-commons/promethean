import type { World } from "../ds/ecs";

export type BargeIn = "none" | "duck" | "pause" | "stop";

export const defineAgentComponents = (w: World) => {
  const BargeState = w.defineComponent<{
    speakingSince: number | null;
    paused: boolean;
  }>({
    name: "BargeState",
    defaults: () => ({ speakingSince: null, paused: false }),
  });

  const Turn = w.defineComponent<{ id: number }>({
    name: "Turn",
    defaults: () => ({ id: 0 }),
  });

  const RawVAD = w.defineComponent<{ level: number; ts: number }>({
    name: "RawVAD",
    defaults: () => ({ level: 0, ts: 0 }),
  });

  const VAD = w.defineComponent<{
    active: boolean;
    lastTrueAt: number;
    lastFalseAt: number;
    attackMs: number;
    releaseMs: number;
    hangMs: number;
    threshold: number;
    _prevActive?: boolean; // local prev flag (not persisted across restarts)
  }>({
    name: "VAD",
    defaults: () => ({
      active: false,
      lastTrueAt: 0,
      lastFalseAt: 0,
      attackMs: 120,
      releaseMs: 250,
      hangMs: 800,
      threshold: 0.5,
      _prevActive: false,
    }),
  });

  const PlaybackQ = w.defineComponent<{ items: number[] }>({
    name: "PlaybackQ",
    defaults: () => ({ items: [] }),
  });

  const AudioRef = w.defineComponent<{
    player: {
      play: (res: any) => void;
      stop: (force?: boolean) => void;
      pause: (force?: boolean) => void;
      unpause: () => void;
      isPlaying: () => boolean;
    };
  }>({
    name: "AudioRef",
    defaults: () => ({
      player: {
        play() {},
        stop() {},
        pause() {},
        unpause() {},
        isPlaying: () => false,
      },
    }),
  });

  const Utterance = w.defineComponent<{
    id: string;
    turnId: number;
    priority: number;
    group?: string;
    bargeIn: BargeIn;
    status: "queued" | "playing" | "done" | "cancelled";
    token: number; // race-cancel token
  }>({
    name: "Utterance",
    defaults: () => ({
      id: "",
      turnId: 0,
      priority: 1,
      bargeIn: "pause",
      status: "queued",
      token: 0,
    }),
  });

  const AudioRes = w.defineComponent<{
    factory: () => Promise<any>;
    durationMs?: number;
  }>({
    name: "AudioRes",
    defaults: () => ({ factory: async () => null }),
  });

  const TranscriptFinal = w.defineComponent<{ text: string; ts: number }>({
    name: "TranscriptFinal",
    defaults: () => ({ text: "", ts: 0 }),
  });

  const VisionFrame = w.defineComponent<{
    id: string;
    ts: number;
    ref: {
      type: "url" | "blob" | "attachment";
      url?: string;
      mime?: string;
      data?: string;
      id?: string;
    };
  }>({
    name: "VisionFrame",
    defaults: () => ({ id: "", ts: 0, ref: { type: "url", url: "" } }),
  });

  const VisionRing = w.defineComponent<{ frames: number[]; capacity: number }>({
    name: "VisionRing",
    defaults: () => ({ frames: [], capacity: 12 }),
  });

  const Policy = w.defineComponent<{ defaultBargeIn: BargeIn }>({
    name: "Policy",
    defaults: () => ({ defaultBargeIn: "pause" }),
  });

  return {
    Turn,
    RawVAD,
    VAD,
    PlaybackQ,
    AudioRef,
    Utterance,
    AudioRes,
    TranscriptFinal,
    VisionFrame,
    BargeState,
    VisionRing,
    Policy,
  };
};
