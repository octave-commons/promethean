import test from 'ava';
import { VoiceSession } from '../src/voice-session.js';

// Verify that saved recordings are sent to the configured channel

test('uploads saved waveform to configured channel', async (t) => {
	let sent: any = null;
	const channel = {
		send: async (data: any) => {
			sent = data;
		},
	} as any;
	const bot = { waveformChannel: channel } as any;
	const vs = new VoiceSession({ voiceChannelId: '1', guild: {} as any, bot });

	const done = new Promise<void>((resolve) => {
		channel.send = async (data: any) => {
			sent = data;
			resolve();
		};
	});

	vs.recorder.emit('saved', { filename: 'test.wav', userId: 'u', saveTime: 0 });
	await done;

	t.deepEqual(sent.files, ['test.wav']);
});
