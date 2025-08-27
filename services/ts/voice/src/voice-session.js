import { AudioPlayerStatus, EndBehaviorType, StreamType, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel, } from '@discordjs/voice';
import { Speaker } from './speaker';
// import {Transcript} from "./transcript"
import { randomUUID } from 'crypto';
import { Transcriber } from './transcriber';
import { VoiceRecorder } from './voice-recorder';
import { VoiceSynth } from './voice-synth';
import EventEmitter from 'events';
export class VoiceSession extends EventEmitter {
    id;
    guild;
    voiceChannelId;
    options;
    speakers;
    // transcript: Transcript;
    connection;
    transcriber;
    recorder;
    voiceSynth;
    constructor(options) {
        super();
        this.id = randomUUID();
        this.guild = options.guild;
        this.voiceChannelId = options.voiceChannelId;
        this.options = options;
        this.speakers = new Map(); // Map of user IDs to Speaker instances
        // this.transcript = new Transcript();
        this.transcriber = new Transcriber();
        this.recorder = new VoiceRecorder();
        this.voiceSynth = new VoiceSynth();
    }
    get receiver() {
        return this.connection?.receiver;
    }
    start() {
        const existingConnection = getVoiceConnection(this.guild.id);
        if (existingConnection) {
            throw new Error('Cannot start new voice session with an existing connection. Bot must leave current voice  session to start a new one.');
        }
        this.connection = joinVoiceChannel({
            guildId: this.guild.id,
            adapterCreator: this.guild.voiceAdapterCreator,
            channelId: this.voiceChannelId,
            selfDeaf: false,
            selfMute: false,
        });
        try {
            this.connection.receiver.speaking.on('start', (userId) => {
                const speaker = this.speakers.get(userId);
                if (speaker) {
                    if (speaker.stream)
                        return;
                    speaker.isSpeaking = true;
                    if (!speaker.stream)
                        speaker.stream = this.getOpusStreamForUser(userId);
                    if (speaker.stream) {
                        speaker.stream.on('end', () => {
                            try {
                                speaker.stream?.destroy(); // prevents any more `push` calls
                            }
                            catch (e) {
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
        }
        catch (err) {
            console.error(err);
            throw new Error('Something went wrong starting the voice session');
        }
    }
    getOpusStreamForUser(userId) {
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
    async addSpeaker(user) {
        if (this.speakers.has(user.id))
            return;
        return this.speakers.set(user.id, new Speaker({
            user,
            transcriber: this.transcriber,
            recorder: this.recorder,
        }));
    }
    async removeSpeaker(user) {
        this.speakers.delete(user.id);
    }
    async startSpeakerRecord(user) {
        const speaker = this.speakers.get(user.id);
        if (speaker) {
            speaker.isRecording = true;
        }
    }
    async startSpeakerTranscribe(user, log = false) {
        const speaker = this.speakers.get(user.id);
        if (speaker) {
            speaker.isTranscribing = true;
            speaker.logTranscript = log;
        }
    }
    async stopSpeakerRecord(user) {
        const speaker = this.speakers.get(user.id);
        if (speaker)
            speaker.isRecording = false;
    }
    async stopSpeakerTranscribe(user) {
        const speaker = this.speakers.get(user.id);
        if (speaker)
            speaker.isTranscribing = false;
    }
    async playVoice(text) {
        return new Promise(async (resolve, _) => {
            if (!this.connection)
                throw new Error('No connection');
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
//# sourceMappingURL=voice-session.js.map