import type { Entity, World } from '@promethean/ds/ecs.js';

import type { AgentComponents, AudioResourceFactory, VoiceConnection } from '../types.js';
import { enqueueUtterance } from '../helpers/enqueueUtterance.js';

type JoinVoiceRequest = {
    readonly guildId: string;
    readonly voiceChannelId: string;
} & Record<string, unknown>;

type LeaveVoiceRequest = {
    readonly guildId: string;
} & Record<string, unknown>;

type TtsRequest = {
    readonly message: string;
} & Record<string, unknown>;

type VoiceDeps = {
    readonly joinVoiceChannel: (options: JoinVoiceRequest) => VoiceConnection | undefined;
    readonly createAudioResource: (stream: unknown) => unknown;
    readonly tts: (text: string) => Promise<{ stream: unknown; cleanup?: () => void }>;
};

type BusMessage = { readonly topic: string } & Record<string, unknown>;

type Bus = {
    readonly subscribe: <T>(topic: string, handler: (message: T) => void | Promise<void>) => void;
    readonly publish: (message: BusMessage) => void;
};

const isJoinRequest = (value: unknown): value is JoinVoiceRequest =>
    typeof value === 'object' &&
    value != null &&
    typeof (value as Partial<JoinVoiceRequest>).guildId === 'string' &&
    typeof (value as Partial<JoinVoiceRequest>).voiceChannelId === 'string';

const isLeaveRequest = (value: unknown): value is LeaveVoiceRequest =>
    typeof value === 'object' && value != null && typeof (value as Partial<LeaveVoiceRequest>).guildId === 'string';

const isTtsRequest = (value: unknown): value is TtsRequest =>
    typeof value === 'object' && value != null && typeof (value as Partial<TtsRequest>).message === 'string';

const createAudioFactory =
    (deps: VoiceDeps, message: string): AudioResourceFactory =>
    async () => {
        const { stream } = await deps.tts(message);
        return deps.createAudioResource(stream);
    };

type VoiceSystemContext = {
    readonly world: World;
    readonly agent: Entity;
    readonly components: AgentComponents;
    readonly bus: Bus;
    readonly deps: VoiceDeps;
};

export const VoiceSystem = ({ world, agent, components, bus, deps }: VoiceSystemContext): void => {
    const { VoiceState, AudioRef } = components;

    bus.subscribe('VOICE/JOIN_REQUESTED', async (event) => {
        if (!isJoinRequest(event)) return;
        const state = world.get(agent, VoiceState);
        if (state?.connection) return;
        const connection = deps.joinVoiceChannel(event) ?? null;
        const player = world.get(agent, AudioRef)?.player;
        if (connection?.subscribe && player) {
            try {
                connection.subscribe(player);
            } catch (error) {
                console.warn('[voice] failed to subscribe connection', error);
            }
        }
        world.set(agent, VoiceState, { connection });
        bus.publish({ topic: 'VOICE/JOINED', guildId: event.guildId, voiceChannelId: event.voiceChannelId });
    });

    bus.subscribe('VOICE/LEAVE_REQUESTED', async (event) => {
        if (!isLeaveRequest(event)) return;
        const state = world.get(agent, VoiceState);
        try {
            state?.connection?.destroy?.();
        } catch (error) {
            console.warn('[voice] failed to destroy connection', error);
        }
        world.set(agent, VoiceState, { connection: null });
        bus.publish({ topic: 'VOICE/LEFT', guildId: event.guildId });
    });

    bus.subscribe('VOICE/TTS_REQUESTED', async (event) => {
        if (!isTtsRequest(event)) return;
        const state = world.get(agent, VoiceState);
        if (!state?.connection) return;
        enqueueUtterance(world, agent, components, {
            id: `${Date.now()}`,
            group: 'agent-speech',
            factory: createAudioFactory(deps, event.message),
        });
    });
};
