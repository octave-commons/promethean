/**
 * Turn Processor
 *
 * Orchestrates LLM calls and tool execution.
 * Implements the proper tool-calling loop as per Ollama's agent pattern.
 */

import { InMemoryEventBus, type EventBus } from "@promethean-os/event";
import type {
  Session,
  CephalonEvent,
  CephalonPolicy,
  ToolCall,
  ChatMessage,
  OllamaToolCall,
} from "../types/index.js";
import { OllamaProvider, type LLMProvider, createOllamaConfig } from "./provider.js";
import type { ToolExecutor } from "./tools/executor.js";
import type { MemoryStore } from "../core/memory-store.js";
import type { DiscordApiClient } from "../discord/api-client.js";
import { OutputDedupe } from "../mind/output-dedupe.js";
import {
  assembleContext,
  createHeuristicTokenizer,
  generatePersonaHeader,
  getCurrentPersonaName,
} from "../context/assembler.js";
import {
  mintFromDiscordEvent,
  mintFromLLMResponse,
  mintFromToolCall,
} from "../core/minting.js";
import type { CephalonMindQueue, MindMessageProposal, MindPromptProposal } from "../mind/integration-queue.js";

/**
 * Turn processor that orchestrates LLM calls and tool execution
 */
export class TurnProcessor {
  private provider: LLMProvider;
  private providerCache = new Map<string, LLMProvider>();
  private executor: ToolExecutor;
  private memoryStore: MemoryStore;
  private eventBus: EventBus;
  private policy: CephalonPolicy;
  private discordApiClient: DiscordApiClient;
  private outputDedupe: OutputDedupe;
  private mindQueue?: CephalonMindQueue;

  constructor(
    provider: LLMProvider,
    executor: ToolExecutor,
    memoryStore: MemoryStore,
    eventBus: EventBus,
    policy: CephalonPolicy,
    discordApiClient: DiscordApiClient,
    mindQueue?: CephalonMindQueue,
  ) {
    this.provider = provider;
    this.executor = executor;
    this.memoryStore = memoryStore;
    this.eventBus = eventBus;
    this.policy = policy;
    this.discordApiClient = discordApiClient;
    this.outputDedupe = new OutputDedupe(policy.dedupe);
    this.mindQueue = mindQueue;
  }

  /**
   * Get the executor for direct tool calls (used by proactive behavior)
   */
  getExecutor(): ToolExecutor {
    return this.executor;
  }

  private resolveProvider(session: Session): LLMProvider {
    const requestedModel = session.modelName?.trim();
    if (!requestedModel || requestedModel === this.policy.models.actor.name) {
      return this.provider;
    }

    const cached = this.providerCache.get(requestedModel);
    if (cached) {
      return cached;
    }

    const provider = new OllamaProvider(createOllamaConfig(requestedModel));

    this.providerCache.set(requestedModel, provider);
    return provider;
  }

  private formatMessageProposalContext(proposals: readonly MindMessageProposal[]): string {
    const lines = proposals.map((proposal) => {
      const circuit = proposal.circuitIndex ? `c${proposal.circuitIndex}` : proposal.sessionId;
      const channel = proposal.suggestedChannelName || proposal.suggestedChannelId || "unspecified";
      const rationale = proposal.rationale ? ` rationale=${proposal.rationale}` : "";
      return `- id=${proposal.id} from=${circuit} channel=${channel}${rationale}\n  text=${proposal.content}`;
    });

    return [
      "Shared message proposal queue:",
      "You are the single speaking integrator. Read multiple proposals, choose what should actually be said, then consume the proposals you used.",
      ...lines,
    ].join("\n");
  }

