import * as discord from 'discord.js';
import {
	Client,
	Events,
	GatewayIntentBits,
	ApplicationCommandOptionType,
	REST,
	Routes,
<<<<<<< HEAD
=======
	ChannelType,
	TextChannel,
>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration
	type RESTPutAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { VoiceSession } from './voice-session';
import { FinalTranscript } from './transcriber';
import EventEmitter from 'events';
import { AIAgent } from './agent';
import { AGENT_NAME } from '../../../../shared/js/env.js';
import { ContextManager } from './contextManager';
import { LLMService } from './llm-service';
import { CollectionManager } from './collectionManager';
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { RecordingMetaData } from './voice-recorder';
>>>>>>> origin/codex/update-cephalon-for-waveform-storage
=======
>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration

// const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:4000';

type Interaction = discord.ChatInputCommandInteraction<'cached'>;

function interaction(commandConfig: Omit<discord.RESTPostAPIChatInputApplicationCommandsJSONBody, 'name'>) {
	return function (target: any, key: string, describer: PropertyDescriptor) {
		const ctor = target.constructor as typeof Bot;
		const originalMethod = describer.value;
		const name = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`).toLowerCase();
		ctor.interactions.set(name, { name, ...commandConfig });
		ctor.handlers.set(name, (bot: Bot, interaction: Interaction) => originalMethod.call(bot, interaction));
		return describer;
	};
}

export interface BotOptions {
	token: string;
	applicationId: string;
}

export class Bot extends EventEmitter {
	static interactions = new Map<string, discord.RESTPostAPIChatInputApplicationCommandsJSONBody>();
	static handlers = new Map<string, (bot: Bot, interaction: Interaction) => Promise<any>>();

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration
	agent: AIAgent;
	client: Client;
	token: string;
	applicationId: string;
	context: ContextManager = new ContextManager();
	currentVoiceSession?: any;
<<<<<<< HEAD
<<<<<<< HEAD
	captureChannel?: discord.TextChannel;
	desktopChannel?: discord.TextChannel;
=======
	waveformChannelId?: string;
>>>>>>> origin/codex/update-cephalon-for-waveform-storage
=======
    agent: AIAgent;
    client: Client;
    token: string;
    applicationId: string;
    context: ContextManager = new ContextManager();
    currentVoiceSession?: any;
    recordingChannelId?: string;
>>>>>>> origin/codex/update-cephalon-to-store-audio-recordings
=======
	screenshotChannelId?: string;
>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration

	constructor(options: BotOptions) {
		super();
		this.token = options.token;
		this.applicationId = options.applicationId;
		this.client = new Client({
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
		});
<<<<<<< HEAD
<<<<<<< HEAD
		this.agent = new AIAgent({ historyLimit: 20, bot: this, context: this.context, llm: new LLMService() });
=======
		this.agent = new AIAgent({ historyLimit: 5, bot: this, context: this.context, llm: new LLMService() });
>>>>>>> origin/codex/update-cephalon-for-waveform-storage
=======
		this.agent = new AIAgent({ historyLimit: 5, bot: this, context: this.context, llm: new LLMService() });
>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration
	}

	get guilds(): Promise<discord.Guild[]> {
		return this.client.guilds
			.fetch()
			.then((guildCollection) => Promise.all(guildCollection.map((g) => this.client.guilds.fetch(g.id))));
	}

	async start() {
		await this.context.createCollection('transcripts', 'text', 'createdAt');
		await this.context.createCollection(`${AGENT_NAME}_discord_messages`, 'content', 'created_at');
		await this.context.createCollection('agent_messages', 'text', 'createdAt');
		await this.client.login(this.token);
		await this.registerInteractions();

		this.client
			.on(Events.InteractionCreate, async (interaction) => {
				if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
				if (!Bot.interactions.has(interaction.commandName)) {
					await interaction.reply('Unknown command');
					return;
				}
				try {
					const handler = Bot.handlers.get(interaction.commandName);
					if (handler) await handler(this, interaction);
				} catch (e) {
					console.warn(e);
				}
			})
<<<<<<< HEAD
<<<<<<< HEAD
			.on(Events.MessageCreate, async (message) => {
				await this.forwardAttachments(message);
			})
=======
>>>>>>> origin/codex/update-cephalon-for-waveform-storage
=======
>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration
			.on(Events.Error, console.error);
	}

	async registerInteractions() {
		const commands: RESTPutAPIApplicationCommandsJSONBody = [];
		for (const [, command] of Bot.interactions) commands.push(command);
		return Promise.all(
			(await this.guilds).map((guild) =>
				new REST()
					.setToken(this.token)
					.put(Routes.applicationGuildCommands(this.applicationId, guild.id), { body: commands }),
			),
		);
	}

<<<<<<< HEAD
<<<<<<< HEAD
	async forwardAttachments(message: discord.Message) {
		if (!this.captureChannel) return;
		if (message.author?.bot) return;
		const imageAttachments = [...message.attachments.values()].filter((att) => att.contentType?.startsWith('image/'));
		if (!imageAttachments.length) return;
		const files = imageAttachments.map((att) => ({ attachment: att.url, name: att.name }));
		try {
			await this.captureChannel.send({ files });
		} catch (e) {
			console.warn('Failed to forward attachments', e);
		}
	}

<<<<<<<
=======
	async sendWaveform(meta: RecordingMetaData) {
		if (!this.waveformChannelId) return;
		try {
			const channel = await this.client.channels.fetch(this.waveformChannelId);
			if (channel?.isTextBased()) {
				await channel.send({ files: [meta.filename] });
			}
		} catch (e) {
			console.warn('Failed to send waveform', e);
		}
	}

>>>>>>> origin/codex/update-cephalon-for-waveform-storage
=======
	async logScreenshot(buffer: Buffer) {
		if (!this.screenshotChannelId) return;
		try {
			const channel = await this.client.channels.fetch(this.screenshotChannelId);
			if (channel && channel.isTextBased()) {
				await (channel as TextChannel).send({
					files: [{ attachment: buffer, name: `screenshot-${Date.now()}.png` }],
				});
			}
		} catch (e) {
			console.warn(e);
		}
	}

	@interaction({
		description: 'Set the channel where screenshots will be stored',
		options: [
			{
				name: 'channel',
				description: 'Target text channel',
				type: ApplicationCommandOptionType.Channel,
				channel_types: [ChannelType.GuildText],
				required: true,
			},
		],
	})
	async setScreenshotChannel(interaction: Interaction) {
		const channel = interaction.options.getChannel('channel', true);
		if (!channel.isTextBased()) {
			return interaction.reply('Please choose a text channel.');
		}
		this.screenshotChannelId = channel.id;
		return interaction.reply(`Screenshots will be sent to ${channel.toString()}`);
	}

>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration
	@interaction({
		description: 'Joins the voice channel the requesting user is currently in',
	})
	async joinVoiceChannel(interaction: Interaction): Promise<any> {
		// Join the specified voice channel
		await interaction.deferReply();
		let textChannel: discord.TextChannel | null;
		if (interaction?.channel?.id) {
			const channel = await this.client.channels.fetch(interaction?.channel?.id);
			if (channel?.isTextBased()) {
				textChannel = channel as discord.TextChannel;
			}
		}
		if (this.currentVoiceSession) {
			return interaction.followUp('Cannot join a new voice session with out leaving the current one.');
		}
		if (!interaction.member.voice?.channel?.id) {
			return interaction.followUp('Join a voice channel then try that again.');
		}
		this.currentVoiceSession = new VoiceSession({
			bot: this,
			guild: interaction.guild,
			voiceChannelId: interaction.member.voice.channel.id,
		});
		this.currentVoiceSession.transcriber.on('transcriptEnd', async (transcript: FinalTranscript) => {
			const transcripts = this.context.getCollection('transcripts') as CollectionManager<'text', 'createdAt'>;
			await transcripts.addEntry({
				text: transcript.transcript,
				createdAt: transcript.startTime || Date.now(),
				metadata: {
					createdAt: Date.now(),
					endTime: transcript.endTime,
					userId: transcript.user?.id,
					userName: transcript.user?.username,
					is_transcript: true,
					channel: this.currentVoiceSession?.voiceChannelId,
					recipient: this.applicationId,
				},
			});
			if (textChannel && transcript.transcript.trim().length > 0 && transcript.speaker?.logTranscript)
				await textChannel.send(`${transcript.user?.username}:${transcript.transcript}`);
		});
		this.currentVoiceSession.start();
		return interaction.followUp('DONE!');
	}
<<<<<<< HEAD
<<<<<<< HEAD
=======
	@interaction({
		description: "Joins the caller's voice channel, transcribes everyone, and starts the AI agent",
	})
	async startVoiceAgent(interaction: Interaction): Promise<any> {
		await interaction.deferReply();
>>>>>>>

<<<<<<<
=======

>>>>>>> origin/codex/update-cephalon-for-waveform-storage
=======

>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration
	@interaction({
		description: 'Leaves whatever channel the bot is currently in.',
	})
	async leaveVoiceChannel(interaction: Interaction) {
		if (this.currentVoiceSession) {
			this.currentVoiceSession.stop();
			return interaction.followUp('Successfully left voice channel');
		}
		return interaction.followUp('No voice channel to leave.');
<<<<<<< HEAD
<<<<<<< HEAD
=======
		let textChannel: discord.TextChannel | null = null;
		if (interaction.channel?.id) {
			const channel = await this.client.channels.fetch(interaction.channel.id);
			if (channel?.isTextBased()) {
				textChannel = channel as discord.TextChannel;
			}
		}
		if (this.currentVoiceSession) {
			return interaction.followUp('Cannot join a new voice session with out leaving the current one.');
		}
		if (!interaction.member.voice?.channel?.id) {
			return interaction.followUp('Join a voice channel then try that again.');
		}
>>>>>>>

<<<<<<<
		// Leave the specified voice channel
	}
	@interaction({
		description: 'Sets the channel where captured waveforms, spectrograms, and screenshots will be stored',
		options: [
			{
				name: 'channel',
				description: 'Target text channel for captured media',
				type: ApplicationCommandOptionType.Channel,
				required: true,
			},
		],
	})
	async setCaptureChannel(interaction: Interaction) {
		const channel = interaction.options.getChannel('channel', true);
		if (!channel.isTextBased()) {
			return interaction.reply('Channel must be text-based.');
		}
		this.captureChannel = channel as discord.TextChannel;
		return interaction.reply(`Capture channel set to ${channel.id}`);
	}
=======
		const voiceChannel = interaction.member.voice.channel;
		this.currentVoiceSession = new VoiceSession({
			bot: this,
			guild: interaction.guild,
			voiceChannelId: voiceChannel.id,
		});
>>>>>>>

<<<<<<<
	@interaction({
		description: 'Sets the channel where desktop captures will be stored',
		options: [
			{
				name: 'channel',
				description: 'Target text channel for desktop captures',
=======

		// Leave the specified voice channel
	}

<<<<<<< HEAD
	@interaction({
		description: 'Set the text channel where recorded waveforms will be stored',
		options: [
			{
				name: 'channel',
				description: 'Target text channel',
>>>>>>> origin/codex/update-cephalon-for-waveform-storage
				type: ApplicationCommandOptionType.Channel,
				required: true,
			},
		],
	})
<<<<<<< HEAD
	async setDesktopChannel(interaction: Interaction) {
		const channel = interaction.options.getChannel('channel', true);
		if (!channel.isTextBased()) {
			return interaction.reply('Channel must be text-based.');
		}
		this.desktopChannel = channel as discord.TextChannel;
		this.agent.desktop.setChannel(this.desktopChannel);
		return interaction.reply(`Desktop capture channel set to ${channel.id}`);
=======
	async setWaveformChannel(interaction: Interaction) {
		const channel = interaction.options.getChannel('channel', true);
		if (!channel?.isTextBased()) {
			return interaction.reply('Channel must be text based');
		}
		this.waveformChannelId = channel.id;
		return interaction.reply(`Waveforms will be stored in <#${channel.id}>`);
>>>>>>> origin/codex/update-cephalon-for-waveform-storage
	}
	@interaction({
		description: 'begin recording the given user.',
		options: [
			{
				name: 'speaker',
				description: 'The user to begin recording',
				type: ApplicationCommandOptionType.User,
				required: true,
			},
		],
	})
	async beginRecordingUser(interaction: Interaction) {
		if (this.currentVoiceSession) {
			const user = interaction.options.getUser('speaker', true);
			this.currentVoiceSession.addSpeaker(user);
			this.currentVoiceSession.startSpeakerRecord(user);
		}
		return interaction.reply('Recording!');
	}
<<<<<<< HEAD
=======
		this.currentVoiceSession.transcriber.on('transcriptEnd', async (transcript: FinalTranscript) => {
			const transcripts = this.context.getCollection('transcripts') as CollectionManager<'text', 'createdAt'>;
			await transcripts.addEntry({
				text: transcript.transcript,
				createdAt: transcript.startTime || Date.now(),
				metadata: {
					createdAt: Date.now(),
					endTime: transcript.endTime,
					userId: transcript.user?.id,
					userName: transcript.user?.username,
					is_transcript: true,
					channel: this.currentVoiceSession?.voiceChannelId,
					recipient: this.applicationId,
				},
			});
			if (textChannel && transcript.transcript.trim().length > 0 && transcript.speaker?.logTranscript)
				await textChannel.send(`${transcript.user?.username}:${transcript.transcript}`);
		});
>>>>>>>
=======
    @interaction({
        description: "Set the text channel where audio recordings will be uploaded",
        options: [
            {
                name: "channel",
                description: "Target text channel",
                type: ApplicationCommandOptionType.Channel,
                required: true,
            },
        ],
    })
    async setRecordingChannel(interaction: Interaction) {
        const channel = interaction.options.getChannel("channel", true);
        if (!channel?.isTextBased()) {
            return interaction.reply("Please choose a text channel.");
        }
        this.recordingChannelId = channel.id;
        return interaction.reply(`Recordings will be posted in ${channel}`);
    }

    @interaction({
        "description": "Begin transcribing the speech of users in the current channel to the target text channel",
        options: [
            {
                name: "speaker",
                description: "The user to begin transcribing",
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: "log",
                description: "Should the bot send the transcript to the current text channel?",
                type: ApplicationCommandOptionType.Boolean,
            }
        ]
    })
    async beginTranscribingUser(interaction: Interaction) {
        // Begin transcribing audio in the voice channel to the specified text channel
        if (this.currentVoiceSession) {
            const user = interaction.options.getUser("speaker", true)
            this.currentVoiceSession.addSpeaker(user)
            this.currentVoiceSession.startSpeakerTranscribe(user, interaction.options.getBoolean("log") || false)
>>>>>>> origin/codex/update-cephalon-to-store-audio-recordings

<<<<<<<
=======

>>>>>>> origin/codex/update-cephalon-for-waveform-storage
	@interaction({
		description: 'stop recording the given user.',
		options: [
			{
				name: 'speaker',
				description: 'The user to begin recording',
				type: ApplicationCommandOptionType.User,
				required: true,
			},
		],
	})
	async stopRecordingUser(interaction: Interaction) {
		if (this.currentVoiceSession) {
			const user = interaction.options.getUser('speaker', true);
			this.currentVoiceSession.stopSpeakerRecord(user);
		}
		return interaction.reply("I'm not recording you any more... I promise...");
	}
<<<<<<< HEAD
=======
		this.currentVoiceSession.start();
>>>>>>>

<<<<<<<
=======

>>>>>>> origin/codex/update-cephalon-for-waveform-storage
	@interaction({
		description: 'Begin transcribing the speech of users in the current channel to the target text channel',
		options: [
			{
				name: 'speaker',
				description: 'The user to begin transcribing',
				type: ApplicationCommandOptionType.User,
				required: true,
			},
			{
				name: 'log',
				description: 'Should the bot send the transcript to the current text channel?',
				type: ApplicationCommandOptionType.Boolean,
			},
		],
	})
	async beginTranscribingUser(interaction: Interaction) {
		// Begin transcribing audio in the voice channel to the specified text channel
		if (this.currentVoiceSession) {
			const user = interaction.options.getUser('speaker', true);
			this.currentVoiceSession.addSpeaker(user);
			this.currentVoiceSession.startSpeakerTranscribe(user, interaction.options.getBoolean('log') || false);
<<<<<<< HEAD
=======
		for (const [, member] of voiceChannel.members) {
			if (member.user.bot) continue;
			await this.currentVoiceSession.addSpeaker(member.user);
			await this.currentVoiceSession.startSpeakerTranscribe(member.user, true);
		}
>>>>>>>

<<<<<<<
=======

>>>>>>> origin/codex/update-cephalon-for-waveform-storage
			return interaction.reply(`I will faithfully transcribe every word ${user.displayName} says... I promise.`);
		}
		return interaction.reply("I can't transcribe what I can't hear. Join a voice channel.");
	}
	@interaction({
		description: 'speak the message with text to speech',
		options: [
			{
				name: 'message',
				description: 'The message you wish spoken in the voice channel',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	})
	async tts(interaction: Interaction) {
		if (this.currentVoiceSession) {
			await interaction.deferReply({ ephemeral: true });
			await this.currentVoiceSession.playVoice(interaction.options.getString('message', true));
		} else {
			await interaction.reply("That didn't work... try again?");
		}
		await interaction.deleteReply().catch(() => {}); // Ignore if already deleted or errored
	}
	@interaction({
		description: 'Start a dialog with the bot',
	})
	async startDialog(interaction: Interaction) {
		if (this.currentVoiceSession) {
			await interaction.deferReply({ ephemeral: true });
			this.currentVoiceSession.transcriber
				.on('transcriptEnd', async () => {
					if (this.agent) {
						this.agent.newTranscript = true;
						this.agent.userSpeaking = false;
					}
				})
				.on('transcriptStart', async () => {
					if (this.agent) {
						this.agent.newTranscript = false;
						this.agent.userSpeaking = true;
					}
				});
			return this.agent?.start();
		}
	}
<<<<<<< HEAD
=======
		const handleVoiceState = async (_oldState: discord.VoiceState, newState: discord.VoiceState) => {
			if (this.currentVoiceSession && newState.channelId === voiceChannel.id && !newState.member?.user.bot) {
				await this.currentVoiceSession.addSpeaker(newState.member!.user);
				await this.currentVoiceSession.startSpeakerTranscribe(newState.member!.user, true);
			}
		};
		this.client.on(Events.VoiceStateUpdate, handleVoiceState);
		(this.currentVoiceSession as any).voiceStateHandler = handleVoiceState;

		this.currentVoiceSession.transcriber
			.on('transcriptEnd', async () => {
				if (this.agent) {
					this.agent.newTranscript = true;
					this.agent.userSpeaking = false;
				}
			})
			.on('transcriptStart', async () => {
				if (this.agent) {
					this.agent.newTranscript = false;
					this.agent.userSpeaking = true;
				}
			});

		await this.agent.start();

		return interaction.followUp('Joined voice channel and began transcribing all speakers.');
	}

	@interaction({
		description: 'Leaves whatever channel the bot is currently in.',
	})
	async leaveVoiceChannel(interaction: Interaction) {
		if (this.currentVoiceSession) {
			const handler = (this.currentVoiceSession as any).voiceStateHandler;
			if (handler) this.client.off(Events.VoiceStateUpdate, handler);
			await this.currentVoiceSession.stop();
			this.currentVoiceSession = undefined;
			return interaction.followUp('Successfully left voice channel');
		}
		return interaction.followUp('No voice channel to leave.');
=======
>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration

		// Leave the specified voice channel
	}
	@interaction({
		description: 'begin recording the given user.',
		options: [
			{
				name: 'speaker',
				description: 'The user to begin recording',
				type: ApplicationCommandOptionType.User,
				required: true,
			},
		],
	})
	async beginRecordingUser(interaction: Interaction) {
		if (this.currentVoiceSession) {
			const user = interaction.options.getUser('speaker', true);
			this.currentVoiceSession.addSpeaker(user);
			this.currentVoiceSession.startSpeakerRecord(user);
		}
		return interaction.reply('Recording!');
	}

	@interaction({
		description: 'stop recording the given user.',
		options: [
			{
				name: 'speaker',
				description: 'The user to begin recording',
				type: ApplicationCommandOptionType.User,
				required: true,
			},
		],
	})
	async stopRecordingUser(interaction: Interaction) {
		if (this.currentVoiceSession) {
			const user = interaction.options.getUser('speaker', true);
			this.currentVoiceSession.stopSpeakerRecord(user);
		}
		return interaction.reply("I'm not recording you any more... I promise...");
	}

	@interaction({
		description: 'Begin transcribing the speech of users in the current channel to the target text channel',
		options: [
			{
				name: 'speaker',
				description: 'The user to begin transcribing',
				type: ApplicationCommandOptionType.User,
				required: true,
			},
			{
				name: 'log',
				description: 'Should the bot send the transcript to the current text channel?',
				type: ApplicationCommandOptionType.Boolean,
			},
		],
	})
	async beginTranscribingUser(interaction: Interaction) {
		// Begin transcribing audio in the voice channel to the specified text channel
		if (this.currentVoiceSession) {
			const user = interaction.options.getUser('speaker', true);
			this.currentVoiceSession.addSpeaker(user);
			this.currentVoiceSession.startSpeakerTranscribe(user, interaction.options.getBoolean('log') || false);

			return interaction.reply(`I will faithfully transcribe every word ${user.displayName} says... I promise.`);
		}
		return interaction.reply("I can't transcribe what I can't hear. Join a voice channel.");
	}
	@interaction({
		description: 'speak the message with text to speech',
		options: [
			{
				name: 'message',
				description: 'The message you wish spoken in the voice channel',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	})
	async tts(interaction: Interaction) {
		if (this.currentVoiceSession) {
			await interaction.deferReply({ ephemeral: true });
			await this.currentVoiceSession.playVoice(interaction.options.getString('message', true));
		} else {
			await interaction.reply("That didn't work... try again?");
		}
		await interaction.deleteReply().catch(() => {}); // Ignore if already deleted or errored
	}
	@interaction({
		description: 'Start a dialog with the bot',
	})
	async startDialog(interaction: Interaction) {
		if (this.currentVoiceSession) {
			await interaction.deferReply({ ephemeral: true });
			this.currentVoiceSession.transcriber
				.on('transcriptEnd', async () => {
					if (this.agent) {
						this.agent.newTranscript = true;
						this.agent.userSpeaking = false;
					}
				})
				.on('transcriptStart', async () => {
					if (this.agent) {
						this.agent.newTranscript = false;
						this.agent.userSpeaking = true;
					}
				});
			return this.agent?.start();
		}
	}
<<<<<<< HEAD
>>>>>>>
=======
>>>>>>> origin/codex/update-cephalon-for-waveform-storage
=======
>>>>>>> origin/codex/update-cephalon-for-screenshot-discord-integration
}
