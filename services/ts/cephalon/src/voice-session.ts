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
import { Speaker } from './speaker.js';
import { randomUUID, UUID } from 'crypto';
import { Transcriber } from './transcriber.js';
import { VoiceRecorder } from './voice-recorder.js';
import { Bot } from './bot.js';
import { VoiceSynth } from './voice-synth.js';
import EventEmitter from 'events';
import { renderWaveForm } from './audioProcessing/waveform.js';
import { generateSpectrogram } from './audioProcessing/spectrogram.js';
import { captureScreen } from './desktop/desktopLoop.js';
import { readFile } from 'fs/promises';
import { decode } from 'wav-decoder';

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
    transcriber: Transcriber;
};

export class VoiceSession extends EventEmitter {
    id: UUID;
    guild: discord.Guild;
    voiceChannelId: string;
    options: VoiceSessionOptions;
    speakers: Map<string, Speaker>;
    connection?: VoiceConnection;
    transcriber: Transcriber;
    recorder: VoiceRecorder;
    voiceSynth?: VoiceSynth;
    bot: Bot;
    deps: Omit<CaptureDeps, 'transcriber'>;
    private currentCleanup: (() => void) | null = null;
    private player?: AudioPlayer;

    constructor(options: VoiceSessionOptions, deps: Partial<CaptureDeps> = {}) {
        super();
        this.id = randomUUID();
        this.guild = options.guild;
        this.voiceChannelId = options.voiceChannelId;
        this.bot = options.bot;
        this.options = options;
        this.speakers = new Map();
        this.transcriber = deps.transcriber ?? new Transcriber();
        this.recorder = new VoiceRecorder();
        this.deps = {
            renderWaveForm,
            generateSpectrogram,
            captureScreen,
            readFile,
            decode,
            ...deps,
        };

        this.recorder.on('saved', async ({ filename, saveTime }: any) => {
            const channel = this.bot.captureChannel;
            if (channel) {
                const files: any[] = [];
                files.push(filename);
                try {
                    const buffer = await this.deps.readFile(filename);
                    const audioData = await this.deps.decode(buffer);
                    const waveform = await this.deps.renderWaveForm(audioData.channelData[0], {});
                    files.push({ name: `waveform-${saveTime}.png`, attachment: waveform });
                    const bufferData = Buffer.from(audioData.channelData[0].buffer);
                    const spectrogram = await this.deps.generateSpectrogram(bufferData);
                    files.push({ name: `spectrogram-${saveTime}.png`, attachment: spectrogram });
                    const screenshot = await this.deps.captureScreen();
                    files.push({ name: `screencap-${saveTime}.png`, attachment: screenshot });
                } catch (err) {
                    console.error('Error generating capture files', err);
                }
                await channel.send({ files });
            }
        });
    }
    // ... rest of file unchanged
}
