import test from 'ava';
import Module from 'module';

const ModuleAny = Module as any;
const originalLoad = ModuleAny._load;
ModuleAny._load = function (request: string, parent: any, isMain: boolean) {
	if (request.includes('canvas')) return {};
	return originalLoad(request, parent, isMain);
};

const { VoiceSession } = await import('../src/voice-session.js');

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
