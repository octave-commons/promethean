import { AudioPlayer, AudioResource } from '@discordjs/voice';
import EventEmitter from 'events';

export type Priority = 0 | 1 | 2;
export type BargeInPolicy = 'none' | 'duck' | 'pause' | 'stop';

export interface Utterance {
	id: string;
	turnId: number;
	priority: Priority;
	bargeIn: BargeInPolicy;
	group?: string;
	makeResource: () => Promise<AudioResource>;
	onStart?: () => void;
	onEnd?: (reason: 'finished' | 'cancelled') => void;
}

export class SpeechArbiter extends EventEmitter {
	private player: AudioPlayer;
	private queue: Utterance[] = [];
	private playing: Utterance | null = null;
	private playingToken = 0;
	private currentTurnId = 0;

	constructor(player: AudioPlayer) {
		super();
		this.player = player;

		this.player.on('error', () => {
			this.cancelCurrent('cancelled');
		});
		this.player.on('stateChange', (oldS: any, newS: any) => {
			if (oldS.status !== 'playing' && newS.status === 'playing') {
				this.emit('play-start', this.playing);
			}
			if (oldS.status === 'playing' && newS.status === 'idle') {
				const done = this.playing;
				this.playing = null;
				done?.onEnd?.('finished');
				this.emit('play-end', done);
				this.kick();
			}
		});
	}

	get audioPlayer() {
		return this.player;
	}

	setTurnId(turnId: number) {
		if (turnId <= this.currentTurnId) return;
		this.currentTurnId = turnId;
		this.queue = this.queue.filter((u) => u.turnId >= this.currentTurnId);
		if (this.playing && this.playing.turnId < this.currentTurnId) {
			this.cancelCurrent('cancelled');
		}
	}

	setUserSpeaking(active: boolean) {
		if (!this.playing) return;
		const policy = this.playing.bargeIn ?? 'pause';
		if (active) {
			if (policy === 'duck') this.emit('duck-on');
			if (policy === 'pause') this.player.pause(true);
			if (policy === 'stop') this.cancelCurrent('cancelled');
		} else {
			if (policy === 'duck') this.emit('duck-off');
			if (policy === 'pause') this.player.unpause();
		}
	}

	enqueue(u: Utterance) {
		if (u.turnId < this.currentTurnId) return;
		if (u.group) {
			this.queue = this.queue.filter((q) => !(q.group === u.group && q.priority <= u.priority));
			if (this.playing && this.playing.group === u.group && this.playing.priority <= u.priority) {
				this.cancelCurrent('cancelled');
			}
		}
		this.queue.push(u);
		this.queue.sort((a, b) => b.priority - a.priority);
		this.kick();
	}

	private async kick() {
		if (this.playing) return;
		while (this.queue.length) {
			const next = this.queue.shift()!;
			if (next.turnId < this.currentTurnId) continue;
			this.playing = next;
			const token = ++this.playingToken;
			try {
				const res = await next.makeResource();
				if (token !== this.playingToken) {
					next.onEnd?.('cancelled');
					continue;
				}
				next.onStart?.();
				this.player.play(res);
				return;
			} catch {
				next.onEnd?.('cancelled');
				this.playing = null;
				continue;
			}
		}
	}

	private cancelCurrent(reason: 'cancelled') {
		if (!this.playing) return;
		const doomed = this.playing;
		this.playing = null;
		this.playingToken++;
		try {
			this.player.stop(true);
		} catch {}
		doomed.onEnd?.(reason);
		this.emit('play-end', doomed);
		this.kick();
	}
}

export class TurnManager extends EventEmitter {
	private _turnId = 0;
	get turnId() {
		return this._turnId;
	}
	bump(reason: string) {
		this._turnId++;
		this.emit('turn', this._turnId, reason);
	}
}
