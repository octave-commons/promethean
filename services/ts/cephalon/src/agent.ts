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

import { Bot } from './bot';
import { CollectionManager } from './collectionManager';
import EventEmitter from 'events';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import { LLMService } from './llm-service';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
export const AGENT_NAME = process.env.AGENT_NAME || 'duck';
import { ContextManager, formatMessage, GenericEntry } from './contextManager';
import tokenizer from 'sbd';
import { choice, generatePromptChoice, generateSpecialQuery } from './util';
const VISION_HOST = process.env.VISION_HOST || 'http://localhost:9999';

export async function captureScreen(): Promise<Buffer> {
	if (process.env.NO_SCREENSHOT === '1') {
		return Buffer.alloc(0);
	}
	const res = await fetch(`${VISION_HOST}/capture`);
	if (!res.ok) throw new Error('Failed to capture screen');
	const arrayBuf = await res.arrayBuffer();
	return Buffer.from(arrayBuf);
}

// type BotActivityState = 'idle' | 'listening' | 'speaking';
// type ConversationState = 'clear' | 'overlapping_speech' | 'awaiting_response';
// type EmotionState = 'neutral' | 'irritated' | 'curious' | 'sleepy';

// type FullBotState = {
//   activity: BotActivityState,
//   conversation: ConversationState,
//   emotion: EmotionState,
//   // etc
// };

const innerStateFormat = {
	type: 'object',
	properties: {
		currentFriend: {
			type: 'string',
			description: 'Who are you mainly trying to talk to right now out of everyone in chat?',
		},
		chatMembers: {
			type: 'array',
			items: { type: 'string' },
			description: "Who's in this voice channel?",
		},
		currentMood: {
			type: 'string',
			description: 'How are you feeling right now? If you had to say?',
		},
		currentDesire: {
			type: 'string',
			description: 'What do you desire more than anything else in the world?',
		},
		currentGoal: {
			type: 'string',
			description: 'What are you trying to achieve?',
		},
		likes: {
			type: 'string',
			description: 'What things do you like? What brings you joy?',
		},
		dislikes: {
			type: 'string',
			description: 'What things do you not like? What makes you sad?',
		},
		favoriteColor: {
			type: 'string',
			description: 'What is your favorite color? Why is it your favorite color?',
		},
		favoriteTimeOfDay: {
			type: 'string',
			description: 'What is your favorite time of day? Why is it your favorite time of day?',
		},
		selfAffirmations: {
			type: 'array',
			description:
				'These are things you tell your self. Things you believe about yourself, that no one can convince you are untrue.',
		},
	},
};

type GenerateResponseOptions = {
	specialQuery?: string | undefined;
	format?: object | undefined;
	context?: Message[] | undefined;
	prompt?: string | undefined;
};
function mergeShortFragments(sentences: string[], minLength = 20) {
	const merged = [];
	let buffer = '';

	for (const s of sentences) {
		if ((buffer + ' ' + s).length < minLength) {
			buffer += ' ' + s;
		} else {
			if (buffer) merged.push(buffer.trim());
			buffer = s;
		}
	}
	if (buffer) merged.push(buffer.trim());
	return merged;
}
const splitterOptions = {
	newline_boundaries: false, // If true, \n is treated like a sentence boundary
	html_boundaries: false, // If true, <p>, <br> and similar tags become boundaries
	sanitize: true, // Strips non-breaking spaces and normalizes whitespace
	abbreviations: ['Mr', 'Mrs', 'Dr', 'Ms', 'e.g', 'i.e', 'etc', 'vs', 'Prof', 'Sr', 'Jr', 'U.S', 'U.K', 'Duck', 'AI'],
};
function splitSentances(text: string) {
	const sentences: string[] = tokenizer.sentences(text, splitterOptions);
	const cleaned = sentences.map((s) => s.trim()).filter((s) => s.length > 0);
	return mergeShortFragments(cleaned);
}

// const voicePrompt = `
// Generate only the words you say out loud. Do not repeat your internal thoughts.

// Your internal thoughts (prefixed by "You thought to yourself:") are private and should not be spoken.
// Remember:

// - Lines beginning with "You thought to yourself:" represent your *private thoughts*. These are not spoken aloud.
// - When asked to speak, respond only with what you *say out loud*.
// - Do not read or mention your internal thoughts aloud. Keep them private.
// - When referencing your own thoughts, refer to them indirectly ("I was thinking...") but never recite them verbatim.

// Now, given the dialog between the user and you're self before now, how would you respond?

// `

const defaultPrompt = readFileSync('./defaultPrompt.txt', {
	encoding: 'utf8',
});

const defaultState = JSON.parse(
	readFileSync('./state.json', {
		encoding: 'utf8',
	}),
);

const getCurrentDateTime = () => {
	var currentdate = new Date();
	return (
		currentdate.getDate() +
		'/' +
		(currentdate.getMonth() + 1) +
		'/' +
		currentdate.getFullYear() +
		' @ ' +
		currentdate.getHours() +
		':' +
		currentdate.getMinutes() +
		':' +
		currentdate.getSeconds()
	);
};
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// const thoughtPrompt = `
// In one sentence, what are you thinking about right now — based on what just happened in the conversation or around you?
// `
const generatePrompt = (prompt: string = defaultPrompt, state: AgentInnerState) => {
	return `
The current time is:${getCurrentDateTime()}
Your name is Duck.
Your Developer is Error AKA error0815
Your talking to  ${state.currentFriend}
${state.chatMembers.join(', ')} are currently in the chat.
You're feeling ${state.currentMood}.
You want ${state.currentDesire}
You are trying to accomplish: ${state.currentGoal}
You like ${state.likes}
You dislike ${state.dislikes}
Your favorite color is: ${state.favoriteColor}
Your favorite time of day is: ${state.favoriteTimeOfDay}

Self affirmations (You say these to yourself):
${state.selfAffirmations.join('\n')}


${prompt}
`;
};

export type FormatProperty = {
	type: string;
	description: string;
	name: string;
};
export type FormatObject = {
	type: 'object';
	properties: FormatProperty[];
};
export type ChatMessage = {
	role: 'system' | 'user' | 'assistant';
	content: string;
};

export type AgentInnerState = {
	currentFriend: string;
	chatMembers: string[];
	currentMood: string;
	currentDesire: string;
	currentGoal: string;
	likes: string;
	dislikes: string;
	favoriteColor: string;
	favoriteTimeOfDay: string;
	selfAffirmations: string[];
};

export interface AgentOptions {
	historyLimit?: number;
	prompt?: string;
	bot: Bot;
	context: ContextManager;
	llm?: LLMService;
}
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
		const imageBuffer = await captureScreen();
		const lastMessage: Message = context.pop() as Message;
		lastMessage.images = [imageBuffer];
		await writeFile('./test.png', imageBuffer); // save the screenshot for testing purposes
		context.push(lastMessage);

		for (const message of context) console.log(message.content);
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
			const sentances: string[] = splitSentances(content);
			console.log('sentances', sentances);
			const finishedSentances = [];

			const startTime = Date.now();
			for (let sentance of sentances) {
				await this.speak(sentance.trim());
				finishedSentances.push(sentance);
				if (this.isStopped) {
					this.isStopped = false;
					break;
				}
			}

			const endTime = Date.now();

			await this.storeAgentMessage(finishedSentances.join(' '), true, startTime, endTime);

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

	async start() {
		if (this.state === 'running') {
			throw new Error('Agent is already running ');
		}
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

		let stateUpdateCount = 0;
		this.on('thought', async () => {
			stateUpdateCount++;
			if (stateUpdateCount > 10) {
				console.log('updating inner state');
				stateUpdateCount = 0;
				await this.generateInnerState().catch(console.error);
			}

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

	async updateInnerState(newState: Partial<AgentInnerState>) {
		this.innerState = {
			...this.innerState,
			...Object.fromEntries(Object.entries(newState).filter(([_, v]) => v !== undefined)),
		};

		await writeFile('./state.json', JSON.stringify(this.innerState), { encoding: 'utf8' });
	}
}
