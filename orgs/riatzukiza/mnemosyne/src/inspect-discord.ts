#!/usr/bin/env node

/**
 * Discord surface inspector (no LLM required)
 *
 * Usage (from packages/cephalon-ts):
 *   pnpm inspect:discord
 *   pnpm inspect:discord -- --bots duck,openhax,openskull
 *   pnpm inspect:discord -- --bot duck --all-channels
 *   pnpm inspect:discord -- --bot openhax --guild-id <guildId>
 */

import { once } from "node:events";
import { setTimeout as sleep } from "node:timers/promises";

import { Client, Events, GatewayIntentBits } from "discord.js";
import { DiscordApiClient } from "./discord/api-client.js";
import { getBotConfig } from "./config/bots.js";
import { loadDefaultPolicy } from "./config/policy.js";

type InspectOptions = {
  bots: string[];
  guildId?: string;
  allChannels: boolean;
  json: boolean;
  timeoutMs: number;
};

function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function printHelp(): void {
  // Intentionally plain text so it can be copy/pasted into shells.
  // Keep args stable; scripts may depend on them.
  // eslint-disable-next-line no-console
  console.log(`cephalon-ts: inspect Discord surface\n\nUsage:\n  pnpm inspect:discord\n  pnpm inspect:discord -- --bots duck,openhax,openskull\n  pnpm inspect:discord -- --bot duck\n\nOptions:\n  --bots <a,b,c>      Inspect multiple bot ids (default: duck,openhax,openskull)\n  --bot <id>          Inspect a single bot id (overrides --bots)\n  --guild-id <id>     Restrict channel listing to a single guild/server\n  --all-channels      Print all accessible text channels (can be noisy)\n  --json              Emit machine-readable JSON\n  --timeout-ms <n>    Ready/login timeout (default: 20000)\n  -h, --help          Show help\n\nNotes:\n- Tokens are read ONLY from env; values are never printed.\n- Token resolution follows src/config/bots.ts (per-bot env + legacy aliases + DISCORD_TOKEN fallbacks).\n`);
}

function parseArgs(argv: string[]): InspectOptions {
  const opts: InspectOptions = {
    bots: ["duck", "openhax", "openskull"],
    allChannels: false,
    json: false,
    timeoutMs: 20_000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--") {
      // Some runners (pnpm -> tsx) may forward the argument separator.
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (arg === "--bots") {
      const raw = argv[i + 1];
      if (!raw) throw new Error("--bots requires a value");
      opts.bots = parseCommaList(raw);
      i += 1;
      continue;
    }

    if (arg === "--bot") {
      const raw = argv[i + 1];
      if (!raw) throw new Error("--bot requires a value");
      opts.bots = [raw.trim()].filter(Boolean);
      i += 1;
      continue;
    }

    if (arg === "--guild-id" || arg === "--guild") {
      const raw = argv[i + 1];
      if (!raw) throw new Error(`${arg} requires a value`);
      opts.guildId = raw.trim();
      i += 1;
      continue;
    }

    if (arg === "--all-channels" || arg === "--all") {
      opts.allChannels = true;
      continue;
    }

    if (arg === "--json") {
      opts.json = true;
      continue;
    }

    if (arg === "--timeout-ms") {
      const raw = argv[i + 1];
      if (!raw) throw new Error("--timeout-ms requires a value");
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`--timeout-ms must be a positive number, got: ${raw}`);
      }
      opts.timeoutMs = parsed;
      i += 1;
      continue;
    }

    throw new Error(`Unknown arg: ${arg}`);
  }

  return opts;
}

function resolveTokenWithSource(botId: string): { token?: string; sourceEnv?: string } {
  const bot = getBotConfig(botId);
  const env = process.env;

  const candidates: Array<{ name: string; value: string | undefined }> = [
    { name: bot.discordTokenEnv, value: env[bot.discordTokenEnv] },
  ];

  // Keep these aliases consistent with resolveDiscordToken() in src/config/bots.ts
  if (bot.id === "openskull") {
    candidates.push({ name: "OPEN_SKULL_DISCORD_TOKEN", value: env.OPEN_SKULL_DISCORD_TOKEN });
  }
  if (bot.id === "error") {
    candidates.push({ name: "DISCORD_ERROR_BOT_TOKEN", value: env.DISCORD_ERROR_BOT_TOKEN });
  }

  candidates.push({ name: "DISCORD_BOT_TOKEN", value: env.DISCORD_BOT_TOKEN });
  candidates.push({ name: "DISCORD_TOKEN", value: env.DISCORD_TOKEN });

  const hit = candidates.find((c) => typeof c.value === "string" && c.value.length > 0);
  return { token: hit?.value, sourceEnv: hit?.name };
}

