import {
	AudioPlayer,
	AudioPlayerStatus,
	AudioResource,
	EndBehaviorType,
	StreamType,
	VoiceConnection,
	createAudioPlayer,
	createAudioResource,
	getVoiceConnection,
	joinVoiceChannel,
} from '@discordjs/voice';
import * as discord from 'discord.js';
import { Speaker } from './speaker';
// import {Transcript} from "./transcript"
import { randomUUID, UUID } from 'crypto';
import { Transcriber } from './transcriber';
import { VoiceRecorder } from './voice-recorder';
import { Bot } from './bot';
import { VoiceSynth } from './voice-synth';
import EventEmitter from 'events';
import { renderWaveForm } from './audioProcessing/waveform';
import { generateSpectrogram } from './audioProcessing/spectrogram';
import { captureScreen } from './desktop/desktopLoop';
import { readFile } from 'fs/promises';
import { decode } from 'wav-decoder';
/**
   Handles all things voice. Emits an event when a user begins speaking, and when they stop speaking
   the start speaking event will have a timestamp and a wav  stream.
   */

export type VoiceSessionOptions = {
	voiceChannelId: string;
	guild: discord.Guild;
	bot: Bot;
};
type CaptureDeps = {
	renderWaveForm: typeof renderWaveForm;
	generateSpectrogram: typeof generateSpectrogram;
	captureScreen: typeof captureScreen;
	readFile: typeof readFile;
	decode: typeof decode;
};
export class VoiceSession extends EventEmitter {
	id: UUID;
	guild: discord.Guild;
	voiceChannelId: string;
	options: VoiceSessionOptions;
	speakers: Map<string, Speaker>;
	// transcript: Transcript;
	connection?: VoiceConnection;
	transcriber: Transcriber;
	recorder: VoiceRecorder;
	voiceSynth: VoiceSynth;
	bot: Bot;
	deps: CaptureDeps;
	private currentCleanup: (() => void) | null = null;
	private player?: AudioPlayer;
	constructor(options: VoiceSessionOptions, deps: Partial<CaptureDeps> = {}) {
		super();
		this.id = randomUUID();

		this.guild = options.guild;
		this.voiceChannelId = options.voiceChannelId;
		this.bot = options.bot;

		this.options = options;
		this.speakers = new Map(); // Map of user IDs to Speaker instances
		// this.transcript = new Transcript();
		this.transcriber = new Transcriber();
		this.recorder = new VoiceRecorder();
		this.deps = {
			renderWaveForm,
			generateSpectrogram,
			captureScreen,
			readFile,
			decode,
			...deps,
		};
		this.recorder.on('saved', async ({ filename, saveTime }) => {
			const channel = this.bot.captureChannel;
			if (channel) {
				try {
					const wavBuffer = await this.deps.readFile(filename);
					const files: any[] = [filename];
					try {
						const { channelData } = await this.deps.decode(wavBuffer);
						const data = channelData[0];
						if (data) {
							const waveForm = await this.deps.renderWaveForm(data, {
								width: 1024,
								height: 256,
							});
							files.push({
								attachment: waveForm,
								name: `waveform-${saveTime}.png`,
							});
						}
						const spectrogram = await this.deps.generateSpectrogram(wavBuffer);
						files.push({
							attachment: spectrogram,
							name: `spectrogram-${saveTime}.png`,
						});
					} catch (err) {
						console.warn('Failed to generate waveform or spectrogram', err);
					}
					try {
						const screen = await this.deps.captureScreen();
						if (screen.length)
							files.push({
								attachment: screen,
								name: `screencap-${saveTime}.png`,
							});
					} catch (err) {
						console.warn('Failed to capture screen', err);
					}
					await channel.send({ files });
				} catch (e) {
					console.warn('Failed to upload captures', e);
				}
			}
		});
		this.voiceSynth = new VoiceSynth();
	}
	get receiver() {
		return this.connection?.receiver;
	}
	start() {
		const existingConnection = getVoiceConnection(this.guild.id);
		if (existingConnection) {
			throw new Error(
				'Cannot start new voice session with an existing connection. Bot must leave current voice  session to start a new one.',
			);
		}
		this.connection = joinVoiceChannel({
			guildId: this.guild.id,
			adapterCreator: this.guild.voiceAdapterCreator,
			channelId: this.voiceChannelId,
			selfDeaf: false,
			selfMute: false,
		});
		this.player = createAudioPlayer();
		this.connection!.subscribe(this.player);

		// cleanup hook for current resource
		this.player.on('stateChange', (_old, neu) => {
			console.log('[discord] status:', neu.status); // expect Playing → Idle
			if (neu.status === AudioPlayerStatus.Playing) {
				this.emit('audioPlayerStart', this.player);
			} else if (neu.status === AudioPlayerStatus.Idle) {
				// No reliance on oldState.resource — just run whatever we armed at play()
				try {
					this.currentCleanup?.();
				} catch {}
				this.currentCleanup = null;
				this.emit('audioPlayerStop', this.player);
			}
		});
		try {
			this.connection.receiver.speaking.on('start', (userId) => {
				const speaker = this.speakers.get(userId);
				if (speaker) {
					if (speaker.stream) return;
					speaker.isSpeaking = true;

					if (!speaker.stream) speaker.stream = this.getOpusStreamForUser(userId);
					if (speaker.stream) {
						speaker.stream.on('end', () => {
							try {
								speaker.stream?.destroy(); // prevents any more `push` calls
							} catch (e) {
								console.warn('Failed to destroy stream cleanly', e);
							}
						});

						speaker.stream.on('error', (err) => {
							console.warn(`Stream error for ${userId}:`, err);
						});

						// NEW: Prevent pushing to an ended stream by checking
						speaker.stream.on('close', () => {
							console.log(`Stream closed for ${userId}`);
							speaker.stream = null;
						});

						speaker.handleSpeakingStart(speaker.stream);
					}
				}
			});
		} catch (err) {
			console.error(err);
			throw new Error('Something went wrong starting the voice session');
		}
	}
	getOpusStreamForUser(userId: string) {
		return this.receiver?.subscribe(userId, {
			end: {
				behavior: EndBehaviorType.AfterSilence,
				duration: 1_000,
			},
		});
	}
	async stop() {
		if (this.connection) {
			this.connection.destroy();
			this.speakers.clear();
		}
	}
	async addSpeaker(user: discord.User) {
		if (this.speakers.has(user.id)) return;
		return this.speakers.set(
			user.id,
			new Speaker({
				user,
				transcriber: this.transcriber,
				recorder: this.recorder,
			}),
		);
	}
	async removeSpeaker(user: discord.User) {
		this.speakers.delete(user.id);
	}
	async startSpeakerRecord(user: discord.User) {
		const speaker = this.speakers.get(user.id);
		if (speaker) {
			speaker.isRecording = true;
		}
	}
	async startSpeakerTranscribe(user: discord.User, log: boolean = false) {
		const speaker = this.speakers.get(user.id);
		if (speaker) {
			speaker.isTranscribing = true;
			speaker.logTranscript = log;
		}
	}
	async stopSpeakerRecord(user: discord.User) {
		const speaker = this.speakers.get(user.id);
		if (speaker) speaker.isRecording = false;
	}
	async stopSpeakerTranscribe(user: discord.User) {
		const speaker = this.speakers.get(user.id);
		if (speaker) speaker.isTranscribing = false;
	}
	/** Synthesize → return an AudioResource (do NOT play here). */
	async makeResourceFromText(text: string): Promise<AudioResource> {
		const { stream, cleanup } = await this.voiceSynth.generateAndUpsampleVoice(text);
		// stash cleanup in metadata so we can pick it up in our wrapper's play()
		return createAudioResource(stream, {
			inputType: StreamType.Raw,
			metadata: { cleanup }, // your cleanup from VoiceSynth
		});
	}
	/** Wrapper the ECS will use; we arm/clear cleanup here, not via discord events. */
	getEcsAudioRef() {
		const player = this.getPlayer();
		return {
			play: (res: AudioResource) => {
				// arm cleanup for this resource
				this.currentCleanup =
					typeof (res?.metadata as any)?.cleanup === 'function' ? (res.metadata as any).cleanup : null;
				player.play(res);
			},
			pause: (_hard?: boolean) => {
				try {
					player.pause(true);
				} catch {}
			},
			unpause: () => {
				try {
					player.unpause();
				} catch {}
			},
			stop: (_hard?: boolean) => {
				try {
					player.stop(true);
				} catch {}
				// Defer cleanup slightly to avoid smashing in-flight pipes (reduces EPIPEs)
				const fn = this.currentCleanup;
				this.currentCleanup = null;
				if (fn)
					setTimeout(() => {
						try {
							fn();
						} catch {}
					}, 100);
			},
			isPlaying: () => player.state.status === AudioPlayerStatus.Playing,
		};
	}
	getPlayer() {
		if (!this.player) throw new Error('VoiceSession not started');
		return this.player;
	}

	async playVoice(text: string) {
		return new Promise(async (resolve, _) => {
			if (!this.connection) throw new Error('No connection');
			const player = createAudioPlayer();
			const { stream, cleanup } = await this.voiceSynth.generateAndUpsampleVoice(text);

			const resource = createAudioResource(stream, {
				inputType: StreamType.Raw,
			});
			player.play(resource);

			this.emit('audioPlayerStart', player);

			this.connection.subscribe(player);

			player.on(AudioPlayerStatus.Idle, () => {
				cleanup(); // ensure subprocesses are cleaned up
				this.emit('audioPlayerStop', player);
				resolve(this);
			});

			return player; // return the player so you can call pause/stop externally
		});
	}
}
