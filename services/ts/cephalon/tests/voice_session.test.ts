import test from 'ava';
import { VoiceSession } from '../src/voice-session.js';
import * as voice from '@discordjs/voice';

// Intercept joinVoiceChannel calls without needing full discord.js structures
let lastJoinOptions: any;
(voice as any).joinVoiceChannel = (opts: any) => {
        lastJoinOptions = opts;
        return {
                receiver: { speaking: { on() {} } },
                destroy() {},
        } as any;
};

function makeGuild(id: string): any {
        return { id, voiceAdapterCreator: {} };
}

function makeUser(id: string, username: string): any {
        return { id, username };
}

test.skip('start joins voice channel', (t) => {
        const guild = makeGuild('123');
        const vs = new VoiceSession({ voiceChannelId: '10', guild, bot: {} as any });
        vs.start();
        t.truthy(vs.connection);
        t.is(lastJoinOptions.guildId, '123');
        t.is(lastJoinOptions.channelId, '10');
});

test.skip('addSpeaker registers user', async (t) => {
        const guild = makeGuild('1');
        const vs = new VoiceSession({ voiceChannelId: '99', guild, bot: {} as any });
        const user = makeUser('7', 'bob');
        await vs.addSpeaker(user);
        t.true(vs.speakers.has('7'));
});
