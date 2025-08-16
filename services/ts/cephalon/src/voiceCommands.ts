import * as discord from 'discord.js';
import { VoiceSession } from './voice-session';
import { FinalTranscript } from './transcriber';
import { CollectionManager } from './collectionManager';
import type { Interaction } from './interactions';
import type { Bot } from './bot';
import { createAudioPlayer, AudioPlayerStatus } from '@discordjs/voice';
import { createAgentWorld } from '@shared/ts/dist/agent-ecs/world.js';
import { OrchestratorSystem } from '@shared/ts/dist/agent-ecs/systems/orchestrator.js';
import { randomUUID } from 'node:crypto';
import { defaultPrompt } from './prompts';

export async function leaveVoiceChannel(bot: Bot, interaction: Interaction) {
	if (bot.currentVoiceSession) {
		bot.currentVoiceSession.stop();
		if (bot.voiceStateHandler) {
			bot.client.off(discord.Events.VoiceStateUpdate, bot.voiceStateHandler);
			bot.voiceStateHandler = (_1: discord.VoiceState, _2: discord.VoiceState) => {
				throw new Error('Voice channel left, voice state update called after leaving voice channel');
			};
		}
		return interaction.followUp('Successfully left voice channel');
	}
	return interaction.followUp('No voice channel to leave.');
}

export async function beginRecordingUser(bot: Bot, interaction: Interaction) {
	if (bot.currentVoiceSession) {
		const user = interaction.options.getUser('speaker', true);
		bot.currentVoiceSession.addSpeaker(user);
		bot.currentVoiceSession.startSpeakerRecord(user);
	}
	return interaction.reply('Recording!');
}

export async function stopRecordingUser(bot: Bot, interaction: Interaction) {
	if (bot.currentVoiceSession) {
		const user = interaction.options.getUser('speaker', true);
		bot.currentVoiceSession.stopSpeakerRecord(user);
	}
	return interaction.reply("I'm not recording you any more... I promise...");
}

export async function beginTranscribingUser(bot: Bot, interaction: Interaction) {
	if (bot.currentVoiceSession) {
		const user = interaction.options.getUser('speaker', true);
		bot.currentVoiceSession.addSpeaker(user);
		bot.currentVoiceSession.startSpeakerTranscribe(user, interaction.options.getBoolean('log') || false);
		return interaction.reply(`I will faithfully transcribe every word ${user.displayName} says... I promise.`);
	}
	return interaction.reply("I can't transcribe what I can't hear. Join a voice channel.");
}

export async function tts(bot: Bot, interaction: Interaction) {
	if (bot.currentVoiceSession) {
		await interaction.deferReply({ ephemeral: true });
		await bot.currentVoiceSession.playVoice(interaction.options.getString('message', true));
	} else {
		await interaction.reply("That didn't work... try again?");
	}
	await interaction.deleteReply().catch(() => {});
}

export async function joinVoiceChannel(bot: Bot, interaction: Interaction): Promise<any> {
	await interaction.deferReply();
	let textChannel: discord.TextChannel | null;
	if (interaction?.channel?.id) {
		const channel = await bot.client.channels.fetch(interaction?.channel?.id);
		if (channel?.isTextBased()) {
			textChannel = channel as discord.TextChannel;
		}
	}
	if (bot.currentVoiceSession) {
		return interaction.followUp('Cannot join a new voice session with out leaving the current one.');
	}
	if (!interaction.member.voice?.channel?.id) {
		return interaction.followUp('Join a voice channel then try that again.');
	}
	bot.currentVoiceSession = new VoiceSession({
		bot: bot,
		guild: interaction.guild,
		voiceChannelId: interaction.member.voice.channel.id,
	});
	bot.currentVoiceSession.transcriber.on('transcriptEnd', async (transcript: FinalTranscript) => {
		const transcripts = bot.context.getCollection('transcripts') as CollectionManager<'text', 'createdAt'>;
		console.log('inserting transcript', transcript.transcript);
		await transcripts.addEntry({
			text: transcript.transcript,
			createdAt: transcript.startTime || Date.now(),
			metadata: {
				createdAt: Date.now(),
				endTime: transcript.endTime,
				userId: transcript.user?.id,
				userName: transcript.user?.username,
				is_transcript: true,
				channel: bot.currentVoiceSession?.voiceChannelId,
				recipient: bot.applicationId,
			},
		});
		console.log('insert complete');
		if (textChannel && transcript.transcript.trim().length > 0 && transcript.speaker?.logTranscript)
			await textChannel.send(`${transcript.user?.username}:${transcript.transcript}`);
	});
	bot.currentVoiceSession.start();
	return interaction.followUp('DONE!');
}

