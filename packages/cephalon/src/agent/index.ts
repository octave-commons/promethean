/**
 * @file index.ts
 * @description This file defines the Agent class, which is responsible for managing the agent's state and interactions.
 * It includes methods for starting, stopping, and managing the agent's lifecycle.
 * @author Your Name
 * @version 1.0.0
 * @license GNU General Public License v3.0
 * @requires EventEmitter
 */

import EventEmitter from "events";

import { AudioPlayer, createAudioPlayer } from "@discordjs/voice";
import { Message } from "ollama";
import { sleep } from "@promethean-os/utils";

import {
  DesktopCaptureManager,
  DesktopCaptureData,
} from "../desktop/desktopLoop.js";
import { Bot } from "../bot.js";
import { LLMService } from "../llm-service.js";
import {
  AgentInnerState,
  AgentOptions,
  GenerateResponseOptions,
} from "../types.js";
import { defaultPrompt, defaultState, generatePrompt } from "../prompts.js";

import {
  speak as speakAction,
  generateVoiceResponse as generateVoiceResponseAction,
  storeAgentMessage as storeAgentMessageAction,
} from "./speech.js";
import {
  generateVoiceContentFromSinglePrompt as generateVoiceContentFromSinglePromptFn,
  generateVoiceContentWithFormattedLatestmessage as generateVoiceContentWithFormattedLatestmessageFn,
  generateVoiceContentWithChoicePrompt as generateVoiceContentWithChoicePromptFn,
  generateVoiceContentWithSpecialQuery as generateVoiceContentWithSpecialQueryFn,
  generateVoiceContentWithoutSpecialQuery as generateVoiceContentWithoutSpecialQueryFn,
  generateVoiceContent as generateVoiceContentFn,
} from "./voiceContent.js";
import {
  generateInnerState as generateInnerStateFn,
  think as thinkFn,
  updateInnerState as updateInnerStateFn,
  loadInnerState as loadInnerStateFn,
} from "./innerState.js";
import { SpeechArbiter, TurnManager } from "./speechCoordinator.js";

