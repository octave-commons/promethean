import * as discord from 'discord.js';
import {
    Client,
    Events,
    GatewayIntentBits,
    REST,
    Routes,
    type RESTPutAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { EventEmitter } from 'events';
import { DESKTOP_CAPTURE_CHANNEL_ID } from '@shared/js/env.js';
import { ContextStore } from '@shared/ts/dist/persistence/contextStore.js';
import { createAgentWorld } from '@shared/ts/dist/agent-ecs/world.js';
import { enqueueUtterance } from '@shared/ts/dist/agent-ecs/helpers/enqueueUtterance.js';
import { pushVisionFrame } from '@shared/ts/dist/agent-ecs/helpers/pushVision.js';
import { AgentBus } from '@shared/ts/dist/agent-ecs/bus.js';
import { BrokerClient } from '@shared/js/brokerClient.js';
import { checkPermission } from '@shared/js/permissionGate.js';
import { type Interaction } from './interactions.js';
import { DesktopCaptureManager } from './desktop/desktopLoop.js';

import { registerNewStyleCommands } from './bot/registerCommands.js';

// const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:4000';

export interface BotOptions {
    token: string;
    applicationId: string;
}

export type VoiceStateChangeHandler = (oldState: discord.VoiceState, newState: discord.VoiceState) => void;

export class Bot extends EventEmitter {
    static interactions = new Map<string, discord.RESTPostAPIChatInputApplicationCommandsJSONBody>();
    static handlers = new Map<string, (bot: Bot, interaction: Interaction) => Promise<any>>();

    bus?: AgentBus;
    agentWorld?: ReturnType<typeof createAgentWorld>;
    client: Client;
    token: string;
    applicationId: string;
    context: ContextStore = new ContextStore();
    currentVoiceSession?: any;
    captureChannel?: discord.TextChannel;
    desktopChannel?: discord.TextChannel;
    voiceStateHandler?: VoiceStateChangeHandler;

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
        // Register new-style commands alongside decorator-based ones

        registerNewStyleCommands(Bot);
        await this.registerInteractions();

        const broker = new BrokerClient({
            url: process.env.BROKER_WS_URL || 'ws://localhost:7000',
        });
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

        this.bus.subscribe('agent.llm.result', (res: any) => {
            if (!this.agentWorld) return;
            const { w, agent, C } = this.agentWorld;
            const text = res?.text ?? res?.reply ?? '';
            console.log('llm response', text);
            if (!text) return;
            enqueueUtterance(w, agent, C, {
                id: res.corrId ?? res.taskId ?? `${Date.now()}`,
                group: 'agent-speech',
                priority: 1,
                bargeIn: 'pause',
                factory: async () => this.currentVoiceSession.makeResourceFromText(text),
            });
        });

        // this.bus.subscribe<TtsResult>('agent.tts.result', async (r) => {
        //     if ( !this.agentWorld) return;
        //     const { w, agent, C } = this.agentWorld;
        //     const turnId = w.get(agent, C.Turn)!.id;
        //     if (r.turnId < turnId) return;
        // });
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
        const imageAttachments = [...message.attachments.values()].filter(
            (att) => att.contentType?.startsWith('image/'),
        );
        if (!imageAttachments.length) return;
        const files = imageAttachments.map((att) => ({
            attachment: att.url,
            name: att.name,
        }));
        try {
            await this.captureChannel.send({ files });
            if (this.agentWorld) {
                const { w, agent, C } = this.agentWorld;
                for (const att of imageAttachments) {
                    const ref = {
                        type: 'url' as const,
                        url: att.url,
                        ...(att.contentType ? { mime: att.contentType } : {}),
                    };
                    pushVisionFrame(w, agent, C, ref);
                }
            }
        } catch (e) {
            console.warn('Failed to forward attachments', e);
        }
    }
}
