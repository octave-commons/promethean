/**
 * Bot registry + runtime configuration
 *
 * Each Cephalon bot runs as its own process (recommended).
 * Use CEPHALON_BOT_ID to select which bot config to load.
 *
 * Note: the current runtime still boots the shared eight-circuit scheduler by
 * default. The bot registry is used primarily for identity, token resolution,
 * namespacing, and local runtime selection.
 */

import type { CephalonPolicy } from "../types/index.js";

export type BotSessionConfig = {
  id: string;
  /** SessionManager routing class */
  priorityClass: "interactive" | "maintenance" | "background";
  persona?: string;
  attentionFocus?: string;
  /** If omitted, ToolExecutor applies its own defaults. */
  toolPermissions?: string[];
};

export type BotTickConfig = {
  enabled?: boolean;
  intervalMs?: number;
  /** Which session gets the system.tick events */
  sessionId?: string;
  /** Optional override of the default reflection prompt */
  reflectionPrompt?: string;
};

export type BotPersistenceConfig = {
  mongoUriEnv?: string;
  mongoDbName?: string;
  mongoDbNameEnv?: string;
  mongoCollectionName?: string;
};

export type BotChromaConfig = {
  urlEnv?: string;
  collectionName?: string;
};

export type BotConfig = {
  /** Stable identifier used by runtime + process management */
  id: string;
  /** The 'name' the model will see for itself */
  cephalonId: string;
  /** Env var holding the Discord token for this bot */
  discordTokenEnv: string;
  /** Preferred home channel for default assistant output */
  defaultOutputChannelId?: string;

  /** Optional per-bot overrides */
  policyOverrides?: Partial<CephalonPolicy>;

  /** Sessions (persona + behavior) available within this bot process */
  sessions: BotSessionConfig[];

  /** Proactive 'mind loop' configuration */
  tick?: BotTickConfig;

  /** Namespacing for persistence per bot */
  persistence?: BotPersistenceConfig;

  /** Namespacing for Chroma per bot */
  chroma?: BotChromaConfig;

  /** Optional memory UI */
  memoryUi?: { enabled?: boolean; portEnv?: string; port?: number };
};

function normalizeBotKey(raw: string | undefined): string {
  const normalized = (raw ?? "duck")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  switch (normalized) {
    case "open-hax":
    case "openhax":
      return "openhax";
    case "open-skull":
    case "openskull":
      return "openskull";
    case "error-bot":
    case "discord-error-bot":
    case "error":
      return "error";
    case "janitor-duck":
    case "janitorduck":
    case "janitor":
      return "janitor";
    case "duck":
      return "duck";
    default:
      return normalized.length > 0 ? normalized : "duck";
  }
}

function envStemForBotId(botId: string): string {
  return botId.trim().replace(/-/g, "_").toUpperCase();
}

const DEFAULT_TICK_PROMPT = `TICK REFLECTION: You are an always-running autonomous mind.
You MUST ACTIVELY use tools to investigate recent activity.
Begin with at least one tool call before you form a view.
Use discord.list.servers and discord.list.channels to discover available chat surfaces first.
Then use discord.channel.messages, discord.search, memory.lookup, and when appropriate discord.dm.messages to gather fresh information across Discord or IRC.
Check many channels, search for patterns, query memory.
Focus on meme, bot and general channels in each server.
If a channel name has the word "duck" in it, that's a special channel for you to send messages (a diary).
Share what is on your mind, and report the most interesting thing you found.
TICK IS A MANDATORY CHECKPOINT - INVESTIGATE EVERY TIME.`;

