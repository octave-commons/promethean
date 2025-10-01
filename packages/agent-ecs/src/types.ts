import type { ComponentType, Entity, World } from '@promethean/ds/ecs.js';

export type BargeIn = 'none' | 'duck' | 'pause' | 'stop';

export type BargeStateComponent = Readonly<{
    speakingSince: number | null;
    paused: boolean;
}>;

export type TurnComponent = Readonly<{ id: number }>;

export type RawVadComponent = Readonly<{ level: number; ts: number }>;

export type VadComponent = Readonly<{
    active: boolean;
    lastTrueAt: number;
    lastFalseAt: number;
    attackMs: number;
    releaseMs: number;
    hangMs: number;
    threshold: number;
    _prevActive: boolean;
}>;

export type PlaybackQueueComponent = Readonly<{ items: ReadonlyArray<Entity> }>;

export type AudioPlayer = {
    readonly play: (resource: unknown) => void | Promise<void>;
    readonly stop: () => void | Promise<void>;
    readonly pause: () => void | Promise<void>;
    readonly unpause: () => void | Promise<void>;
    readonly isPlaying: () => boolean | Promise<boolean>;
};

export type AudioRefComponent = Readonly<{ player: AudioPlayer }>;

export type UtteranceStatus = 'queued' | 'playing' | 'cancelled';

export type UtteranceComponent = Readonly<{
    id: string;
    turnId: number;
    priority: number;
    group?: string;
    bargeIn: BargeIn;
    status: UtteranceStatus;
    token: number;
}>;

export type AudioResourceFactory = () => Promise<unknown>;

export type AudioResComponent = Readonly<{ factory: AudioResourceFactory }>;

export type TranscriptFinalComponent = Readonly<{ text: string; ts: number }>;

export type VisionFrameRef =
    | Readonly<{ type: 'url'; url: string }>
    | Readonly<{ type: 'blob'; data: string; mime?: string }>
    | Readonly<{ type: 'attachment'; id: string; mime?: string }>;

export type VisionFrameComponent = Readonly<{
    id: string;
    ts: number;
    ref: VisionFrameRef;
}>;

export type VisionRingComponent = Readonly<{
    frames: ReadonlyArray<Entity>;
    capacity: number;
}>;

export type PolicyComponent = Readonly<{ defaultBargeIn: BargeIn }>;

export type VoiceConnection = {
    readonly subscribe?: (player: unknown) => void;
    readonly destroy?: () => void;
};

export type VoiceStateComponent = Readonly<{ connection: VoiceConnection | null }>;

export type AgentComponents = {
    readonly BargeState: ComponentType<BargeStateComponent>;
    readonly Turn: ComponentType<TurnComponent>;
    readonly RawVAD: ComponentType<RawVadComponent>;
    readonly VAD: ComponentType<VadComponent>;
    readonly PlaybackQ: ComponentType<PlaybackQueueComponent>;
    readonly AudioRef: ComponentType<AudioRefComponent>;
    readonly Utterance: ComponentType<UtteranceComponent>;
    readonly AudioRes: ComponentType<AudioResComponent>;
    readonly TranscriptFinal: ComponentType<TranscriptFinalComponent>;
    readonly VisionFrame: ComponentType<VisionFrameComponent>;
    readonly VisionRing: ComponentType<VisionRingComponent>;
    readonly Policy: ComponentType<PolicyComponent>;
    readonly VoiceState: ComponentType<VoiceStateComponent>;
};

export type AgentWorld = ReturnType<typeof import('./world.js').createAgentWorld>;

export type AgentWorldDeps = {
    readonly world: World;
    readonly components: AgentComponents;
};
