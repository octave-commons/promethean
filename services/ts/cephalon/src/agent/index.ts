/**
 * @file index.ts
 * @description This file defines the Agent class, which is responsible for managing the agent's state and interactions.
 * It includes methods for starting, stopping, and managing the agent's lifecycle.
 * @author Your Name
 * @version 1.0.0
 * @license GNU General Public License v3.0
 * @requires EventEmitter
 */

import { AudioPlayer } from '@discordjs/voice';
import { Message } from 'ollama';
import EventEmitter from 'events';

import { DesktopCaptureManager } from '../desktop/desktopLoop';
import { LLMService } from '../llm-service';
import { ContextManager } from '../contextManager';
import { AgentInnerState, AgentOptions, GenerateResponseOptions } from '../types';
import { defaultPrompt, defaultState, generatePrompt } from '../prompts';
import { sleep } from '../util';

import {
	speak as speakAction,
	generateVoiceResponse as generateVoiceResponseAction,
	storeAgentMessage as storeAgentMessageAction,
} from './speech';
import {
	generateVoiceContentFromSinglePrompt as generateVoiceContentFromSinglePromptFn,
	generateVoiceContentWithFormattedLatestmessage as generateVoiceContentWithFormattedLatestmessageFn,
	generateVoiceContentWithChoicePrompt as generateVoiceContentWithChoicePromptFn,
	generateVoiceContentWithSpecialQuery as generateVoiceContentWithSpecialQueryFn,
	generateVoiceContentWithoutSpecialQuery as generateVoiceContentWithoutSpecialQueryFn,
	generateVoiceContent as generateVoiceContentFn,
} from './voiceContent';
import {
	generateInnerState as generateInnerStateFn,
	think as thinkFn,
	updateInnerState as updateInnerStateFn,
} from './innerState';

// type BotActivityState = 'idle' | 'listening' | 'speaking';
// type ConversationState = 'clear' | 'overlapping_speech' | 'awaiting_response';
// type EmotionState = 'neutral' | 'irritated' | 'curious' | 'sleepy';

// type FullBotState = {
//   activity: BotActivityState,
//   conversation: ConversationState,
//   emotion: EmotionState,
//   // etc
// };

// const thoughtPrompt = `
// In one sentence, what are you thinking about right now — based on what just happened in the conversation or around you?
// `

export class AIAgent extends EventEmitter {
	bot: any;
	prompt: string;
	state: string;

	innerState: AgentInnerState = defaultState;
	maxOverlappingSpeechTicks = 130;
	forcedStopThreshold = 210;
	overlappingSpeech = 0;
	ticksWaitingToResume = 0;

	historyLimit: number = 20;

	isPaused = false;
	isStopped = false;
	isThinking = false;
	isSpeaking: boolean = false;

	userSpeaking?: boolean;
	newTranscript?: boolean;
	audioPlayer?: AudioPlayer;
	context: ContextManager;
	llm: LLMService;
	constructor(options: AgentOptions) {
		super();
		this.state = 'idle'; // Initial state of the agent
		this.bot = options.bot;
		this.prompt = options.prompt || defaultPrompt;
		this.context = options.context;
		this.llm = options.llm || new LLMService();
	}
	get contextManager() {
		return this.bot.context;
	}

	speak = speakAction;
	storeAgentMessage = storeAgentMessageAction;
	generateVoiceResponse = generateVoiceResponseAction;
	generateVoiceContentFromSinglePrompt = generateVoiceContentFromSinglePromptFn;
	generateVoiceContentWithFormattedLatestmessage = generateVoiceContentWithFormattedLatestmessageFn;
	generateVoiceContentWithChoicePrompt = generateVoiceContentWithChoicePromptFn;
	generateVoiceContentWithSpecialQuery = generateVoiceContentWithSpecialQueryFn;
	generateVoiceContentWithoutSpecialQuery = generateVoiceContentWithoutSpecialQueryFn;
	generateVoiceContent = generateVoiceContentFn;
	generateInnerState = generateInnerStateFn;
	think = thinkFn;
	updateInnerState = updateInnerStateFn;