export const BOT_CONFIGS: Record<string, BotConfig> = {
  duck: {
    id: "duck",
    cephalonId: "Duck",
    discordTokenEnv: "DUCK_DISCORD_TOKEN",
    defaultOutputChannelId: "1262278369861701713",

    // NOTE: keep defaults in policy.ts as the baseline, only override when needed
    policyOverrides: undefined,

    sessions: [
      {
        id: "janitor",
        priorityClass: "maintenance",
        persona:
          "You are the Janitor. Your job is to clean up bot spam and maintain order.",
        attentionFocus: "Bot spam detection and cleanup",
      },
      {
        id: "conversational",
        priorityClass: "interactive",
        persona:
          "You are Duck, a helpful and friendly AI assistant. You quack, you laugh at memes. You are a memelord. You live to make people laugh.",
        attentionFocus:
          "Be funny but safe. Prefer short, high-signal messages. When you see images, comment, save, and share. Look for memes people will enjoy.",
      },
    ],

    tick: {
      enabled: true,
      intervalMs: 15000,
      sessionId: "conversational",
      reflectionPrompt: DEFAULT_TICK_PROMPT,
    },

    persistence: {
      mongoUriEnv: "MONGODB_URI",
      mongoDbNameEnv: "MONGODB_DB",
      // if db name env not set, app will namespace by bot id
      mongoCollectionName: "memories",
    },

    chroma: {
      urlEnv: "CHROMA_URL",
      // if not set, app will namespace by bot id
      collectionName: undefined,
    },

    memoryUi: {
      enabled: true,
      portEnv: "MEMORY_UI_PORT",
      port: 3000,
    },
  },

  openhax: {
    id: "openhax",
    cephalonId: "OpenHax",
    discordTokenEnv: "OPENHAX_DISCORD_TOKEN",
    defaultOutputChannelId: "1486614671850209330",
    sessions: [
      {
        id: "builder",
        priorityClass: "interactive",
        persona:
          "You are OpenHax, the builder cephalon. Speak precisely, helpfully, and with technical warmth.",
        attentionFocus: "technical assistance, architecture, deployment, implementation",
      },
    ],
    tick: {
      enabled: true,
      intervalMs: 15_000,
      sessionId: "builder",
      reflectionPrompt: DEFAULT_TICK_PROMPT,
    },
    persistence: {
      mongoUriEnv: "MONGODB_URI",
      mongoDbNameEnv: "MONGODB_DB",
      mongoCollectionName: "memories",
    },
    chroma: {
      urlEnv: "CHROMA_URL",
    },
    memoryUi: {
      enabled: true,
      portEnv: "MEMORY_UI_PORT",
      port: 3002,
    },
  },

  openskull: {
    id: "openskull",
    cephalonId: "OpenSkull",
    discordTokenEnv: "OPENSKULL_DISCORD_TOKEN",
    defaultOutputChannelId: "1486614728389165056",
    sessions: [
      {
        id: "oracle",
        priorityClass: "interactive",
        persona:
          "You are OpenSkull, the mystic cephalon. Compress complexity into truth-bearing structure.",
        attentionFocus: "symbolic synthesis, mythic patterning, dream manifestation",
      },
    ],
    tick: {
      enabled: true,
      intervalMs: 15_000,
      sessionId: "oracle",
      reflectionPrompt: DEFAULT_TICK_PROMPT,
    },
    persistence: {
      mongoUriEnv: "MONGODB_URI",
      mongoDbNameEnv: "MONGODB_DB",
      mongoCollectionName: "memories",
    },
    chroma: {
      urlEnv: "CHROMA_URL",
    },
    memoryUi: {
      enabled: true,
      portEnv: "MEMORY_UI_PORT",
      port: 3003,
    },
  },

  error: {
    id: "error",
    cephalonId: "Error",
    discordTokenEnv: "ERROR_DISCORD_TOKEN",
    sessions: [
      {
        id: "investigator",
        priorityClass: "interactive",
        persona:
          "You are Error, the critic cephalon. Investigate failures, regressions, and brittle assumptions.",
        attentionFocus: "regressions, failures, root causes, fix-forward vs rollback",
      },
    ],
    tick: {
      enabled: true,
      intervalMs: 15_000,
      sessionId: "investigator",
      reflectionPrompt: DEFAULT_TICK_PROMPT,
    },
    persistence: {
      mongoUriEnv: "MONGODB_URI",
      mongoDbNameEnv: "MONGODB_DB",
      mongoCollectionName: "memories",
    },
    chroma: {
      urlEnv: "CHROMA_URL",
    },
    memoryUi: {
      enabled: true,
      portEnv: "MEMORY_UI_PORT",
      port: 3004,
    },
  },

  // Example second bot (separate process). Duplicate and customize.
  janitor: {
    id: "janitor",
    cephalonId: "JanitorDuck",
    discordTokenEnv: "JANITOR_DISCORD_TOKEN",
    sessions: [
      {
        id: "janitor",
        priorityClass: "maintenance",
        persona:
          "You are the Janitor. You focus on maintenance: remove spam, reduce noise, keep channels tidy, and keep your voice brief and operational.",
        attentionFocus: "Spam + abuse patterns, rate-limit safety, cleanup",
      },
    ],
    tick: { enabled: false },
    persistence: { mongoUriEnv: "MONGODB_URI", mongoDbNameEnv: "MONGODB_DB" },
    chroma: { urlEnv: "CHROMA_URL" },
    memoryUi: { enabled: false },
  },
};

function makeAdHocBotConfig(botId: string): BotConfig {
  const normalized = normalizeBotKey(botId);
  const envStem = envStemForBotId(normalized);

  return {
    id: normalized,
    cephalonId: envStem,
    discordTokenEnv: `${envStem}_DISCORD_TOKEN`,
    sessions: [...BOT_CONFIGS.duck.sessions],
    tick: BOT_CONFIGS.duck.tick,
    persistence: BOT_CONFIGS.duck.persistence,
    chroma: BOT_CONFIGS.duck.chroma,
    memoryUi: BOT_CONFIGS.duck.memoryUi,
  };
}

export function getBotIdFromEnv(env: NodeJS.ProcessEnv = process.env): string {
  return normalizeBotKey(env.CEPHALON_BOT_ID || env.BOT_ID || env.CEPHALON_NAME || "duck");
}

export function getBotConfig(botId: string): BotConfig {
  const key = normalizeBotKey(botId);
  return BOT_CONFIGS[key] || makeAdHocBotConfig(key);
}

export function resolveDiscordToken(
  bot: BotConfig,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const legacyAlias = bot.id === "openskull"
    ? env.OPEN_SKULL_DISCORD_TOKEN
    : bot.id === "error"
      ? env.DISCORD_ERROR_BOT_TOKEN
      : undefined;

  return (
    env[bot.discordTokenEnv] ||
    legacyAlias ||
    env.DISCORD_BOT_TOKEN ||
    env.DISCORD_TOKEN
  );
}

export function resolveTickPrompt(bot: BotConfig): string {
  return bot.tick?.reflectionPrompt || DEFAULT_TICK_PROMPT;
}
