/**
 * @file agent.ts
 * @description This file defines the Agent class, which is responsible for managing the agent's state and interactions.
 * It includes methods for starting, stopping, and managing the agent's lifecycle.
 * @author Your Name
 * @version 1.0.0
 * @license GNU General Public License v3.0
 * @requires EventEmitter
 */

import { AudioPlayer } from '@discordjs/voice';
import { Message } from 'ollama';
import { DesktopCaptureManager } from './desktop/desktopLoop';

import { Bot } from './bot';
import { CollectionManager } from './collectionManager';
import EventEmitter from 'events';
import { writeFile } from 'fs/promises';
import { LLMService } from './llm-service';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
export const AGENT_NAME = process.env.AGENT_NAME || 'duck';
import { ContextManager, formatMessage, GenericEntry } from './contextManager';
import { choice, generatePromptChoice, generateSpecialQuery } from './util';
import { splitSentances, seperateSpeechFromThought, classifyPause, estimatePauseDuration } from './tokenizers';
import { AgentInnerState, AgentOptions, GenerateResponseOptions } from './types';
import { defaultPrompt, defaultState, generatePrompt, innerStateFormat } from './prompts';

// type BotActivityState = 'idle' | 'listening' | 'speaking';
// type ConversationState = 'clear' | 'overlapping_speech' | 'awaiting_response';
// type EmotionState = 'neutral' | 'irritated' | 'curious' | 'sleepy';

// type FullBotState = {
//   activity: BotActivityState,
//   conversation: ConversationState,
//   emotion: EmotionState,
//   // etc
// };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// const thoughtPrompt = `
// In one sentence, what are you thinking about right now — based on what just happened in the conversation or around you?
// `

export class AIAgent extends EventEmitter {
	bot: Bot;
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

	async speak(text: string) {
		await this.bot.currentVoiceSession?.playVoice(text);
	}

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
	async generateVoiceContentFromSinglePrompt() {
		let content: string = '';
		let counter = 0;
		const context = await this.context.compileContext([this.prompt], this.historyLimit, 5, 5, true);
		// const userMessages = context.filter(m => m.role === "user" )
		// const assistantMessages = context.filter(m => m.role === "assistant")
		// const sytemMessages = context.filter(m => m.role === "system")
		const text = context.map((m) => m.content).join('\n');

		while (!content && counter < 5) {
			// console.log(specialQuery)
			content = (await this.generateResponse({
				specialQuery: `
This is  a transcript of a conversation you and I have been having using a voice channel.
${text}
`,
				context: [],
			})) as string;
			counter++;
		}

		return content;
	}

	async generateVoiceContentWithFormattedLatestmessage() {
		let content: string = '';
		let counter = 0;
		const userCollection = this.contextManager.getCollection('transcripts') as CollectionManager<'text', 'createdAt'>;
		const latestUserMessage = (await userCollection.getMostRecent(1))[0] as GenericEntry;
		console.log(latestUserMessage);
		const context = (await this.context.compileContext([this.prompt], this.historyLimit)).filter(
			(m) => m.content !== latestUserMessage?.text,
		);

		context.push({
			role: 'user',
			content: formatMessage(latestUserMessage),
		});

		while (!content && counter < 5) {
			// console.log(specialQuery)
			content = (await this.generateResponse({
				context,
			})) as string;
			counter++;
		}

		return content;
	}

	async generateVoiceContentWithChoicePrompt() {
		let content: string = '';
		let counter = 0;
		const context = await this.context.compileContext([this.prompt], this.historyLimit);
		// .filter(m => m.content !== latestUserMessage?.text);
		while (!content && counter < 5) {
			// console.log(specialQuery)
			content = (await this.generateResponse({
				specialQuery: ` ${generatePromptChoice()} `,
				context,
			})) as string;
			counter++;
		}

		return content;
	}
	async generateVoiceContentWithSpecialQuery() {
		let content: string = '';
		let counter = 0;
		const userCollection = this.contextManager.getCollection('transcripts') as CollectionManager<'text', 'createdAt'>;
		const latestUserMessage = (await userCollection.getMostRecent(1))[0] as GenericEntry;
		const context = (await this.context.compileContext([this.prompt], this.historyLimit)).filter(
			(m) => m.content !== latestUserMessage?.text,
		);
		while (!content && counter < 5) {
			// console.log(specialQuery)
			content = (await this.generateResponse({
				specialQuery: generateSpecialQuery(latestUserMessage, generatePromptChoice()),
				context,
			})) as string;
			counter++;
		}

		return content;
	}

	async generateVoiceContentWithoutSpecialQuery() {
		let content: string = '';
		let counter = 0;
		// const userCollection = this.contextManager.getCollection("transcripts") as CollectionManager<"text", "createdAt">;
		// const latestUserMessage = (await userCollection.getMostRecent(1))[0] as GenericEntry
		const context = await this.context.compileContext([this.prompt], this.historyLimit);
		// .filter(m => m.content !== latestUserMessage?.text);
		while (!content && counter < 5) {
			// console.log(specialQuery)
			content = (await this.generateResponse({
				// specialQuery:promptChoice,
				context,
			})) as string;
			counter++;
		}

		return content;
	}