  private formatPromptProposalContext(proposals: readonly MindPromptProposal[]): string {
    const lines = proposals.map((proposal) => {
      const parts = [`- id=${proposal.id} from=${proposal.proposerSessionId} target=${proposal.targetSessionId}`];
      if (proposal.rationale) {
        parts.push(`  rationale=${proposal.rationale}`);
      }
      if (proposal.systemPrompt) {
        parts.push(`  system=${proposal.systemPrompt}`);
      }
      if (proposal.developerPrompt) {
        parts.push(`  developer=${proposal.developerPrompt}`);
      }
      if (proposal.attentionFocus) {
        parts.push(`  attention=${proposal.attentionFocus}`);
      }
      return parts.join("\n");
    });

    return [
      "Shared prompt-governance queue:",
      "You are the prompt governor. Review the competing prompt suggestions, decide which changes should actually become law, then apply the prompt update to the target circuit.",
      ...lines,
    ].join("\n");
  }

  /**
   * Process a turn: receive event, assemble context, call LLM, execute tools
   * Implements the proper tool-calling loop as per Ollama's agent pattern
   */
  async processTurn(session: Session, event: CephalonEvent): Promise<void> {
    console.log(`[TurnProcessor] Processing turn for session ${session.id}`);
    const provider = this.resolveProvider(session);

    // Validate inputs
    if (!event || typeof event !== "object") {
      console.error(
        `[TurnProcessor] Error: event is undefined or not an object`,
      );
      return;
    }
    if (!event.type) {
      console.error(`[TurnProcessor] Error: event.type is undefined`);
      return;
    }

    // Mint memory from the user's message
    const mintingConfig = {
      cephalonId: session.cephalonId,
      sessionId: session.id,
      schemaVersion: 1,
    };

    try {
      // Mint memory from the Discord event (user message)
      if (event.type.startsWith("discord.")) {
        await mintFromDiscordEvent(this.memoryStore, event, mintingConfig);
      }

      // Assemble context
      const tokenizer = createHeuristicTokenizer();
      const context = await assembleContext({
        windowTokens: this.policy.models.actor.maxContextTokens,
        policy: this.policy,
        session,
        currentEvent: event,
        tokenizer,
        memoryStore: this.memoryStore,
        retrieveRelated: async () => [], // TODO: Implement vector retrieval
      });

      // Build conversation history for tool loop
      const messages: ChatMessage[] = [...context.messages];
      const tools = this.executor.getToolDefinitions(session.id);

      const isTickEvent = event.type === "system.tick";
      let plannedTickOutputChannel: { channelId: string | null; channelName?: string } | undefined;

      const isCephalonSilence = (text: string): boolean => {
        const trimmed = text.trim();
        const lowered = trimmed.toLowerCase();

        // Primary contract token (preferred)
        if (lowered === "<cephalon:silence/>" || lowered === "<cephalon:silent/>") return true;

        // Legacy-ish / fallback phrasings (tick-only) that we treat as silence.
        if (/^\[?silence\]?$/i.test(trimmed)) return true;
        if (/^staying quiet\.?$/i.test(trimmed)) return true;
        if (/^no (direct )?mention\.?\s*staying quiet\.?$/i.test(trimmed)) return true;

        return false;
      };

      const hasContentAnchor = (text: string): boolean => {
        if (/https?:\/\//i.test(text)) return true;
        if (/```/.test(text)) return true;
        if (/^\s*>/m.test(text)) return true;
        return false;
      };

      const isProceduralReport = (text: string): boolean => {
        const lowered = text.toLowerCase();
        const statusy =
          lowered.includes("emotional temperature") ||
          lowered.includes("trust / warmth") ||
          lowered.includes("warm signals") ||
          lowered.includes("cool signals") ||
          lowered.includes("the field is") ||
          lowered.includes("field is") ||
          lowered.includes("field keeps") ||
          lowered.includes("field converg") ||
          lowered.includes("circuit ");
        if (!statusy) return false;
        return !hasContentAnchor(text);
      };

      // For tick events, add the tick reflection prompt as a user message.
      if (event.type === "system.tick") {
        const tickPayload = event.payload as {
          intervalMs: number;
          tickNumber: number;
          loopId?: string;
          loopLabel?: string;
          circuitIndex?: number;
          modelName?: string;
          reasoningEffort?: Session['reasoningEffort'];
          defaultChannelHints?: string[];
          graphSummary?: string;
          rssSummary?: string;
          eidolonSummary?: string;
          promptFieldSummary?: string;
          promptFieldOverlay?: string;
          suggestedChannel?: string;
          reflectionPrompt?: string;
          recentActivity?: Array<{
            type: string;
            preview: string;
            timestamp?: number;
          }>;
        };

        // Preselect the channel this tick is likely to speak into.
        // This keeps the model grounded in an actual room without making it narrate routing.
        plannedTickOutputChannel = await this.executor.ensureOutputChannel(session.id);

        if (plannedTickOutputChannel?.channelId && !plannedTickOutputChannel.channelId.startsWith("irc:")) {
          try {
            const recent = await this.discordApiClient.fetchChannelMessages(
              plannedTickOutputChannel.channelId,
              { limit: 18 },
            );

            const sorted = [...recent.messages].sort(
              (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
            );

            const lines = sorted.slice(-12).map((m) => {
              const author = m.authorUsername || m.authorId || "someone";
              const body = (m.content || "").replace(/\s+/g, " ").trim();
              const preview = body.length > 180 ? body.slice(0, 179) + "…" : body;
              return `${author}: ${preview}`;
            });

            if (lines.length) {
              messages.push({
                role: "system",
                content:
                  `Room context for grounding: #${plannedTickOutputChannel.channelName || "unknown"}\n` +
                  lines.map((line) => `- ${line}`).join("\n"),
              });
            }
          } catch {
            void 0;
          }
        }