export async function startDialog(bot: Bot, interaction: Interaction) {
	if (bot.currentVoiceSession) {
		bot.desktop.start();
		await interaction.deferReply({ ephemeral: true });
		const player = createAudioPlayer();
		bot.currentVoiceSession.connection?.subscribe(player);
		bot.agentWorld = createAgentWorld(player);
		const { w, agent, C, addSystem } = bot.agentWorld;
		addSystem(
			OrchestratorSystem(
				w,
				bot.bus!,
				C,
				(text) => {
					console.log('compiling context for', text);
					return bot.context
						.compileContext([text])
						.then((msgs) => msgs.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })));
				},
				() => defaultPrompt,
			),
		);

		bot.agentWorld?.start(50);

		bot.currentVoiceSession.transcriber.on('transcriptEnd', (tr: FinalTranscript) => {
			const turnId = w.get(agent, C.Turn)!.id;
			const tf = w.get(agent, C.TranscriptFinal)!;
			tf.text = tr.transcript;
			tf.ts = Date.now();
			w.set(agent, C.TranscriptFinal, tf);

			console.log('publishing transcript to agent...', { turnId, tf });
			bot.bus?.publish({
				topic: 'agent.transcript.final',
				corrId: randomUUID(),
				turnId,
				ts: Date.now(),
				text: tr.transcript,
				channelId: bot.currentVoiceSession!.voiceChannelId,
				userId: tr.user?.id,
			});
		});

		const speaking = bot.currentVoiceSession.connection?.receiver.speaking;
		const onLevel = (level: number) => {
			console.log(agent);
			const rv = w.get(agent, C.RawVAD)!;
			console.log(rv);
			rv.level = level;
			rv.ts = Date.now();
			w.set(agent, C.RawVAD, rv);
		};
		speaking?.on('start', () => onLevel(1));
		speaking?.on('end', () => onLevel(0));
		bot.currentVoiceSession.transcriber.on('transcriptStart', () => onLevel(1)).on('transcriptEnd', () => onLevel(0));

		const qUtter = w.makeQuery({ all: [C.Utterance] });
		player.on(AudioPlayerStatus.Idle, () => {
			for (const [e, get] of w.iter(qUtter)) {
				const u = get(C.Utterance);
				if (u.status === 'playing') {
					u.status = 'done';
					w.set(e, C.Utterance, u);
				}
			}
		});
		// services/ts/cephalon/src/voiceCommands.ts  (inside startDialog, after you create player/world/etc.)

		// 1) Start transcribing everyone currently in the channel
		const voiceChan = await interaction.guild.channels.fetch(bot.currentVoiceSession.voiceChannelId);
		if (voiceChan?.isVoiceBased()) {
			for (const [, member] of voiceChan.members) {
				if (member.user.bot) continue;
				await bot.currentVoiceSession.addSpeaker(member.user);
				await bot.currentVoiceSession.startSpeakerTranscribe(member.user);
			}
		}

		// 2) Track joins/leaves dynamically while dialog is active
		if (bot.voiceStateHandler) bot.client.off(discord.Events.VoiceStateUpdate, bot.voiceStateHandler);
		bot.voiceStateHandler = (oldState, newState) => {
			const id = bot.currentVoiceSession?.voiceChannelId;
			const user = newState.member?.user || oldState.member?.user;
			if (!id || !user || user.bot) return;
			// joined target channel
			if (oldState.channelId !== id && newState.channelId === id) {
				bot.currentVoiceSession?.addSpeaker(user);
				bot.currentVoiceSession?.startSpeakerTranscribe(user);
			}
			// left target channel
			else if (oldState.channelId === id && newState.channelId !== id) {
				bot.currentVoiceSession?.stopSpeakerTranscribe(user);
				bot.currentVoiceSession?.removeSpeaker(user);
			}
		};
		bot.client.on(discord.Events.VoiceStateUpdate, bot.voiceStateHandler);
		bot.currentVoiceSession.transcriber
			.on('transcriptStart', () => {
				const rv = w.get(agent, C.RawVAD)!;
				rv.level = 1;
				rv.ts = Date.now();
				w.set(agent, C.RawVAD, rv);
			})
			.on('transcriptEnd', () => {
				const rv = w.get(agent, C.RawVAD)!;
				rv.level = 0;
				rv.ts = Date.now();
				w.set(agent, C.RawVAD, rv);
			});

		await interaction.deleteReply().catch(() => {});
	}
}
