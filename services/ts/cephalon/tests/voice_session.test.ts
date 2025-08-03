import test from 'ava';
import Module from 'module';

const ModuleAny = Module as any;
const originalLoad = ModuleAny._load;
ModuleAny._load = function (request: string, parent: any, isMain: boolean) {
	if (request.includes('canvas')) return {};
	return originalLoad(request, parent, isMain);
};

const { VoiceSession } = await import('../src/voice-session.js');

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