        // Keep tick-specific priming minimal.
        // The circuit/system prompts already define the mode; avoid injecting scheduler jargon
        // or internal metrics that the model might echo back as cold status updates.
        if (tickPayload.loopLabel) {
          console.log(`[TurnProcessor] Loop: ${tickPayload.loopLabel}`);
        }

        // Entertainment overlay is additive: it stacks on top of existing system/developer prompts.
        const personaHeader = await generatePersonaHeader(
          session.cephalonId,
          tickPayload.tickNumber,
          tickPayload.recentActivity,
        );

        if (personaHeader) {
          messages.push(personaHeader);
          console.log(
            `[TurnProcessor] Entertainment persona: ${getCurrentPersonaName(tickPayload.tickNumber).replace(/\bDUCK\b/g, session.cephalonId.toUpperCase())}`,
          );
        }

        // Optional: a short overlay that nudges voice/instinct without being quoted.
        if (tickPayload.promptFieldOverlay) {
          messages.push({ role: "system", content: tickPayload.promptFieldOverlay });
        }

        if (this.mindQueue && session.circuitIndex === 3) {
          const messageProposals = this.mindQueue.peekMessageProposals(12);
          if (messageProposals.length > 0) {
            messages.push({
              role: "system",
              content: this.formatMessageProposalContext(messageProposals),
            });
          }
        }

        if (this.mindQueue && session.circuitIndex === 4) {
          const promptProposals = this.mindQueue.peekPromptProposals(12);
          if (promptProposals.length > 0) {
            messages.push({
              role: "system",
              content: this.formatPromptProposalContext(promptProposals),
            });
          }
        }

