import test from 'ava';
import { VoiceSession } from '../voice-session.js';

// Verify that saved recordings and captures are sent to the configured channel

test('uploads saved waveform, spectrogram, and screenshot to configured channel', async (t) => {
	let sent: any = null;
	const channel = {
		send: async (data: any) => {
			sent = data;
		},
	} as any;
	const bot = { captureChannel: channel } as any;
	const deps = {
		readFile: async () => Buffer.from('wav'),
		decode: async () => ({ channelData: [new Float32Array()] }),
		renderWaveForm: async () => Buffer.from('wave'),
		generateSpectrogram: async () => Buffer.from('spec'),
		captureScreen: async () => Buffer.from('screen'),
	};
	const vs = new VoiceSession({ voiceChannelId: '1', guild: {} as any, bot }, deps as any);

	const done = new Promise<void>((resolve) => {
		channel.send = async (data: any) => {
			sent = data;
			resolve();
		};
	});

	vs.recorder.emit('saved', { filename: 'test.wav', userId: 'u', saveTime: 0 });
	await done;

	t.is(sent.files.length, 4);
	t.is(sent.files[0], 'test.wav');
	t.deepEqual(sent.files[1].name, 'waveform-0.png');
	t.deepEqual(sent.files[2].name, 'spectrogram-0.png');
	t.deepEqual(sent.files[3].name, 'screencap-0.png');
});