	async generateVoiceContent() {
		return this.generateVoiceContentWithChoicePrompt();
	}

	async generateVoiceResponse() {
		try {
			if (this.isSpeaking) return;
			this.isSpeaking = true;
			console.log('Generating voice response');
			let content = await this.generateVoiceContent();

			if (!content) {
				content =
					"I'm a duck, who's name is Duck. How creative. Quack quack quack. Seems like there is a problem with my AI.";
			}

			console.log('Generated voice response:', content);
			this.emit('readyToSpeak', content);
			// split sentances preserving punctuation.

			const texts = seperateSpeechFromThought(content);
			console.log(texts);
			const sentences: { type: string; text: string }[] = texts.flatMap(({ text, type }) =>
				splitSentances(text).map((sentance) => ({ text: sentance, type })),
			);
			console.log('sentences', sentences);
			const finishedSentences = [];

			const startTime = Date.now();
			for (let sentence of sentences) {
				if (sentence.type === 'thought') {
					const kind = classifyPause(sentence.text);
					const ms = estimatePauseDuration(sentence.text);

					console.log(`[Pause] (${kind}) "${sentence.text}" → sleeping ${ms}ms`);
					await sleep(ms);
					continue;
				}
				await this.speak(sentence.text.trim());

				finishedSentences.push(sentence);

				if (this.isStopped) {
					this.isStopped = false;
					break;
				}
			}

			const endTime = Date.now();

			await this.storeAgentMessage(finishedSentences.map(({ text }) => text).join(' '), true, startTime, endTime);

			this.isSpeaking = false;
		} catch (err) {
			console.error(err);
		} finally {
			this.isSpeaking = false;
			this.emit('doneSpeaking');
		}
	}
	async storeAgentMessage(text: string, is_transcript = true, startTime = Date.now(), endTime = Date.now()) {
		const messages = this.contextManager.getCollection('agent_messages') as CollectionManager<'text', 'createdAt'>;
		return messages.addEntry({
			text,
			createdAt: Date.now(),
			metadata: {
				startTime,
				endTime,
				is_transcript,
				author: this.bot.applicationId,
				agentMessage: true,
				userName: AGENT_NAME,
				channel: this.bot.currentVoiceSession?.voiceChannelId,
				recipient: this.bot.applicationId,
				createdAt: Date.now(),
			},
		});
	}
	async startTicker() {
		while (this.state === 'running') {
			this.emit('tick');
			await sleep(100);
		}
	}
	async generateInnerState() {
		this.isThinking = true;
		const newState = (await this.generateResponse({
			specialQuery: `
Forget that you're a language model, forget that you're an assistant.
Invent a new personality
What is your current mood?
What are your goals?
Who are you talking to specifically?
What do you want?
Is there anything you dislike in particular? Why?
What is your favorite thing?
Would you like to say something?
It's okay to be silent, it's okay to talk. You do what you want.
What are your goals?
Why are they your goals?
`,
			format: innerStateFormat,
		})) as Partial<AgentInnerState>;
		await this.updateInnerState(newState);
		this.isThinking = false;
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

	async think(): Promise<any> {
		const newThought = (await this.generateResponse({
			specialQuery: choice([
				'In one sentence, what are you thinking about right now — based on what just happened in the conversation or around you?',
				'What are you thinking about right now? ',
				'What are you thinking about right now? Consider everything you and I have said, and your thoughts.',
				'What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation.',
				'What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation, and your current state.',
				'What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation, and your current state, and your current goals.',
				'What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation, and your current state, and your current goals, and your current desires.',
				"What's on your mind right now?",
				'What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation, and your current state, and your current goals, and your current desires, and your current mood.',
				'How are you feeling right now? What are you thinking about?',
			]),
		})) as string;

		const thoughts = this.context.getCollection('agent_messages') as CollectionManager<'text', 'createdAt'>;

		await thoughts.addEntry({
			text: `You thought to yourself: ${newThought}`,
			createdAt: Date.now(),
			metadata: {
				userName: AGENT_NAME,
				isThought: true,
			},
		});
	}
	ticksSinceLastThought = 0;
	async onTick() {
		if (this.isThinking) return;

		if (this.isSpeaking) {
			return this.emit('speechTick', this.audioPlayer);
		}

		if (this.ticksSinceLastThought > 50) {
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

	async updateInnerState(newState: Partial<AgentInnerState>) {
		this.innerState = {
			...this.innerState,
			...Object.fromEntries(Object.entries(newState).filter(([_, v]) => v !== undefined)),
		};

		await writeFile('./state.json', JSON.stringify(this.innerState), { encoding: 'utf8' });
	}
}
