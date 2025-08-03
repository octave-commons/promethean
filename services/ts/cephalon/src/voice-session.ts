import { VoiceConnection, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import * as discord from 'discord.js';
import { Speaker } from './speaker';
import { randomUUID, UUID } from 'crypto';
import { Transcriber } from './transcriber';
import { VoiceRecorder, RecordingMetaData } from './voice-recorder';
import { Bot } from './bot';
import { VoiceSynth } from './voice-synth';
import EventEmitter from 'events';

export type VoiceSessionOptions = {
	voiceChannelId: string;
	guild: discord.Guild;
	bot: Bot;
};

export class VoiceSession extends EventEmitter {
	id: UUID = randomUUID();
	guild: discord.Guild;
	voiceChannelId: string;
	options: VoiceSessionOptions;
	speakers: Map<string, Speaker> = new Map();
	connection?: VoiceConnection;
	transcriber: Transcriber = new Transcriber();
	recorder: VoiceRecorder = new VoiceRecorder();
	voiceSynth: VoiceSynth = new VoiceSynth();
	bot: Bot;

	constructor(options: VoiceSessionOptions) {
		super();
		this.guild = options.guild;
		this.voiceChannelId = options.voiceChannelId;
		this.bot = options.bot;
		this.options = options;
		this.recorder.on('saved', (meta: RecordingMetaData) => this.bot.sendWaveform(meta));
	}

	get receiver() {
		return this.connection?.receiver;
	}

	start() {
		const existingConnection = getVoiceConnection(this.guild.id);
		if (existingConnection) {
			throw new Error('Cannot start new voice session with an existing connection.');
		}
		this.connection = joinVoiceChannel({
			guildId: this.guild.id,
			adapterCreator: this.guild.voiceAdapterCreator,
			channelId: this.voiceChannelId,
			selfDeaf: false,
			selfMute: false,
		});
	}
}
