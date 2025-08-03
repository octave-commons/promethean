import test from 'ava';
import { Bot } from '../src/bot.js';

class TestBot extends Bot {
	constructor() {
		super({ token: 't', applicationId: 'app' });
	}
}

test('sendWaveform uploads to configured channel', async (t) => {
	const bot = new TestBot();
	bot.waveformChannelId = 'chan';
	const sent: any[] = [];
	// @ts-ignore
	bot.client.channels.fetch = async (id: string) => {
		t.is(id, 'chan');
		return {
			isTextBased: () => true,
			send: async (payload: any) => {
				sent.push(payload);
			},
		} as any;
	};
	await bot.sendWaveform({ filename: 'file.wav', userId: 'u', saveTime: 0 });
	t.deepEqual(sent, [{ files: ['file.wav'] }]);
});

test('setWaveformChannel stores channel id', async (t) => {
	const bot = new TestBot();
	let replied: string | undefined;
	const interaction: any = {
		options: {
			getChannel: (_name: string, _required: boolean) => ({ id: '123', isTextBased: () => true }),
		},
		reply: async (msg: string) => {
			replied = msg;
		},
	};
	await bot.setWaveformChannel(interaction);
	t.is(bot.waveformChannelId, '123');
	t.truthy(replied);
});
