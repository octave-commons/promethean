import { Server } from "http";

import express, { Application } from "express";
import { Client, GatewayIntentBits, User } from "discord.js";

import { VoiceSession } from "./voice-session.js";

const heartbeatFallback = new URL(
  "../../legacy/heartbeat/index.js",
  import.meta.url,
).href;

async function importHeartbeat(): Promise<{
  readonly HeartbeatClient: new (...args: readonly unknown[]) => {
    sendOnce(): Promise<void>;
    start(): void;
  };
}> {
  const specifiers = [
    process.env.VOICE_HEARTBEAT_MODULE,
    "@promethean/legacy/heartbeat/index.js",
    heartbeatFallback,
  ] as const;
  let lastError: Error | undefined;
  for (const spec of specifiers) {
    if (!spec) continue;
    try {
      return (await import(spec)) as {
        readonly HeartbeatClient: new (...args: readonly unknown[]) => {
          sendOnce(): Promise<void>;
          start(): void;
        };
      };
    } catch (err) {
      const error = err as Error & { readonly code?: string };
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("Unable to resolve heartbeat module");
}

function setupDiscordClient(): Client {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });
  client.once("ready", () => {
    console.log("Voice service logged in");
  });
  return client;
}

type SessionRef = { session: VoiceSession | null };
type WithUser = (id: string) => Promise<User>;

function registerJoinRoute(
  app: Application,
  client: Client,
  ctx: SessionRef,
): void {
  app.post("/join", async (req, res) => {
    const { guildId, channelId } = req.body as Record<string, unknown>;
    if (typeof guildId !== "string" || typeof channelId !== "string") {
      return res.status(400).json({ error: "guildId and channelId required" });
    }
    try {
      const guild = await client.guilds.fetch(guildId);
      ctx.session = new VoiceSession({ guild, voiceChannelId: channelId });
      ctx.session.start();
      return res.json({ status: "ok" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return res.status(500).json({ error: message });
    }
  });
}

async function handleLeave(ctx: SessionRef): Promise<void> {
  await ctx.session?.stop();
  ctx.session = null;
}

function registerLeaveRoute(app: Application, ctx: SessionRef): void {
  app.post("/leave", async (_req, res) => {
    await handleLeave(ctx);
    res.json({ status: "ok" });
  });
}

function registerRecordRoutes(
  app: Application,
  withUser: WithUser,
  ctx: SessionRef,
): void {
  app.post("/record/start", async (req, res) => {
    if (!ctx.session) return res.status(400).json({ error: "no session" });
    const { userId } = req.body as Record<string, unknown>;
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "userId required" });
    }
    try {
      const user = await withUser(userId);
      await ctx.session.addSpeaker(user);
      await ctx.session.startSpeakerRecord(user);
      return res.json({ status: "ok" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return res.status(500).json({ error: message });
    }
  });

  app.post("/record/stop", async (req, res) => {
    if (!ctx.session) return res.status(400).json({ error: "no session" });
    const { userId } = req.body as Record<string, unknown>;
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "userId required" });
    }
    try {
      const user = await withUser(userId);
      await ctx.session.stopSpeakerRecord(user);
      return res.json({ status: "ok" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return res.status(500).json({ error: message });
    }
  });
}

function registerTranscribeRoutes(
  app: Application,
  withUser: WithUser,
  ctx: SessionRef,
): void {
  app.post("/transcribe/start", async (req, res) => {
    if (!ctx.session) return res.status(400).json({ error: "no session" });
    const { userId, log } = req.body as Record<string, unknown>;
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "userId required" });
    }
    try {
      const user = await withUser(userId);
      await ctx.session.addSpeaker(user);
      await ctx.session.startSpeakerTranscribe(user, Boolean(log));
      return res.json({ status: "ok" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return res.status(500).json({ error: message });
    }
  });

  app.post("/transcribe/stop", async (req, res) => {
    if (!ctx.session) return res.status(400).json({ error: "no session" });
    const { userId } = req.body as Record<string, unknown>;
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "userId required" });
    }
    try {
      const user = await withUser(userId);
      await ctx.session.stopSpeakerTranscribe(user);
      return res.json({ status: "ok" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return res.status(500).json({ error: message });
    }
  });
}

function registerSpeakRoute(app: Application, ctx: SessionRef): void {
  app.post("/speak", async (req, res) => {
    if (!ctx.session) return res.status(400).json({ error: "no session" });
    const { text } = req.body as Record<string, unknown>;
    if (typeof text !== "string") {
      return res.status(400).json({ error: "text required" });
    }
    try {
      await ctx.session.playVoice(text);
      return res.json({ status: "ok" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return res.status(500).json({ error: message });
    }
  });
}

function registerRoutes(
  app: Application,
  client: Client,
  ctx: SessionRef,
): void {
  const withUser: WithUser = (id) => client.users.fetch(id);
  registerJoinRoute(app, client, ctx);
  registerLeaveRoute(app, ctx);
  registerRecordRoutes(app, withUser, ctx);
  registerTranscribeRoutes(app, withUser, ctx);
  registerSpeakRoute(app, ctx);
}

export type VoiceService = {
  readonly app: Application;
  readonly client: Client;
  readonly start: (port?: number) => Promise<Server>;
  readonly getSession: () => VoiceSession | null;
};

export function createVoiceService(
  token: string = process.env.DISCORD_TOKEN || "",
): VoiceService {
  if (!token) {
    throw new Error("DISCORD_TOKEN env required");
  }

  const app: Application = express();
  app.use(express.json());

  const client = setupDiscordClient();

  const ctx: { session: VoiceSession | null } = { session: null };

  registerRoutes(app, client, ctx);

  async function start(
    port: number = parseInt(process.env.PORT || "4000", 10),
  ): Promise<Server> {
    const { HeartbeatClient } = await importHeartbeat();
    const hb = new HeartbeatClient({
      name: process.env.name || "voice-service",
    });
    await hb.sendOnce();
    hb.start();
    await client.login(token);
    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        console.log(`voice service listening on ${port}`);
        resolve(server);
      });
    });
  }

  return { app, client, start, getSession: () => ctx.session };
}

if (process.env.NODE_ENV !== "test") {
  createVoiceService()
    .start()
    .catch((err: unknown) => {
      if (err instanceof Error) {
        console.error("Failed to start voice service", err);
      } else {
        console.error("Failed to start voice service", String(err));
      }
      process.exit(1);
    });
}
