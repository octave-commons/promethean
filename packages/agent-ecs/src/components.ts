// Loose typing to avoid cross-package type coupling during build

export type BargeIn = 'none' | 'duck' | 'pause' | 'stop';

export const defineAgentComponents = (w: any) => {
    const BargeState = w.defineComponent({
        name: 'BargeState',
        defaults: () => ({ speakingSince: null, paused: false }),
    });

    const Turn = w.defineComponent({
        name: 'Turn',
        defaults: () => ({ id: 0 }),
    });

    const RawVAD = w.defineComponent({
        name: 'RawVAD',
        defaults: () => ({ level: 0, ts: 0 }),
    });

    const VAD = w.defineComponent({
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

    const PlaybackQ = w.defineComponent({
        name: 'PlaybackQ',
        defaults: () => ({ items: [] }),
    });

    const AudioRef = w.defineComponent({
        name: 'AudioRef',
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

    const Utterance = w.defineComponent({
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

    const AudioRes = w.defineComponent({
        name: 'AudioRes',
        defaults: () => ({ factory: async () => null }),
    });

    const TranscriptFinal = w.defineComponent({
        name: 'TranscriptFinal',
        defaults: () => ({ text: '', ts: 0 }),
    });

    const VisionFrame = w.defineComponent({
        name: 'VisionFrame',
        defaults: () => ({ id: '', ts: 0, ref: { type: 'url', url: '' } }),
    });

    const VisionRing = w.defineComponent({
        name: 'VisionRing',
        defaults: () => ({ frames: [], capacity: 12 }),
    });

    const Policy = w.defineComponent({
        name: 'Policy',
        defaults: () => ({ defaultBargeIn: 'pause' }),
    });

    const VoiceState = w.defineComponent({
        name: 'VoiceState',
        defaults: () => ({ connection: null }),
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
        VoiceState,
    };
};