// type BotActivityState = 'idle' | 'listening' | 'peaking';
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
  audioPlayer: AudioPlayer;
  speechArbiter: SpeechArbiter;
  turnManager: TurnManager;
  context: any;
  llm: LLMService;

  // --- VAD smoothing / hysteresis ---
  private vadAttackMs = 120; // how long speech must be 'active' to count as speaking
  private vadReleaseMs = 250; // how long silence must persist to count as not speaking
  private vadHangMs = 800; // max time to allow stale 'true' before forcing false (safety)
  private lastVadTrueAt = 0;
  private lastVadFalseAt = 0;
  // --- end VAD smoothing / hysteresis ---
  constructor(options: AgentOptions) {
    super();
    this.state = "idle"; // Initial state of the agent
    this.bot = options.bot;
    this.prompt = options.prompt || defaultPrompt;
    this.context = options.context;
    this.llm =
      options.llm ||
      (process.env.DISABLE_BROKER === "1"
        ? ({ generate: async () => "" } as unknown as LLMService)
        : new LLMService());
    // Avoid spinning up real audio timers during tests
    this.audioPlayer =
      process.env.DISABLE_AUDIO === "1"
        ? (new EventEmitter() as unknown as AudioPlayer)
        : createAudioPlayer();
    this.speechArbiter = new SpeechArbiter(this.audioPlayer);
    this.turnManager = new TurnManager();
    this.turnManager.on("turn", (id: number) =>
      this.speechArbiter.setTurnId(id),
    );
    void this.loadInnerState();
  }
  speak = speakAction;
  storeAgentMessage = storeAgentMessageAction;
  generateVoiceResponse = generateVoiceResponseAction;
  generateVoiceContentFromSinglePrompt = generateVoiceContentFromSinglePromptFn;
  generateVoiceContentWithFormattedLatestmessage =
    generateVoiceContentWithFormattedLatestmessageFn;
  generateVoiceContentWithChoicePrompt = generateVoiceContentWithChoicePromptFn;
  generateVoiceContentWithSpecialQuery = generateVoiceContentWithSpecialQueryFn;
  generateVoiceContentWithoutSpecialQuery =
    generateVoiceContentWithoutSpecialQueryFn;
  generateVoiceContent = generateVoiceContentFn;
  generateInnerState = generateInnerStateFn;
  think = thinkFn;
  updateInnerState = updateInnerStateFn;
  loadInnerState = loadInnerStateFn;

  /** external VAD should call this with raw activity booleans frequently */
  public updateVad(rawActive: boolean) {
    const now = Date.now();

    if (rawActive) {
      this.lastVadTrueAt = now;
      // attack: only flip userSpeaking true if it's been active long enough
      if (!this.userSpeaking && now - this.lastVadFalseAt >= this.vadAttackMs) {
        this.userSpeaking = true;
        // when user starts speaking while we're speaking, we enter overlap flow naturally
      }
    } else {
      this.lastVadFalseAt = now;
      // release: only flip false after sustained silence
      if (this.userSpeaking && now - this.lastVadTrueAt >= this.vadReleaseMs) {
        this.userSpeaking = false;
        // reset overlap counters on clean release
        this.overlappingSpeech = 0;
        this.ticksWaitingToResume = 0;
      }
    }
  }

  /** safety: call each tick to force userSpeaking=false if VAD stalls */
  private reconcileVadStall() {
    const now = Date.now();
    if (this.userSpeaking && now - this.lastVadTrueAt > this.vadHangMs) {
      // stale 'true' — force release
      this.userSpeaking = false;
      this.overlappingSpeech = 0;
      this.ticksWaitingToResume = 0;
    }
  }

  imageContext: Buffer[] = [];
  async generateResponse({
    specialQuery,
    context,
    format,
    prompt = this.prompt,
  }: GenerateResponseOptions): Promise<string | object> {
    const ctx =
      context ??
      (await this.context.compileContext([prompt], this.historyLimit));
    if (format && !specialQuery)
      throw new Error("most specify special query if specifying a format.");
    if (format) specialQuery += " " + "Please respond with valid JSON.";
    if (specialQuery)
      ctx.push({
        role: "user",
        content: specialQuery,
      });
    console.log("You won't believe how big this context is...", ctx.length);
    const lastMessage: Message = ctx.pop() as Message;

    lastMessage.images = await Promise.all(
      this.desktop.frames.flatMap(
        ({ screen, audio: { waveForm, spectrogram } }: DesktopCaptureData) => [
          screen,
          waveForm,
          spectrogram,
        ],
      ),
    );

    ctx.push(lastMessage);

    return this.llm.generate({
      prompt: generatePrompt(prompt, this.innerState),
      context: ctx,
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
    while (this.state === "running") {
      this.emit("tick");
      await sleep(this.tickInterval);
    }
  }

  desktop = new DesktopCaptureManager();
  async start() {
    if (this.state === "running") {
      throw new Error("Agent is already running ");
    }
    this.desktop.start();
    this.state = "running";
    console.log("Agent started");
    this.on("overlappingSpeechTick", (count: number) => {
      console.log("overlapping speech detected");
      const chance = Math.min(1, count / this.maxOverlappingSpeechTicks);
      const roll = Math.random();
      if (chance > roll) {
        this.audioPlayer?.pause();
        this.isPaused = true;
        this.emit("speechPaused");
      }
    });
    this.on("doneSpeaking", () => {
      console.log("done Speaking");
      this.isStopped = false;
      this.isPaused = false;
      this.isSpeaking = false;
      this.overlappingSpeech = 0;
      this.ticksWaitingToResume = 0;
      // when we finish, treat user as not speaking unless VAD immediately says otherwise
      this.userSpeaking = false;
    });
    this.on("speechStopped", () =>
      console.log("speech has been forcefully stopped"),
    );
    this.on("waitingToResumeTick", (count: number) => {
      console.log("waiting to resume");
      const chance = Math.min(1, count / this.forcedStopThreshold);
      const roll = Math.random();
      if (chance > roll) {
        this.isStopped = true;
        this.isSpeaking = false;
        this.emit("speechStopped");
      }
    });
    this.on("speechTick", (player: AudioPlayer) => {
      if (!player) return;

      // safety: reconcile if VAD hasn't updated recently
      this.reconcileVadStall();

      if (this.userSpeaking && !this.isPaused) {
        this.overlappingSpeech++;
        this.emit("overlappingSpeechTick", this.overlappingSpeech);
      } else if (this.userSpeaking && this.isPaused && !this.isStopped) {
        this.ticksWaitingToResume++;
        this.emit("waitingToResumeTick", this.ticksWaitingToResume);
      } else {
        // no user speech: resume playback if we paused
        if (this.isPaused) this.emit("speechResumed");
        player.unpause();
        this.isPaused = false;
        this.overlappingSpeech = 0;
        this.ticksWaitingToResume = 0;
      }
    });

    this.on("readyToSpeak", () => {
      // hard reset before TTS starts
      this.overlappingSpeech = 0;
      this.ticksWaitingToResume = 0;
      this.isStopped = false;
      this.isPaused = false;
      // don't assume userSpeaking; keep current VAD smoothed state
      // but make sure stale true can't leak in:
      this.reconcileVadStall();
    });
    this.on("tick", async () => this.onTick());

    this.on("thought", async () => {
      console.log("updating inner state");
      await this.generateInnerState().catch(console.error);

      this.isThinking = false;
    });

    this.bot?.currentVoiceSession?.on(
      "audioPlayerStart",
      (player: AudioPlayer) => {
        this.onAudioPlayerStart(player);
      },
    );

    this.bot?.currentVoiceSession?.on("audioPlayerStop", () => {
      this.onAudioPlayerStop();
    });
    this.startTicker();
  }

  stop() {
    if (this.state !== "running") {
      throw new Error("Agent is not running");
    }
    this.desktop.stop();
    this.state = "stopped";
    console.log("Agent stopped");
  }

  ticksSinceLastThought = 0;
  async onTick() {
    if (this.isThinking) return;

    // keep VAD from sticking if upstream stalls
    this.reconcileVadStall();

    if (this.isSpeaking) {
      this.emit("speechTick", this.audioPlayer);
      return;
    }

    if (this.ticksSinceLastThought > 10) {
      if (!this.isThinking && !this.isSpeaking) {
        console.log("Thinking");
        try {
          this.isThinking = true;
          await this.think();
          this.emit("thought");
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
    console.log("audio player has stopped");
  }
  onAudioPlayerStart(player: AudioPlayer) {
    console.log("audio player has started");
    this.audioPlayer = player;
    this.isSpeaking = true; // <-- important
    this.emit("readyToSpeak"); // normalize state before overlap logic
  }
}
