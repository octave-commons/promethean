import test from 'ava';
import EventEmitter from 'events';
import { SpeechArbiter, TurnManager, Utterance } from '../agent/speechCoordinator';

class FakePlayer extends EventEmitter {
	play() {
		this.emit('stateChange', { status: 'idle' }, { status: 'playing' });
		this.emit('stateChange', { status: 'playing' }, { status: 'idle' });
	}
	pause() {}
	unpause() {}
	stop() {}
}

test('arbiter drops stale utterances', async (t) => {
	const player = new FakePlayer() as any;
	const arb = new SpeechArbiter(player);
	const turn = new TurnManager();
	turn.on('turn', (id) => arb.setTurnId(id));
	turn.bump('start');
	const played: string[] = [];
	arb.on('play-start', (u) => played.push(u!.id));
	const oldU: Utterance = {
		id: 'old',
		turnId: 0,
		priority: 1,
		bargeIn: 'pause',
		makeResource: async () => ({}) as any,
	};
	const newU: Utterance = {
		id: 'new',
		turnId: 1,
		priority: 1,
		bargeIn: 'pause',
		makeResource: async () => ({}) as any,
	};
	arb.enqueue(oldU);
	arb.enqueue(newU);
	await new Promise((r) => setTimeout(r, 10));
	t.deepEqual(played, ['new']);
});

test('arbiter prioritizes higher priority', async (t) => {
	const player = new FakePlayer() as any;
	const arb = new SpeechArbiter(player);
	arb.setTurnId(1);
	const played: string[] = [];
	arb.on('play-start', (u) => played.push(u!.id));
	const low: Utterance = {
		id: 'low',
		turnId: 1,
		priority: 0,
		bargeIn: 'pause',
		group: 'g',
		makeResource: async () => ({}) as any,
	};
	const high: Utterance = {
		id: 'high',
		turnId: 1,
		priority: 2,
		bargeIn: 'pause',
		group: 'g',
		makeResource: async () => ({}) as any,
	};
	arb.enqueue(low);
	arb.enqueue(high);
	await new Promise((r) => setTimeout(r, 10));
	t.deepEqual(played, ['high']);
});
