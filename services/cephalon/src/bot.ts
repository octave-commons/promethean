import * as discord from 'discord.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { ApplicationCommandOptionType, REST, Routes, type RESTPutAPIApplicationCommandsJSONBody } from 'discord.js';
import EventEmitter from 'events';
import { AIAgent, AGENT_NAME } from './agent';
import { CollectionManager } from './collectionManager';
import { ContextManager } from './contextManager';

const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:4000';

import {
    ApplicationCommandOptionType,
    REST,
    Routes,
    type RESTPutAPIApplicationCommandsJSONBody,
} from 'discord.js';
import EventEmitter from "events";
import { FinalTranscript } from "./transcriber";
import { AIAgent, AGENT_NAME } from "./agent";
import { CollectionManager } from "./collectionManager";
import { LLMService } from "./llm-service";
import { ContextManager } from "./contextManager";
/**
   Handles top level discord interactions. EG slash commands send by the user.
   */
type Interaction = discord.ChatInputCommandInteraction<"cached">
function interaction(commandConfig: Omit<discord.RESTPostAPIChatInputApplicationCommandsJSONBody, 'name'>
) {
    return function (
        target: any, key: string, describer: PropertyDescriptor
    ) {

function interaction(commandConfig: Omit<discord.RESTPostAPIChatInputApplicationCommandsJSONBody, 'name'>) {
    return function(target: any, key: string, describer: PropertyDescriptor) {
        const ctor = target.constructor;
        const originalMethod = describer.value;
        const name = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`).toLowerCase();
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
    static interactions: Map<string, discord.RESTPostAPIChatInputApplicationCommandsJSONBody> = new Map();
    static handlers: Map<string, (bot: Bot, interaction: Interaction) => Promise<any>> = new Map();

    agent: AIAgent;
    client: Client;
    token: string;
    applicationId: string;
    context: ContextManager = new ContextManager();

    constructor(options: BotOptions) {
        super();
        this.token = options.token;
        this.applicationId = options.applicationId;
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
        });
        this.agent = new AIAgent({ historyLimit: 20, bot: this, context: this.context });
    }

        this.agent = new AIAgent({
            historyLimit: 20,
            bot: this,
            context:this.context,
            llm:new LLMService()
        })

    }

    get guilds(): Promise<discord.Guild[]> {
        return this.client.guilds.fetch().then(guildCollection =>
            Promise.all(guildCollection.map(g => this.client.guilds.fetch(g.id)))
        );
    }

    async start() {
        await this.context.createCollection('transcripts', 'text', 'createdAt');
        await this.context.createCollection(`${AGENT_NAME}_discord_messages`, 'content', 'created_at');
        await this.context.createCollection('agent_messages', 'text', 'createdAt');
        await this.client.login(this.token);
        await this.registerInteractions();

        this.client.on(Events.InteractionCreate, async interaction => {
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
        }).on(Events.Error, console.error);
    }

    async registerInteractions() {
        const commands: RESTPutAPIApplicationCommandsJSONBody = [];
        for (const [, command] of Bot.interactions) commands.push(command);
        return Promise.all(
            (await this.guilds).map(guild => new REST().setToken(this.token).put(
                Routes.applicationGuildCommands(this.applicationId, guild.id),
                { body: commands }
            ))
        );
    }

    @interaction({ description: 'Joins the voice channel the requesting user is currently in' })
    async joinVoiceChannel(interaction: Interaction) {
        await interaction.deferReply();
        const channelId = interaction.member.voice?.channel?.id;
        if (!channelId) return interaction.followUp('Join a voice channel then try that again.');
        await this.voiceRequest('/join', { guildId: interaction.guild.id, channelId });
        return interaction.followUp('DONE!');
    }

    @interaction({ description: 'Leaves whatever channel the bot is currently in.' })
    async leaveVoiceChannel(interaction: Interaction) {
        await this.voiceRequest('/leave', {});
        return interaction.followUp('Successfully left voice channel');
    }

    @interaction({
        description: 'begin recording the given user.',
        options: [
            { name: 'speaker', description: 'The user to begin recording', type: ApplicationCommandOptionType.User, required: true }
        ]
    })
    async beginRecordingUser(interaction: Interaction) {
        const user = interaction.options.getUser('speaker', true);
        await this.voiceRequest('/record/start', { userId: user.id });
        return interaction.reply('Recording!');
    }

    @interaction({
        description: 'stop recording the given user.',
        options: [
            { name: 'speaker', description: 'The user to stop recording', type: ApplicationCommandOptionType.User, required: true }
        ]
    })
    async stopRecordingUser(interaction: Interaction) {
        const user = interaction.options.getUser('speaker', true);
        await this.voiceRequest('/record/stop', { userId: user.id });
        return interaction.reply("I'm not recording you any more... I promise...");
    }

    @interaction({
        description: 'Begin transcribing the speech of users in the current channel to the target text channel',
        options: [
            { name: 'speaker', description: 'The user to begin transcribing', type: ApplicationCommandOptionType.User, required: true },
            { name: 'log', description: 'Should the bot send the transcript to the current text channel?', type: ApplicationCommandOptionType.Boolean }
        ]
    })
    async beginTranscribingUser(interaction: Interaction) {
        const user = interaction.options.getUser('speaker', true);
        await this.voiceRequest('/transcribe/start', { userId: user.id, log: interaction.options.getBoolean('log') });
        return interaction.reply(`I will faithfully transcribe every word ${user.displayName} says... I promise.`);
    }

    @interaction({
        description: 'speak the message with text to speech',
        options: [
            { name: 'message', description: 'The message you wish spoken in the voice channel', type: ApplicationCommandOptionType.String, required: true }
        ]
    })
    async tts(interaction: Interaction) {
        await interaction.deferReply({ ephemeral: true });
        await this.voiceRequest('/speak', { text: interaction.options.getString('message', true) });
        await interaction.deleteReply().catch(() => {});
    }
}
