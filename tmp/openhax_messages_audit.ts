import { Client, GatewayIntentBits } from "discord.js";

type AuditResult = {
  channelId: string;
  channelName?: string;
  guildId?: string;
  botUser: { id: string; tag?: string };
  fetched: number;
  botMessages: number;
  avgBotMessageLength: number;
  maxBotMessageLength: number;
  keywordCounts: Record<string, number>;
  examples: Array<{ id: string; createdAt: string; length: number; preview: string }>;
};

function getToken(): string {
  const token =
    process.env.OPENHAX_DISCORD_TOKEN ||
    process.env.DISCORD_BOT_TOKEN ||
    process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error(
      "Missing Discord token. Set OPENHAX_DISCORD_TOKEN (preferred) or DISCORD_TOKEN.",
    );
  }
  return token;
}

function countKeywords(text: string, keywords: string[]): Record<string, number> {
  const lower = text.toLowerCase();
  const out: Record<string, number> = {};
  for (const kw of keywords) {
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "g");
    out[kw] = (lower.match(re) || []).length;
  }
  return out;
}

function truncate(text: string, max = 220): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1) + "…";
}

async function main() {
  const channelId = process.argv[2] || "1486614671850209330"; // #openhax
  const limit = Number(process.argv[3] || "60");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  await client.login(getToken());
  await new Promise<void>((resolve) => client.once("ready", () => resolve()));

  const botId = client.user?.id;
  if (!botId) throw new Error("Bot user id missing after login");

  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) {
    throw new Error(`Channel not found or not text-based guild channel: ${channelId}`);
  }

  // @ts-expect-error discord.js typing: text-based channels expose messages
  const messages = await channel.messages.fetch({ limit: Math.min(limit, 100) });
  const all = Array.from(messages.values());

  const mine = all
    .filter((m) => m.author?.id === botId)
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const targetKeywords = [
    "circuit",
    "circuits",
    "field",
    "pulse",
    "warm",
    "cool",
    "temperature",
    "emotional",
    "analysis",
    "analyzing",
    "metacognition",
    "mode",
  ];

  let totalLen = 0;
  let maxLen = 0;
  const keywordCounts: Record<string, number> = Object.fromEntries(
    targetKeywords.map((k) => [k, 0]),
  );

  for (const m of mine) {
    const len = (m.content || "").length;
    totalLen += len;
    maxLen = Math.max(maxLen, len);
    const counts = countKeywords(m.content || "", targetKeywords);
    for (const [k, v] of Object.entries(counts)) keywordCounts[k] += v;
  }

  const examples = mine
    .slice(-8)
    .reverse()
    .map((m) => ({
      id: m.id,
      createdAt: m.createdAt.toISOString(),
      length: (m.content || "").length,
      preview: truncate(m.content || ""),
    }));

  const result: AuditResult = {
    channelId,
    channelName: "name" in channel ? (channel.name as string) : undefined,
    guildId: channel.guildId || undefined,
    botUser: { id: botId, tag: client.user?.tag },
    fetched: all.length,
    botMessages: mine.length,
    avgBotMessageLength: mine.length ? Math.round(totalLen / mine.length) : 0,
    maxBotMessageLength: maxLen,
    keywordCounts,
    examples,
  };

  // Intentionally print ONLY bot-authored previews.
  console.log(JSON.stringify(result, null, 2));

  client.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
