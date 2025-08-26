import type { Event } from '../events.js';

type Bus = { publish: (msg: any) => void };

export function registerVoiceEffects(
    store: {
        subscribe: (l: (e: Event) => void) => () => void;
        dispatch: (e: Event) => Promise<void>;
    },
    bus: Bus,
) {
    store.subscribe(async (e) => {
        if (e.type === 'VOICE/LEAVE_REQUESTED') {
            bus.publish({ topic: 'VOICE/LEAVE_REQUESTED', ...e });
            await store.dispatch({ type: 'VOICE/LEFT', guildId: e.guildId });
        }
        if (e.type === 'VOICE/JOIN_REQUESTED') {
            bus.publish({ topic: 'VOICE/JOIN_REQUESTED', ...e });
            await store.dispatch({
                type: 'VOICE/JOINED',
                guildId: e.guildId,
                voiceChannelId: e.voiceChannelId,
            });
        }
        if (e.type === 'VOICE/TTS_REQUESTED') {
            bus.publish({ topic: 'VOICE/TTS_REQUESTED', ...e });
        }
    });
}
