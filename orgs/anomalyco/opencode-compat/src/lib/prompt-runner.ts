import type { CompatRuntimeConfig } from "./config.js";
import { CompatEventBus } from "./events.js";
import { buildAssistantResponse, createId, materializeParts } from "./helpers.js";
import type { CompatStore } from "./store.js";
import type { AssistantMessage, MessageWithParts, PromptRequestBody, UserMessage } from "./types.js";

export class PromptRunner {
  constructor(
    private readonly cfg: CompatRuntimeConfig,
    private readonly store: CompatStore,
    private readonly events: CompatEventBus
  ) {}

  async run(sessionId: string, body: PromptRequestBody): Promise<MessageWithParts> {
    const session = await this.store.getSession(sessionId);
    if (!session) {
      throw new Error(`session ${sessionId} not found`);
    }

    await this.store.setSessionStatus(session.id, session.directory, { type: "busy" });
    this.events.publish(session.directory, {
      type: "session.status",
      properties: {
        sessionID: session.id,
        status: { type: "busy" }
      }
    });

    const created = Date.now();
    const userMessage: UserMessage = {
      id: body.messageID ?? createId("msg"),
      sessionID: session.id,
      role: "user",
      time: { created },
      agent: body.agent ?? this.cfg.defaultAgent,
      model: body.model ?? {
        providerID: this.cfg.defaultProvider,
        modelID: this.cfg.defaultModel
      },
      system: body.system,
      tools: body.tools,
      variant: body.variant
    };
    const userEntry: MessageWithParts = {
      info: userMessage,
      parts: materializeParts(session.id, userMessage.id, body.parts)
    };
    await this.store.appendMessage(userEntry, session.directory);
    this.events.publish(session.directory, {
      type: "message.updated",
      properties: {
        info: userEntry.info
      }
    });

    const mcp = await this.store.listMcp(session.directory);
    const assistantCreated = Date.now();
    const assistantInfo: AssistantMessage = {
      id: createId("msg"),
      sessionID: session.id,
      role: "assistant",
      time: {
        created: assistantCreated,
        completed: assistantCreated
      },
      parentID: userMessage.id,
      modelID: (body.model?.modelID ?? this.cfg.defaultModel),
      providerID: (body.model?.providerID ?? this.cfg.defaultProvider),
      mode: "chat",
      agent: body.agent ?? this.cfg.defaultAgent,
      path: {
        cwd: session.directory,
        root: session.directory
      },
      cost: 0,
      tokens: {
        input: 0,
        output: 0,
        reasoning: 0,
        cache: {
          read: 0,
          write: 0
        }
      },
      finish: "stop"
    };
    const responseText = buildAssistantResponse({ body, session, mcp });
    const assistantEntry: MessageWithParts = {
      info: assistantInfo,
      parts: materializeParts(session.id, assistantInfo.id, [
        {
          type: "text",
          text: responseText,
          time: { start: assistantCreated, end: assistantCreated }
        }
      ])
    };
    await this.store.appendMessage(assistantEntry, session.directory);
    this.events.publish(session.directory, {
      type: "message.updated",
      properties: {
        info: assistantEntry.info
      }
    });
    for (const part of assistantEntry.parts) {
      if (part.type !== "text") {
        continue;
      }
      this.events.publish(session.directory, {
        type: "message.part.delta",
        properties: {
          sessionID: session.id,
          messageID: assistantEntry.info.id,
          partID: part.id,
          field: "text",
          delta: part.text
        }
      });
    }

    await this.store.setSessionStatus(session.id, session.directory, { type: "idle" });
    this.events.publish(session.directory, {
      type: "session.status",
      properties: {
        sessionID: session.id,
        status: { type: "idle" }
      }
    });
    this.events.publish(session.directory, {
      type: "session.idle",
      properties: {
        sessionID: session.id
      }
    });

    return assistantEntry;
  }

  queue(sessionId: string, body: PromptRequestBody) {
    queueMicrotask(() => {
      void this.run(sessionId, body).catch(async (error) => {
        const session = await this.store.getSession(sessionId);
        if (!session) {
          return;
        }
        await this.store.setSessionStatus(session.id, session.directory, { type: "idle" });
        this.events.publish(session.directory, {
          type: "session.error",
          properties: {
            sessionID: session.id,
            error: {
              name: "UnknownError",
              data: {
                message: error instanceof Error ? error.message : String(error)
              }
            }
          }
        });
      });
    });
  }
}
