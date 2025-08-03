import test from 'ava';
import { VoiceSession } from '../src/voice-session.js';
import { Guild } from '../../tests/node_modules/discord.js/index.js';

class MockChannel {
	sendCalls: any[] = [];
	isTextBased() {
		return true;
	}
	async send(payload: any) {
		this.sendCalls.push(payload);
	}
}

test('uploads saved recordings to configured channel', async (t) => {
	const channel = new MockChannel();
	const bot: any = {
		client: { channels: { fetch: async () => channel } },
		recordingChannelId: 'c1',
	};
	const vs = new VoiceSession({ voiceChannelId: '10', guild: new Guild('1'), bot });
	vs.recorder.emit('saved', { filename: 'foo.wav', userId: 'user', saveTime: Date.now() });
	t.is(channel.sendCalls.length, 1);
	t.is(channel.sendCalls[0].files[0], 'foo.wav');
});