async function waitForReady(client: Client, timeoutMs: number): Promise<void> {
  await Promise.race([
    once(client, Events.ClientReady).then(() => void 0),
    sleep(timeoutMs).then(() => {
      throw new Error(`Timed out waiting for Discord ready (${timeoutMs}ms)`);
    }),
  ]);
}

async function inspectOneBot(botId: string, options: InspectOptions): Promise<unknown> {
  const bot = getBotConfig(botId);
  const policy = loadDefaultPolicy();
  const forcedChannelIds = Object.keys(policy.channels ?? {});
  const { token, sourceEnv } = resolveTokenWithSource(botId);

  if (!token) {
    return {
      botId,
      cephalonId: bot.cephalonId,
      ok: false,
      error: `No Discord token found for bot '${botId}'. Expected env: ${bot.discordTokenEnv}`,
      tokenSourceEnv: sourceEnv ?? null,
    };
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  try {
    await Promise.race([
      client.login(token),
      sleep(options.timeoutMs).then(() => {
        throw new Error(`Timed out waiting for Discord login (${options.timeoutMs}ms)`);
      }),
    ]);
    await waitForReady(client, options.timeoutMs);

    const api = new DiscordApiClient({ token });
    api.setClient(client);

    const servers = await api.listServers();
    const channels = await api.listChannels(options.guildId);
    const channelById = new Map(channels.channels.map((c) => [c.id, c] as const));

    const forcedChannels = forcedChannelIds.map((channelId) => {
      const policyCfg = policy.channels[channelId];
      const accessible = channelById.get(channelId);
      return {
        id: channelId,
        policyName: policyCfg?.name ?? null,
        accessible: Boolean(accessible),
        observedName: accessible?.name ?? null,
        guildId: accessible?.guildId ?? null,
        type: accessible?.type ?? null,
      };
    });

    const defaultOutputChannelId = bot.defaultOutputChannelId ?? null;
    const defaultOutput = defaultOutputChannelId
      ? channelById.get(defaultOutputChannelId) ?? null
      : null;

    return {
      botId,
      cephalonId: bot.cephalonId,
      tokenSourceEnv: sourceEnv ?? null,
      discordUser: {
        id: client.user?.id ?? null,
        tag: client.user?.tag ?? null,
      },
      guilds: servers,
      channels: options.allChannels ? channels : { count: channels.count, channels: [] },
      forcedChannels,
      defaultOutputChannel: {
        id: defaultOutputChannelId,
        accessible: Boolean(defaultOutput),
        observed: defaultOutput,
      },
      ok: true,
    };
  } finally {
    try {
      client.destroy();
    } catch {
      // ignore
    }
  }
}

function renderHuman(result: any): void {
  // eslint-disable-next-line no-console
  console.log(`\n=== ${result.cephalonId} (${result.botId}) ===`);

  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.log(`token: missing (expected ${result.tokenSourceEnv ?? "<unknown>"})`);
    // eslint-disable-next-line no-console
    console.log(`error: ${result.error}`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`token: ok (from ${result.tokenSourceEnv ?? "<unknown>"})`);
  // eslint-disable-next-line no-console
  console.log(`discord user: ${result.discordUser.tag ?? "<unknown>"} (${result.discordUser.id ?? "?"})`);
  // eslint-disable-next-line no-console
  console.log(`guilds: ${result.guilds.count}`);
  // eslint-disable-next-line no-console
  console.log(`channels: ${result.channels.count}`);

  const defaultOut = result.defaultOutputChannel;
  if (defaultOut?.id) {
    // eslint-disable-next-line no-console
    console.log(
      `default output channel: ${defaultOut.id} (${defaultOut.accessible ? `ok: #${defaultOut.observed?.name ?? "?"}` : "MISSING"})`,
    );
  } else {
    // eslint-disable-next-line no-console
    console.log("default output channel: <unset>");
  }

  // eslint-disable-next-line no-console
  console.log("forced/special channels (policy.channels):");
  for (const ch of result.forcedChannels as Array<any>) {
    const name = ch.observedName ?? ch.policyName ?? "?";
    const status = ch.accessible ? "ok" : "MISSING";
    // eslint-disable-next-line no-console
    console.log(`  - ${status}\t${ch.id}\t#${name}`);
  }

  if (result.channels.channels?.length) {
    // eslint-disable-next-line no-console
    console.log("\nall accessible channels:");
    for (const ch of result.channels.channels as Array<any>) {
      // eslint-disable-next-line no-console
      console.log(`  - ${ch.guildId}\t${ch.id}\t#${ch.name}\t(type=${ch.type})`);
    }
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const results: unknown[] = [];

  for (const botId of options.bots) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await inspectOneBot(botId, options);
      results.push(result);
    } catch (err) {
      results.push({
        botId,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (options.json) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ results }, null, 2));
    return;
  }

  for (const result of results as any[]) {
    renderHuman(result);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[inspect-discord] fatal:", err);
  process.exit(1);
});
