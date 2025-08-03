import * as discord from 'discord.js';
import { VoiceSession } from './voice-session';
import { RecordingMetaData } from './voice-recorder';

export class Bot {
	client: discord.Client;
	captureChannel?: discord.TextChannel;
	recordingChannelId?: string;
	currentVoiceSession?: VoiceSession;

	constructor(client: discord.Client) {
		this.client = client;
	}

	sendWaveform(_meta: RecordingMetaData) {
		// Placeholder for waveform handling
	}
}
