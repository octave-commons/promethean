import { choice } from "../util.js";
import { defaultState, innerStateFormat } from "../prompts.js";
import { openLevelCache } from "@promethean-os/level-cache";
import type { Cache } from "@promethean-os/level-cache";
import type { AgentInnerState } from "../types.js";

import type { AIAgent } from "./index.js";
let AGENT_NAME = "Agent";
try {
  ({ AGENT_NAME } = await import("@promethean-os/legacy/env.js"));
} catch {}
const DB_PATH = ".cache/cephalon.level";
const STATE_KEY = `${AGENT_NAME}-inner-state`;

export async function generateInnerState(this: AIAgent) {
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
  console.log("saving new state", newState);
  await this.updateInnerState(newState);
  this.isThinking = false;
}

export async function think(this: AIAgent): Promise<any> {
  const newThought = (await this.generateResponse({
    specialQuery: choice([
      "In one sentence, what are you thinking about right now — based on what just happened in the conversation or around you?",
      "What are you thinking about right now? ",
      "What are you thinking about right now? Consider everything you and I have said, and your thoughts.",
      "What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation.",
      "What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation, and your current state.",
      "What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation, and your current state, and your current goals.",
      "What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation, and your current state, and your current goals, and your current desires.",
      "What's on your mind right now?",
      "What are you thinking about right now? Consider everything you and I have said, and your thoughts, and the current conversation, and your current state, and your current goals, and your current desires, and your current mood.",
      "How are you feeling right now? What are you thinking about?",
    ]),
  })) as string;

  const thoughts = this.context.getCollection("agent_messages");

  await thoughts.insert({
    text: `You thought to yourself: ${newThought}`,
    createdAt: Date.now(),
    metadata: {
      userName: AGENT_NAME,
      isThought: true,
    },
  });
}

export async function updateInnerState(
  this: AIAgent,
  newState: Partial<AgentInnerState>,
) {
  this.innerState = {
    ...this.innerState,
    ...Object.fromEntries(
      Object.entries(newState).filter(([_, v]) => v !== undefined),
    ),
  };
  let cache: Cache<AgentInnerState> | undefined;
  try {
    cache = await openLevelCache<AgentInnerState>({ path: DB_PATH });
    await cache.set(STATE_KEY, this.innerState);
  } catch {
    // ignore persistence errors
  } finally {
    if (cache) {
      try {
        await cache.close();
      } catch {
        // ignore close errors
      }
    }
  }
}

export async function loadInnerState(this: AIAgent) {
  let cache: Cache<AgentInnerState> | undefined;
  try {
    cache = await openLevelCache<AgentInnerState>({ path: DB_PATH });
    const stored = await cache.get(STATE_KEY);
    this.innerState = stored ?? defaultState;
    if (stored === undefined) {
      await cache.set(STATE_KEY, this.innerState);
    }
  } catch {
    this.innerState = defaultState;
  } finally {
    if (cache) {
      try {
        await cache.close();
      } catch {
        // ignore close errors
      }
    }
  }
}
