// SPDX-License-Identifier: GPL-3.0-only
import { Message } from "ollama";
import { Bot } from "./bot.js";
// avoid compile-time type coupling to ContextStore
import { LLMService } from "./llm-service.js";

export type FormatProperty = {
  type: string;
  description: string;
  name: string;
};
export type FormatObject = {
  type: "object";
  properties: FormatProperty[];
};
export type ChatMessage = {
  role: "system" | "user" | "assistant";
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
  context: any;
  llm?: LLMService;
}

export type GenerateResponseOptions = {
  specialQuery?: string | undefined;
  format?: object | undefined;
  context?: Message[] | undefined;
  prompt?: string | undefined;
};
