/**
 * LLM-powered Actor Implementation
 * An actor that uses LLM to process messages and make decisions
 */

import type { ActorPort, Actor, ActorConfig, LlmPort, Message } from '../core/ports.js';

export interface LLMActorConfig extends ActorConfig {
  llm: LlmPort;
  systemPrompt?: string;
  maxMessages?: number;
}

export function makeLLMActorAdapter(): ActorPort & {
  addMessage(actorId: string, message: Message): Promise<void>;
  getMessages(actorId: string): Promise<Message[]>;
} {
  const actors = new Map<string, Actor & { config: LLMActorConfig; messages: Message[] }>();

  const actorAdapter: ActorPort = {
    async tick(actorId: string): Promise<void> {
      const actor = actors.get(actorId);
      if (!actor) {
        throw new Error(`Actor ${actorId} not found`);
      }

      const { config, messages } = actor;

      // Build conversation history
      const conversation: Message[] = [];

      // Add system prompt if provided
      if (config.systemPrompt) {
        conversation.push({
          role: 'system',
          content: config.systemPrompt,
        });
      }

      // Add recent messages (limit by maxMessages)
      const recentMessages = messages.slice(-(config.maxMessages || 10));
      conversation.push(...recentMessages);

      // If we have messages, get LLM response
      if (recentMessages.length > 0) {
        try {
          const response = await config.llm.complete(conversation);

          // Add response to message history
          messages.push(response);

          // Trim message history if it gets too long
          if (messages.length > (config.maxMessages || 20)) {
            messages.splice(0, messages.length - (config.maxMessages || 20));
          }

          console.log(`LLM Actor ${actorId} responded:`, response.content);
        } catch (error) {
          console.error(`LLM Actor ${actorId} error:`, error);
        }
      }

      // Update last tick time
      actor.lastTick = Date.now();
      actors.set(actorId, actor);
    },

    async create(config: LLMActorConfig): Promise<string> {
      const id = `llm-actor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const actor: Actor & { config: LLMActorConfig; messages: Message[] } = {
        id,
        config,
        state: null,
        lastTick: Date.now(),
        messages: [],
      };

      actors.set(id, actor);
      console.log(`Created LLM actor ${id} with model: ${config.parameters.model || 'default'}`);

      return id;
    },

    async get(id: string): Promise<Actor | null> {
      const actor = actors.get(id);
      if (!actor) return null;

      // Return base Actor interface (hide internal message history)
      return {
        id: actor.id,
        config: actor.config,
        state: actor.state,
        lastTick: actor.lastTick,
      };
    },
  };

  // Additional methods for LLM actor management
  const adapter = {
    async addMessage(actorId: string, message: Message): Promise<void> {
      const actor = actors.get(actorId);
      if (!actor) {
        throw new Error(`Actor ${actorId} not found`);
      }

      actor.messages.push(message);
      actors.set(actorId, actor);
    },

    async getMessages(actorId: string): Promise<Message[]> {
      const actor = actors.get(actorId);
      if (!actor) {
        throw new Error(`Actor ${actorId} not found`);
      }

      return [...actor.messages];
    },
  };

  return Object.assign(actorAdapter, adapter);
}
