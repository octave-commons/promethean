import * as discord from 'discord.js';
import {
	Client,
	Events,
	GatewayIntentBits,
	ApplicationCommandOptionType,
	REST,
	Routes,
	type RESTPutAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { VoiceSession } from './voice-session';
import { FinalTranscript } from './transcriber';
import EventEmitter from 'events';
import { AIAgent } from './agent';
import { AGENT_NAME, DESKTOP_CAPTURE_CHANNEL_ID } from '../../../../shared/js/env.js';
import { ContextManager } from './contextManager';
import { LLMService } from './llm-service';
import { CollectionManager } from './collectionManager';

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

	agent: AIAgent;
	client: Client;
	token: string;
	applicationId: string;
	context: ContextManager = new ContextManager();
	currentVoiceSession?: any;
	captureChannel?: discord.TextChannel;
	desktopChannel?: discord.TextChannel;
	voiceStateHandler?: (oldState: discord.VoiceState, newState: discord.VoiceState) => void;

	constructor(options: BotOptions) {
		super();
		this.token = options.token;
		this.applicationId = options.applicationId;
		this.client = new Client({
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
		});
		this.agent = new AIAgent({ historyLimit: 20, bot: this, context: this.context, llm: new LLMService() });
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
		if (DESKTOP_CAPTURE_CHANNEL_ID) {
			try {
				const channel = await this.client.channels.fetch(DESKTOP_CAPTURE_CHANNEL_ID);
				if (channel?.isTextBased()) {
					this.desktopChannel = channel as discord.TextChannel;
					this.agent.desktop.setChannel(this.desktopChannel);
				}
			} catch (e) {
				console.warn('Failed to set default desktop channel', e);
			}
		}
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
			.on(Events.MessageCreate, async (message) => {
				await this.forwardAttachments(message);
			})
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

	@interaction({
		description: 'Leaves whatever channel the bot is currently in.',
	})
	async leaveVoiceChannel(interaction: Interaction) {
		if (this.currentVoiceSession) {
			this.currentVoiceSession.stop();
			if (this.voiceStateHandler) {
				this.client.off(Events.VoiceStateUpdate, this.voiceStateHandler);
				this.voiceStateHandler = (_1: discord.VoiceState, _2: discord.VoiceState) => {
					throw new Error('Voice channel left, voice state update called after leaving voice channel');
				};
			}
			return interaction.followUp('Successfully left voice channel');
		}
		return interaction.followUp('No voice channel to leave.');

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

	@interaction({
		description: 'Sets the channel where desktop captures will be stored',
		options: [
			{
				name: 'channel',
				description: 'Target text channel for desktop captures',
				type: ApplicationCommandOptionType.Channel,
				required: true,
			},
		],
	})
	async setDesktopChannel(interaction: Interaction) {
		const channel = interaction.options.getChannel('channel', true);
		if (!channel.isTextBased()) {
			return interaction.reply('Channel must be text-based.');
		}
		this.desktopChannel = channel as discord.TextChannel;
		this.agent.desktop.setChannel(this.desktopChannel);
		return interaction.reply(`Desktop capture channel set to ${channel.id}`);
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

			const channel = await interaction.guild.channels.fetch(this.currentVoiceSession.voiceChannelId);
			if (channel?.isVoiceBased()) {
				for (const [, member] of channel.members) {
					if (member.user.bot) continue;
					await this.currentVoiceSession.addSpeaker(member.user);
					await this.currentVoiceSession.startSpeakerTranscribe(member.user);
				}
			}

			if (this.voiceStateHandler) this.client.off(Events.VoiceStateUpdate, this.voiceStateHandler);
			this.voiceStateHandler = (oldState, newState) => {
				const id = this.currentVoiceSession?.voiceChannelId;
				const user = newState.member?.user || oldState.member?.user;
				if (!id || !user || user.bot) return;
				if (oldState.channelId !== id && newState.channelId === id) {
					this.currentVoiceSession?.addSpeaker(user);
					this.currentVoiceSession?.startSpeakerTranscribe(user);
				} else if (oldState.channelId === id && newState.channelId !== id) {
					this.currentVoiceSession?.stopSpeakerTranscribe(user);
					this.currentVoiceSession?.removeSpeaker(user);
				}
			};
			this.client.on(Events.VoiceStateUpdate, this.voiceStateHandler);
			return this.agent?.start();
		}
	}
}