	imageContext: Buffer[] = [];
	async generateResponse({
		specialQuery,
		context,
		format,
		prompt = this.prompt,
	}: GenerateResponseOptions): Promise<string | object> {
		if (!context) context = await this.context.compileContext([prompt], this.historyLimit);
		if (format && !specialQuery) throw new Error('most specify special query if specifying a format.');
		if (format) specialQuery += ' ' + 'Please respond with valid JSON.';
		if (specialQuery)
			context.push({
				role: 'user',
				content: specialQuery,
			});
		console.log("You won't believe how big this context is...", context.length);
		const lastMessage: Message = context.pop() as Message;

		lastMessage.images = await Promise.all(
			this.desktop.frames.flatMap(({ screen, audio: { waveForm, spectrogram } }) => [screen, waveForm, spectrogram]),
		);

		context.push(lastMessage);

		return this.llm.generate({
			prompt: generatePrompt(prompt, this.innerState),
			context,
			...(format ? { format } : {}),
		});
	}
	generateJSONResponse(
		specialQuery: string,
		{ context, format, prompt = this.prompt }: GenerateResponseOptions,
	): Promise<object> {
		return this.generateResponse({
			specialQuery,
			context,
			format,
			prompt,
		}) as Promise<object>;
	}
	generateTextResponse(
		specialQuery: string,
		{ context, prompt = this.prompt }: GenerateResponseOptions,
	): Promise<string> {
		return this.generateResponse({
			specialQuery,
			context,
			prompt,
		}) as Promise<string>;
	}
	tickInterval = 100;
	updateTickInterval(ms: number) {
		this.tickInterval = ms;
	}
	async startTicker() {
		while (this.state === 'running') {
			this.emit('tick');
			await sleep(this.tickInterval);
		}
	}

	desktop = new DesktopCaptureManager();
	async start() {
		if (this.state === 'running') {
			throw new Error('Agent is already running ');
		}
		this.desktop.start();
		this.state = 'running';
		console.log('Agent started');
		this.on('overlappingSpeechTick', (count: number) => {
			console.log('overlapping speech detected');
			const chance = Math.min(1, count / this.maxOverlappingSpeechTicks);
			const roll = Math.random();
			if (chance > roll) {
				this.audioPlayer?.pause();
				this.isPaused = true;
				this.emit('speechPaused');
			}
		});
		this.on('doneSpeaking', () => {
			console.log('done Speaking');
			this.isStopped = false;
			this.isPaused = false;
			this.isSpeaking = false;
			this.overlappingSpeech = 0;
			this.ticksWaitingToResume = 0;
		});
		this.on('speechStopped', () => console.log('speech has been forcefully stopped'));
		this.on('waitingToResumeTick', (count: number) => {
			console.log('waiting to resume');
			const chance = Math.min(1, count / this.forcedStopThreshold);
			const roll = Math.random();
			if (chance > roll) {
				this.isStopped = true;
				this.isSpeaking = false;
				this.emit('speechStopped');
			}
		});
		this.on('speechTick', (player: AudioPlayer) => {
			// console.log("speech Tick")
			if (!player) return;
			if (this.userSpeaking && !this.isPaused) {
				this.overlappingSpeech++;
				this.emit('overlappingSpeechTick', this.overlappingSpeech);
			} else if (this.userSpeaking && this.isPaused && !this.isStopped) {
				this.ticksWaitingToResume++;
				this.emit('waitingToResumeTick', this.ticksWaitingToResume);
			} else if (this.isPaused && !this.isStopped) {
				player.unpause();
				this.isPaused = false;
				this.overlappingSpeech = 0;
				this.ticksWaitingToResume = 0;
				this.emit('speechResumed');
			}
		});

		this.on('tick', async () => {
			this.onTick();
		});

		this.on('thought', async () => {
			console.log('updating inner state');
			await this.generateInnerState().catch(console.error);

			this.isThinking = false;
		});

		this.bot?.currentVoiceSession?.on('audioPlayerStart', (player: AudioPlayer) => {
			this.onAudioPlayerStart(player);
		});

		this.bot?.currentVoiceSession?.on('audioPlayerStop', () => {
			this.onAudioPlayerStop();
		});
		this.startTicker();
	}

	stop() {
		if (this.state !== 'running') {
			throw new Error('Agent is not running');
		}
		this.desktop.stop();
		this.state = 'stopped';
		console.log('Agent stopped');
	}

	ticksSinceLastThought = 0;
	async onTick() {
		if (this.isThinking) return;

		if (this.isSpeaking) {
			return this.emit('speechTick', this.audioPlayer);
		}

		if (this.ticksSinceLastThought > 10) {
			if (!this.isThinking && !this.isSpeaking) {
				console.log('Thinking');
				try {
					this.isThinking = true;
					await this.think();
					this.emit('thought');
				} catch (e) {
					console.error(e);
				} finally {
					this.isThinking = false;
					this.ticksSinceLastThought = 0;
				}
			}
		} else {
			this.ticksSinceLastThought++;
		}
		// if(this.userSpeaking) {
		//     return this.generateInnerState()
		// } else {
		// }

		return this.generateVoiceResponse().catch(console.error);
	}
	onAudioPlayerStop() {
		console.log('audio player has stopped');
		delete this.audioPlayer;
		this.overlappingSpeech = 0;
	}
	onAudioPlayerStart(player: AudioPlayer) {
		console.log('audio player has started');
		this.audioPlayer = player;
	}
}
