import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { ChatBridgeService } from "./service.js";

function textResult(value: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  };
}

export function createChatBridgeMcpServer(service: ChatBridgeService): McpServer {
  const server = new McpServer({ name: "chat-bridge-mcp", version: "0.1.0" });

      server.registerResource(
        "chat-platforms",
        "chat://platforms",
        {
          title: "Chat Platforms",
          description: "Registered chat adapters exposed by the bridge",
          mimeType: "application/json",
        },
        async () => ({ contents: [await service.readResource("chat://platforms")] }),
      );

      server.registerResource(
        "chat-workspaces-irc",
        "chat://workspaces/irc",
        {
          title: "IRC Workspaces",
          description: "Normalized workspaces for the IRC adapter",
          mimeType: "application/json",
        },
        async () => ({ contents: [await service.readResource("chat://workspaces/irc")] }),
      );

      server.registerResource(
        "chat-capabilities-irc",
        "chat://capabilities/irc",
        {
          title: "IRC Capabilities",
          description: "Feature flags for the IRC adapter",
          mimeType: "application/json",
        },
        async () => ({ contents: [await service.readResource("chat://capabilities/irc")] }),
      );

      server.registerResource(
        "chat-conversations",
        new ResourceTemplate("chat://conversations/irc/{workspaceId}", {
          list: async () => ({ resources: await service.listConversationResourceUris() }),
        }),
        {
          title: "Conversations",
          description: "Normalized conversation listings for a workspace",
          mimeType: "application/json",
        },
        async (uri) => ({ contents: [await service.readResource(uri.href)] }),
      );

      server.registerResource(
        "chat-message-window",
        new ResourceTemplate("chat://messages/irc/{workspaceId}/{conversationId}", {
          list: async () => ({ resources: await service.listMessageWindowUris() }),
        }),
        {
          title: "Recent Messages",
          description: "Recent read-only message window for a conversation",
          mimeType: "application/json",
        },
        async (uri) => ({ contents: [await service.readResource(uri.href)] }),
      );

      server.registerResource(
        "chat-message",
        new ResourceTemplate("chat://message/irc/{workspaceId}/{conversationId}/{messageId}", {
          list: async () => ({ resources: await service.listMessageUris() }),
        }),
        {
          title: "Message",
          description: "One normalized message with metadata",
          mimeType: "application/json",
        },
        async (uri) => ({ contents: [await service.readResource(uri.href)] }),
      );

      server.registerTool(
        "chat.list_conversations",
        {
          description: "List normalized chat conversations across registered adapters",
          inputSchema: {
            platform: z.enum(["irc", "discord", "slack"]).optional(),
            workspaceId: z.string().optional(),
            kind: z.enum(["channel", "dm", "thread"]).optional(),
            limit: z.number().int().positive().max(200).optional(),
          },
          annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
        },
        async ({ platform, workspaceId, kind, limit }) => textResult(
          await service.listConversations({ platform, workspaceId, kind, limit }),
        ),
      );

      server.registerTool(
        "chat.read_messages",
        {
          description: "Read a normalized recent message window from a conversation",
          inputSchema: {
            conversationRef: z.string(),
            before: z.string().optional(),
            limit: z.number().int().positive().max(200).optional(),
            includeReplies: z.boolean().optional(),
          },
          annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
        },
        async ({ conversationRef, before, limit, includeReplies }) => textResult(
          await service.readMessages({ conversationRef, before, limit, includeReplies }),
        ),
      );

      server.registerTool(
        "chat.send_message",
        {
          description: "Send a message to a normalized conversation reference",
          inputSchema: {
            conversationRef: z.string(),
            text: z.string().min(1).max(2000),
            suppressMentions: z.boolean().optional(),
          },
          annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
        },
        async ({ conversationRef, text, suppressMentions }) => textResult(
          await service.sendMessage({ conversationRef, text, suppressMentions }),
        ),
      );

      server.registerTool(
        "chat.reply_message",
        {
          description: "Reply to a message ref, using native replies where available and graceful fallback elsewhere",
          inputSchema: {
            messageRef: z.string(),
            text: z.string().min(1).max(2000),
            suppressMentions: z.boolean().optional(),
          },
          annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
        },
        async ({ messageRef, text, suppressMentions }) => textResult(
          await service.replyMessage({ messageRef, text, suppressMentions }),
        ),
      );

      server.registerTool(
        "chat.get_members",
        {
          description: "List normalized members for a conversation",
          inputSchema: {
            conversationRef: z.string(),
            limit: z.number().int().positive().max(500).optional(),
          },
          annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
        },
        async ({ conversationRef, limit }) => {
          const members = await service.getMembers(conversationRef);
          return textResult(typeof limit === "number" ? members.slice(0, limit) : members);
        },
      );

      server.registerTool(
        "chat.get_capabilities",
        {
          description: "Return platform or conversation capability flags for replies, threads, reactions, attachments, and edits",
          inputSchema: {
            platform: z.enum(["irc", "discord", "slack"]).optional(),
            conversationRef: z.string().optional(),
          },
          annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
        },
        async ({ platform, conversationRef }) => textResult(
          await service.getCapabilities(conversationRef || platform),
        ),
      );

      server.registerPrompt(
        "summarize-channel",
        {
          title: "Summarize Channel",
          description: "Summarize a recent channel window before taking action",
          argsSchema: {
            conversationRef: z.string(),
            windowSize: z.string().optional(),
          },
        },
        ({ conversationRef, windowSize }) => ({
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Use chat.read_messages for ${conversationRef} with limit ${windowSize || "50"}, then summarize the recent window, main motifs, open questions, and likely next actions.`,
              },
            },
          ],
        }),
      );

      server.registerPrompt(
        "draft-reply",
        {
          title: "Draft Reply",
          description: "Read recent context and prepare a reply without sending it",
          argsSchema: {
            messageRef: z.string(),
            tone: z.string().optional(),
          },
        },
        ({ messageRef, tone }) => ({
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Inspect ${messageRef}, fetch surrounding context with chat.read_messages, and draft a reply in tone ${JSON.stringify(tone || "calm, useful, concise")} without calling chat.send_message.`,
              },
            },
          ],
        }),
      );

      server.registerPrompt(
        "moderation-review",
        {
          title: "Moderation Review",
          description: "Inspect a recent channel window for abuse, escalation, or policy issues",
          argsSchema: {
            conversationRef: z.string(),
            windowSize: z.string().optional(),
          },
        },
        ({ conversationRef, windowSize }) => ({
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Use chat.read_messages on ${conversationRef} with limit ${windowSize || "100"}, then highlight moderation risks, harassment, spam, or operational anomalies.`,
              },
            },
          ],
        }),
      );

      server.registerPrompt(
        "handoff-brief",
        {
          title: "Handoff Brief",
          description: "Produce a compact state handoff rooted in chat resources rather than raw payloads",
          argsSchema: {
            conversationRef: z.string(),
          },
        },
        ({ conversationRef }) => ({
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Build a handoff brief for ${conversationRef}. Reference the relevant chat://messages and chat://message resources and summarize participants, active topics, and pending replies.`,
              },
            },
          ],
        }),
      );

  return server;
}
