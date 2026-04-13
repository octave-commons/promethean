/**
 * Tool Definitions for Cephalon
 * 
 * All tool schemas are separated from implementation code for easier maintenance
 * and to prevent drift between schema definitions and handler implementations.
 */

/**
 * Tool definition interface for LLM tool calling
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<
      string,
      {
        type: string;
        description: string;
        enum?: string[];
      }
    >;
    required: string[];
  };
}

/**
 * Tool registry entry: combines schema (ToolDefinition) with handler
 */
export type ToolRegistryEntry = {
  schema: ToolDefinition;
  handlerName: string;
  description: string;
};

/**
 * All available tool definitions for Cephalon
 */
export const TOOL_DEFINITIONS: Record<string, ToolRegistryEntry> = {
  "memory.lookup": {
    schema: {
      name: "memory.lookup",
      description:
        "Semantic search for memories in the database using a query string. Returns relevant memories with similarity scores. Ask natural language questions.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to find relevant memories",
          },
          limit: {
            type: "number",
            description: "Maximum number of memories to return (default: 5)",
          },
        },
        required: ["query"],
      },
    },
    handlerName: "memoryLookup",
    description: "Search memories in the database",
  },

  "memory.pin": {
    schema: {
      name: "memory.pin",
      description:
        "Pin a memory to keep it in the context window. Use memory.lookup to find memory IDs",
      parameters: {
        type: "object",
        properties: {
          memory_id: {
            type: "string",
            description: "The ID of the memory to pin",
          },
          priority: {
            type: "number",
            description: "Priority level for the pinned memory (default: 10)",
          },
        },
        required: ["memory_id"],
      },
    },
    handlerName: "memoryPin",
    description: "Pin a memory to keep it in context",
  },

  "discord.channel.messages": {
    schema: {
      name: "discord.channel.messages",
      description:
        "Fetch messages from a Discord channel. CRITICAL: Use discord.list.channels FIRST to discover available channels, then fetch with a real channel ID from available_channels.",
      parameters: {
        type: "object",
        properties: {
          channel_id: {
            type: "string",
            description:
              "The Discord channel ID. CRITICAL: Call discord.list.channels FIRST and choose a valid ID from the returned channel list.",
          },
          limit: {
            type: "number",
            description:
              "Maximum number of messages to fetch (default: 50, max: 100)",
          },
          before: {
            type: "string",
            description: "Fetch messages before this message ID",
          },
          after: {
            type: "string",
            description: "Fetch messages after this message ID",
          },
          around: {
            type: "string",
            description: "Fetch messages around this message ID",
          },
        },
        required: ["channel_id"],
      },
    },
    handlerName: "fetchChannelMessages",
    description: "Fetch messages from a Discord channel",
  },

  "discord.channel.scroll": {
    schema: {
      name: "discord.channel.scroll",
      description:
        "Scroll through channel messages (sugar over messages with before=oldest-seen-id). Use discord.list.channels to find a channel",
      parameters: {
        type: "object",
        properties: {
          channel_id: {
            type: "string",
            description: "The Discord channel ID to scroll through",
          },
          oldest_seen_id: {
            type: "string",
            description:
              "The oldest message ID already seen - fetch messages before this",
          },
          limit: {
            type: "number",
            description:
              "Maximum number of messages to fetch (default: 50, max: 100)",
          },
        },
        required: ["channel_id", "oldest_seen_id"],
      },
    },
    handlerName: "scrollChannelMessages",
    description: "Scroll through channel messages",
  },

  "discord.dm.messages": {
    schema: {
      name: "discord.dm.messages",
      description: "Fetch messages from a DM channel with a user",
      parameters: {
        type: "object",
        properties: {
          user_id: {
            type: "string",
            description: "The Discord user ID to open DM with",
          },
          limit: {
            type: "number",
            description:
              "Maximum number of messages to fetch (default: 50, max: 100)",
          },
          before: {
            type: "string",
            description: "Fetch messages before this message ID",
          },
        },
        required: ["user_id"],
      },
    },
    handlerName: "fetchDMMessages",
    description: "Fetch DM messages with a user",
  },

  "discord.search": {
    schema: {
      name: "discord.search",
      description:
        "Search messages in a Discord channel or DM. Supports filtering by query text and user ID. Falls back to client-side filtering if native search unavailable.",
      parameters: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: 'Search scope: "channel" or "dm"',
            enum: ["channel", "dm"],
          },
          channel_id: {
            type: "string",
            description: "Channel ID to search (required if scope=channel)",
          },
          user_id: {
            type: "string",
            description: "User ID for DM search (required if scope=dm)",
          },
          query: {
            type: "string",
            description: "Optional text to search for in message content",
          },
          limit: {
            type: "number",
            description: "Maximum results to return (default: 50, max: 100)",
          },
          before: {
            type: "string",
            description: "Fetch messages before this message ID",
          },
          after: {
            type: "string",
            description: "Fetch messages after this message ID",
          },
        },
        required: ["scope"],
      },
    },
    handlerName: "searchMessages",
    description: "Search messages in Discord",
  },

  "discord.send": {
    schema: {
      name: "discord.send",
      description:
        "Send a message to a Discord channel from discord.list.channels.",
      parameters: {
        type: "object",
        properties: {
          channel_id: {
            type: "string",
            description:
              "The Discord channel ID to send the message to. Obtained from discord.list.channels",
          },
          text: {
            type: "string",
            description: "The message text to send",
          },
          reply_to: {
            type: "string",
            description: "Optional message ID to reply to",
          },
        },
        required: ["channel_id", "text"],
      },
    },
    handlerName: "sendMessage",
    description: "Send a message to a Discord channel",
  },

  "discord.list.servers": {
    schema: {
      name: "discord.list.servers",
      description:
        "List all Discord servers/guilds the bot is a member of. Use this BEFORE discord.list.channels",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handlerName: "listServers",
    description: "List all Discord servers",
  },

  "discord.list.channels": {
    schema: {
      name: "discord.list.channels",
      description: "List all channels in a Discord server/guild",
      parameters: {
        type: "object",
        properties: {
          guild_id: {
            type: "string",
            description: `The Discord guild/server ID to list channels for (optional - if not provided, lists all accessible channels).
              Resolve the guild/server ID with discord.list.servers first.
            `,
          },
        },
        required: [],
      },
    },
    handlerName: "listChannels",
    description: "List channels in a Discord server",
  },

  "get_current_time": {
    schema: {
      name: "get_current_time",
      description: "Get the current timestamp and ISO date",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    handlerName: "getCurrentTime",
    description: "Get current timestamp",
  },
};

/**
 * Get all tool definitions as an array
 */
export function getAllToolDefinitions(): ToolDefinition[] {
  return Object.values(TOOL_DEFINITIONS).map((entry) => entry.schema);
}

/**
 * Get a specific tool definition by name
 */
export function getToolDefinition(name: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS[name]?.schema;
}

/**
 * Get all tool names
 */
export function getAllToolNames(): string[] {
  return Object.keys(TOOL_DEFINITIONS);
}

/**
 * Tool aliases for common typos/variations
 */
export const TOOL_ALIASES: Record<string, string> = {
  "discord.channel.message": "discord.channel.messages",
};
