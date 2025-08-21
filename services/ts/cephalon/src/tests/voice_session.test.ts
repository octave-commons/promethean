import test from 'ava';
const { VoiceSession } = await import('../voice-session.js');

function makeGuild(id: string): any {
    return { id, voiceAdapterCreator: () => ({}) };
}

function makeUser(id: string, username: string): any {
    return { id, username };
}

test.skip('start joins voice channel', (t) => {
    t.pass();
});

test('addSpeaker registers user', async (t) => {
    const guild = makeGuild('1');
    const vs = new VoiceSession({ voiceChannelId: '99', guild, bot: {} as any });
    const user = makeUser('7', 'bob');
    await vs.addSpeaker(user);
    t.true(vs.speakers.has('7'));
});
