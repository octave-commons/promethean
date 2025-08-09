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
import EventEmitter from 'events';
import { AIAgent } from './agent/index.js';
import { AGENT_NAME, DESKTOP_CAPTURE_CHANNEL_ID } from '../../../../shared/js/env.js';
import { ContextManager } from './contextManager';
import { LLMService } from './llm-service';
import { checkPermission } from '@shared/js/permissionGate.js';
import { interaction, type Interaction } from './interactions';
import {
	joinVoiceChannel,
	leaveVoiceChannel,
	beginRecordingUser,
	stopRecordingUser,
	beginTranscribingUser,
	tts,
	startDialog,
} from './voiceCommands';

// const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:4000';

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
		this.agent = new AIAgent({
			historyLimit: 20,
			bot: this,
			context: this.context,
			llm: new LLMService(),
		});
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
				if (!checkPermission(interaction.user.id, interaction.commandName)) {
					await interaction.reply('Permission denied');
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
				new REST().setToken(this.token).put(Routes.applicationGuildCommands(this.applicationId, guild.id), {
					body: commands,
				}),
			),
		);
	}

	async forwardAttachments(message: discord.Message) {
		if (!this.captureChannel) return;
		if (message.author?.bot) return;
		const imageAttachments = [...message.attachments.values()].filter((att) => att.contentType?.startsWith('image/'));
		if (!imageAttachments.length) return;
		const files = imageAttachments.map((att) => ({
			attachment: att.url,
			name: att.name,
		}));
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
		return joinVoiceChannel(this, interaction);
	}

	@interaction({
		description: 'Leaves whatever channel the bot is currently in.',
	})
	async leaveVoiceChannel(interaction: Interaction) {
		return leaveVoiceChannel(this, interaction);
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
		return beginRecordingUser(this, interaction);
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
		return stopRecordingUser(this, interaction);
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
		return beginTranscribingUser(this, interaction);
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
		return tts(this, interaction);
	}
	@interaction({
		description: 'Start a dialog with the bot',
	})
	async startDialog(interaction: Interaction) {
		return startDialog(this, interaction);
	}
}