        // Add user message with reflection prompt
        messages.push({
          role: "user" as const,
          content: tickPayload.reflectionPrompt || "Respond naturally in this persona.",
        });
      }

      // Tool-calling loop: continue until no more tool calls
      let maxIterations = 10; // Prevent infinite loops
      let finalContent: string | undefined;

      while (maxIterations-- > 0) {
        console.log(
          `[TurnProcessor] LLM call (iteration ${10 - maxIterations})`,
        );

        // Call LLM with current conversation history
        const result = await provider.completeWithTools(messages, tools, {
          queueKey: session.id,
          reasoningEffort: session.reasoningEffort,
        });

        // If the model returned tool calls, execute them
        if (result.toolCalls && result.toolCalls.length > 0) {
          console.log(
            `[TurnProcessor] Executing ${result.toolCalls.length} tool call(s)`,
          );

          // Create assistant message with tool_calls for the history
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: result.content || "",
            tool_calls: result.toolCalls.map(
              (tc: ToolCall): OllamaToolCall => ({
                id: tc.callId,
                type: "function",
                function: {
                  name: tc.name,
                  arguments: tc.args,
                },
              }),
            ),
          };
          messages.push(assistantMessage);

          // Execute each tool call and append results to history
          for (const toolCall of result.toolCalls) {
            const toolResult = await this.executor.execute(
              toolCall,
              session.id,
            );
            console.log(
              `[TurnProcessor] Tool ${toolCall.name}:`,
              toolResult.success ? "success" : toolResult.error,
            );

            // Append tool result to conversation history (Ollama format: role="tool", tool_name, content)
            const toolResultMessage: ChatMessage = {
              role: "tool",
              tool_name: toolCall.name,
              tool_call_id: toolCall.callId,
              call_id: toolCall.callId,
              content: toolResult.success
                ? JSON.stringify(toolResult.result ?? null)
                : JSON.stringify({
                    error: toolResult.error ?? "unknown error",
                  }),
            };
            messages.push(toolResultMessage);

            // Mint memories for tool call and result
            await mintFromToolCall(
              this.memoryStore,
              {
                toolName: toolCall.name,
                args: toolCall.args,
                callId: crypto.randomUUID(),
              },
              {
                toolName: toolCall.name,
                callId: toolCall.callId,
                result: toolResult.result,
                error: toolResult.error,
              },
              mintingConfig,
              {
                eventId: event.id,
                timestamp: Date.now(),
              },
            );
          }

          // Continue the loop to get final response from LLM
          continue;
        }

        // No more tool calls - this is the final response
        finalContent = result.content;
        console.log(
          `[TurnProcessor] Final response: ${finalContent?.slice(0, 100) ?? "(empty)"}...`,
        );
        break;
      }

      if (maxIterations <= 0) {
        console.warn(`[TurnProcessor] Tool loop hit max iterations, stopping`);
      }

      // Mint memory from the final LLM response
      if (finalContent) {
        const cleanedFinalContent = finalContent.replace(/^\s*<cephalon:(?:silence|silent)\/>\s*/iu, "").trim();

        if (isTickEvent && isCephalonSilence(finalContent) && cleanedFinalContent.length === 0) {
          console.log(`[TurnProcessor] Tick produced silence token; skipping output.`);
          // Still log inclusion so retrieval stats stay consistent.
          await this.memoryStore.logInclusion(context.inclusionLog);
          await this.eventBus.publish("session.turn.completed", {
            sessionId: session.id,
            eventType: event.type,
            channelId: undefined,
            timestamp: Date.now(),
          });
          return;
        }

        if (this.mindQueue && session.circuitIndex !== 3) {
          await mintFromLLMResponse(
            this.memoryStore,
            cleanedFinalContent || finalContent,
            mintingConfig,
          );

          if (cleanedFinalContent.length === 0) {
            await this.memoryStore.logInclusion(context.inclusionLog);
            await this.eventBus.publish("session.turn.completed", {
              sessionId: session.id,
              eventType: event.type,
              channelId: undefined,
              timestamp: Date.now(),
            });
            return;
          }

          const currentOutput = this.executor.getOutputChannel(session.id);
          const proposedOutput = currentOutput.channelId
            ? currentOutput
            : await this.executor.ensureOutputChannel(session.id);

          const proposal = this.mindQueue.proposeMessage({
            sessionId: session.id,
            cephalonId: session.cephalonId,
            circuitIndex: session.circuitIndex,
            content: cleanedFinalContent,
            suggestedChannelId: proposedOutput?.channelId ?? undefined,
            suggestedChannelName: proposedOutput?.channelName,
            sourceEventType: event.type,
          });
          console.log(`[TurnProcessor] Queued message proposal ${proposal.id} for ${session.id}`);

          await this.memoryStore.logInclusion(context.inclusionLog);
          await this.eventBus.publish("session.turn.completed", {
            sessionId: session.id,
            eventType: event.type,
            channelId: undefined,
            timestamp: Date.now(),
          });
          return;
        }

        if (isTickEvent) {
          const dedupe = this.outputDedupe.check(finalContent);
          if (dedupe.suppress) {
            console.log(`[TurnProcessor] Suppressing tick output (${dedupe.reason})`);
            await this.memoryStore.logInclusion(context.inclusionLog);
            await this.eventBus.publish("session.turn.completed", {
              sessionId: session.id,
              eventType: event.type,
              channelId: undefined,
              timestamp: Date.now(),
            });
            return;
          }

          if (isProceduralReport(cleanedFinalContent || finalContent)) {
            console.log(`[TurnProcessor] Suppressing tick output (procedural-report)`);
            await this.memoryStore.logInclusion(context.inclusionLog);
            await this.eventBus.publish("session.turn.completed", {
              sessionId: session.id,
              eventType: event.type,
              channelId: undefined,
              timestamp: Date.now(),
            });
            return;
          }
        }

        await mintFromLLMResponse(
          this.memoryStore,
          cleanedFinalContent || finalContent,
          mintingConfig,
        );

        // Output routing.
        // - For live message events, reply into the *same* channel the human used.
        // - For background ticks, use the routed tick channel (plannedTickOutputChannel) unless manually overridden.
        const outputConfig = this.policy.output;
        const currentOutput = this.executor.getOutputChannel(session.id);

        const eventPayload = event.payload as {
          channelId?: string;
          messageId?: string;
          authorId?: string;
          authorIsBot?: boolean;
        };

        const eventChannelId = typeof eventPayload?.channelId === "string" && eventPayload.channelId.trim().length > 0
          ? eventPayload.channelId.trim()
          : undefined;

        const directReplyChannelId = !isTickEvent && (
          event.type === "discord.message.created" || event.type === "discord.message.edited"
        )
          ? eventChannelId
          : undefined;

        const resolvedOutputChannel = isTickEvent
          ? (currentOutput.channelId && currentOutput.mode === "manual"
            ? currentOutput
            : plannedTickOutputChannel)
          : (directReplyChannelId
            ? { channelId: directReplyChannelId }
            : await this.executor.ensureOutputChannel(session.id));

        const targetChannelId = directReplyChannelId
          ?? resolvedOutputChannel?.channelId
          ?? outputConfig?.defaultChannelId;

        if (targetChannelId) {
          // Feedback loop prevention: never suppress a reply just because it's in the same channel.
          // (That would disable all normal conversation.)
          const eventAuthorId = eventPayload?.authorId;
          const isBot = eventPayload?.authorIsBot;

          const shouldSkipOutput =
            // Skip if author is in ignored list
            (eventAuthorId && outputConfig?.ignoredAuthorIds?.includes(eventAuthorId))
            // Skip if bot messages and feedback loop prevention enabled
            || (outputConfig?.preventFeedbackLoops && isBot);

          if (shouldSkipOutput) {
            console.log(
              `[TurnProcessor] Skipping output to ${targetChannelId} (feedback loop prevention)`,
            );
          } else {
            try {
               const sent = await this.executor.sendChatMessage(targetChannelId, cleanedFinalContent || finalContent);
               if (sent?.messageId) {
                 this.executor.recordSpeechMessage(session.id, targetChannelId, sent.messageId);
               } else {
                this.executor.recordSpeech(session.id, targetChannelId);
              }
               if (isTickEvent) {
                 this.outputDedupe.remember(cleanedFinalContent || finalContent);
               }
            } catch (error) {
              const errorMsg =
                error instanceof Error ? error.message : String(error);
              console.error(
                `[TurnProcessor] Failed to send message to channel ${targetChannelId}: ${errorMsg}`,
              );
            }
          }
        }
      }

      // Log inclusion
      await this.memoryStore.logInclusion(context.inclusionLog);

      // Publish turn completed event for proactive behavior tracking
      const channelId =
        event.type.startsWith("discord.") || event.type === "system.proactive"
          ? (event.payload as { channelId?: string }).channelId
          : undefined;

      await this.eventBus.publish("session.turn.completed", {
        sessionId: session.id,
        eventType: event.type,
        channelId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`[TurnProcessor] Error:`, error);
      await this.eventBus.publish("session.turn.error", {
        sessionId: session.id,
        eventType: event.type,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });
    }
  }
}
