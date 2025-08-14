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
import { DESKTOP_CAPTURE_CHANNEL_ID } from '@shared/js/env.js';
import { ContextManager } from './contextManager';
import { createAgentWorld } from '@shared/ts/dist/agent-ecs/world';
import { enqueueUtterance } from '@shared/ts/dist/agent-ecs/helpers/enqueueUtterance.js';
import { pushVisionFrame } from '@shared/ts/dist/agent-ecs/helpers/pushVision.js';
import { AgentBus } from '@shared/ts/dist/agent-ecs/bus.js';
import { createAudioResource } from '@discordjs/voice';
import { Readable } from 'stream';
import type { LlmResult, TtsRequest, TtsResult } from '@shared/ts/dist/contracts/agent-bus.js';
import BrokerClient from '@shared/js/brokerClient.js';
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
import { DesktopCaptureManager } from './desktop/desktopLoop';

// const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:4000';

export interface BotOptions {
	token: string;
	applicationId: string;
}

export class Bot extends EventEmitter {
	static interactions = new Map<string, discord.RESTPostAPIChatInputApplicationCommandsJSONBody>();
	static handlers = new Map<string, (bot: Bot, interaction: Interaction) => Promise<any>>();

	bus?: AgentBus;
	agentWorld?: ReturnType<typeof createAgentWorld>;
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

		this.desktop = new DesktopCaptureManager();
		this.client = new Client({
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
		});
	}

	get guilds(): Promise<discord.Guild[]> {
		return this.client.guilds
			.fetch()
			.then((guildCollection) => Promise.all(guildCollection.map((g) => this.client.guilds.fetch(g.id))));
	}

	desktop: DesktopCaptureManager;
	async start() {
		await this.context.createCollection('transcripts', 'text', 'createdAt');
		await this.context.createCollection(`discord_messages`, 'content', 'created_at');
		await this.context.createCollection('agent_messages', 'text', 'createdAt');
		await this.client.login(this.token);
		if (DESKTOP_CAPTURE_CHANNEL_ID) {
			try {
				const channel = await this.client.channels.fetch(DESKTOP_CAPTURE_CHANNEL_ID);
				if (channel?.isTextBased()) {
					this.desktopChannel = channel as discord.TextChannel;
				}
			} catch (e) {
				console.warn('Failed to set default desktop channel', e);
			}
		}
		await this.registerInteractions();

		const broker = new BrokerClient({ url: process.env.BROKER_WS_URL || 'ws://localhost:7000' });
		this.bus = new AgentBus(broker);

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

		this.bus.subscribe<LlmResult>('agent.llm.result', (res) => {
			if (!res.ok || !this.agentWorld) return;
			const ttsReq: TtsRequest = {
				topic: 'agent.tts.request',
				corrId: res.corrId,
				turnId: res.turnId,
				ts: Date.now(),
				text: res.text,
				group: 'agent-speech',
				bargeIn: 'pause',
				priority: 1,
			};
			this.bus?.publish(ttsReq);
		});

		this.bus.subscribe<TtsResult>('agent.tts.result', async (r) => {
			if (!r.ok || !this.agentWorld) return;
			const { w, agent, C } = this.agentWorld;
			const turnId = w.get(agent, C.Turn)!.id;
			if (r.turnId < turnId) return;
			enqueueUtterance(w, agent, {
				id: r.corrId,
				group: 'agent-speech',
				priority: 1,
				bargeIn: 'pause',
				factory: async () => {
					const res = await fetch(r.mediaUrl);
					if (!res.ok || !res.body) throw new Error(`TTS fetch failed ${res.status}`);
					const nodeStream = Readable.fromWeb(res.body as any);
					return createAudioResource(nodeStream, { inlineVolume: true });
				},
			});
		});
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
			if (this.agentWorld) {
				const { w, agent } = this.agentWorld;
				for (const att of imageAttachments) {
					const ref = {
						type: 'url' as const,
						url: att.url,
						...(att.contentType ? { mime: att.contentType } : {}),
					};
					pushVisionFrame(w, agent, ref);
				}
			}
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

	@interaction({ description: 'Leaves whatever channel the bot is currently in.' })
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
