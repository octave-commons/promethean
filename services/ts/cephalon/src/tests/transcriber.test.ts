import test from 'ava';
import { PassThrough } from 'node:stream';
import EventEmitter from 'node:events';
import { Transcriber } from '../transcriber.js';

class DummyBroker extends EventEmitter {
	lastEnqueue: { queue: string; task: any } | null = null;
	async connect() {}
	subscribe(_topic: string, handler: (event: any) => void) {
		this.on('event', handler);
	}
	unsubscribe() {}
	publish() {}
	enqueue(queue: string, task: any) {
		this.lastEnqueue = { queue, task };
	}
	ready() {}
	ack() {}
	heartbeat() {}
	onTaskReceived() {}
	emitTranscription(text: string) {
		this.emit('event', { payload: { text } });
	}
}

test('transcriber enqueues pcm and emits transcript', async (t) => {
	const broker = new DummyBroker();
	const transcriber = new Transcriber({ broker });
	const speaker: any = { user: { username: 'test-user' } };
	const events: any[] = [];
	transcriber.on('transcriptStart', (e) => events.push(['start', e]));
	transcriber.on('transcriptEnd', (e) => events.push(['end', e]));
	const pcmStream = new PassThrough();
	transcriber.transcribePCMStream(0, speaker, pcmStream);
	pcmStream.end(Buffer.from([1, 2, 3, 4]));
	broker.emitTranscription('hello world');
	t.is(broker.lastEnqueue?.queue, 'stt.transcribe');
	t.is(broker.lastEnqueue?.task.pcm, Buffer.from([1, 2, 3, 4]).toString('base64'));
	t.is(events[0][0], 'start');
	t.is(events[1][0], 'end');
	t.is(events[1][1].transcript, 'hello world');
});
