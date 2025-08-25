import type { Event } from '../events.js';
import runLeave, { type LeaveVoiceInput } from '../../actions/leave-voice.js';
import { buildLeaveVoiceScope } from '../../actions/leave-voice.scope.js';
import runJoin from '../../actions/join-voice.js';
import { buildJoinVoiceScope, makeJoinAction } from '../../actions/join-voice.scope.js';

export function registerVoiceEffects(store: {
    subscribe: (l: (e: Event) => void) => () => void;
    dispatch: (e: Event) => Promise<void>;
}) {
    store.subscribe(async (e) => {
        if (e.type === 'VOICE/LEAVE_REQUESTED') {
            const scope = await buildLeaveVoiceScope();
            const input: LeaveVoiceInput = { guildId: e.guildId } as LeaveVoiceInput;
            if (e.channelId !== undefined) (input as any).channelId = e.channelId;
            try {
                await runLeave(scope, input);
            } finally {
                await store.dispatch({ type: 'VOICE/LEFT', guildId: e.guildId });
            }
        }
        if (e.type === 'VOICE/JOIN_REQUESTED') {
            // Note: without a Bot context, this effect cannot actually join; keep as placeholder.
            // In future, register effects with a Bot-aware scope.
            try {
                const scope = { ...(await buildJoinVoiceScope()), join: makeJoinAction() } as any;
                await runJoin(scope, {
                    bot: undefined as any, // requires Bot; left unimplemented in effect wiring
                    guild: undefined as any,
                    voiceChannelId: e.voiceChannelId,
                } as any);
            } finally {
                await store.dispatch({ type: 'VOICE/JOINED', guildId: e.guildId, voiceChannelId: e.voiceChannelId });
            }
        }
    });
}
