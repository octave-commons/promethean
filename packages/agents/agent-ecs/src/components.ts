import type { World } from '@promethean/ds/ecs.js';

import type {
    AgentComponents,
    AudioPlayer,
    AudioRefComponent,
    AudioResComponent,
    BargeStateComponent,
    PlaybackQueueComponent,
    PolicyComponent,
    RawVadComponent,
    TranscriptFinalComponent,
    TurnComponent,
    UtteranceComponent,
    VadComponent,
    VisionFrameComponent,
    VisionRingComponent,
    VoiceStateComponent,
} from './types.js';

const createStubPlayer = (): AudioPlayer => ({
    play: () => {},
    stop: () => {},
    pause: () => {},
    unpause: () => {},
    isPlaying: () => false,
});

const defineBargeState = (world: World) =>
    world.defineComponent<BargeStateComponent>({
        name: 'BargeState',
        defaults: () => ({ speakingSince: null, paused: false }),
    });

const defineTurn = (world: World) =>
    world.defineComponent<TurnComponent>({
        name: 'Turn',
        defaults: () => ({ id: 0 }),
    });

const defineRawVad = (world: World) =>
    world.defineComponent<RawVadComponent>({
        name: 'RawVAD',
        defaults: () => ({ level: 0, ts: 0 }),
    });

const defineVad = (world: World) =>
    world.defineComponent<VadComponent>({
        name: 'VAD',
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

const definePlaybackQueue = (world: World) =>
    world.defineComponent<PlaybackQueueComponent>({
        name: 'PlaybackQ',
        defaults: () => ({ items: [] }),
    });

const defineAudioRef = (world: World) =>
    world.defineComponent<AudioRefComponent>({
        name: 'AudioRef',
        defaults: () => ({ player: createStubPlayer() }),
    });

const defineUtterance = (world: World) =>
    world.defineComponent<UtteranceComponent>({
        name: 'Utterance',
        defaults: () => ({
            id: '',
            turnId: 0,
            priority: 1,
            bargeIn: 'pause',
            status: 'queued',
            token: 0,
        }),
    });

const defineAudioRes = (world: World) =>
    world.defineComponent<AudioResComponent>({
        name: 'AudioRes',
        defaults: () => ({ factory: async () => undefined }),
    });

const defineTranscriptFinal = (world: World) =>
    world.defineComponent<TranscriptFinalComponent>({
        name: 'TranscriptFinal',
        defaults: () => ({ text: '', ts: 0 }),
    });

const defineVisionFrame = (world: World) =>
    world.defineComponent<VisionFrameComponent>({
        name: 'VisionFrame',
        defaults: () => ({ id: '', ts: 0, ref: { type: 'url', url: '' } }),
    });

const defineVisionRing = (world: World) =>
    world.defineComponent<VisionRingComponent>({
        name: 'VisionRing',
        defaults: () => ({ frames: [], capacity: 12 }),
    });

const definePolicy = (world: World) =>
    world.defineComponent<PolicyComponent>({
        name: 'Policy',
        defaults: () => ({ defaultBargeIn: 'pause' }),
    });

const defineVoiceState = (world: World) =>
    world.defineComponent<VoiceStateComponent>({
        name: 'VoiceState',
        defaults: () => ({ connection: null }),
    });

export const defineAgentComponents = (world: World): AgentComponents => ({
    Turn: defineTurn(world),
    RawVAD: defineRawVad(world),
    VAD: defineVad(world),
    PlaybackQ: definePlaybackQueue(world),
    AudioRef: defineAudioRef(world),
    Utterance: defineUtterance(world),
    AudioRes: defineAudioRes(world),
    TranscriptFinal: defineTranscriptFinal(world),
    VisionFrame: defineVisionFrame(world),
    BargeState: defineBargeState(world),
    VisionRing: defineVisionRing(world),
    Policy: definePolicy(world),
    VoiceState: defineVoiceState(world),
});
