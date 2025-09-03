// SPDX-License-Identifier: GPL-3.0-only
import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import { VoiceSession } from "./voice-session";
import { HeartbeatClient } from "../../../../shared/js/heartbeat/index.js";
export function createVoiceService(token = process.env.DISCORD_TOKEN || "") {
  if (!token) {
    throw new Error("DISCORD_TOKEN env required");
  }
  const app = express();
  app.use(express.json());
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });
  let session = null;
  client.once("ready", () => {
    console.log("Voice service logged in");
  });
  app.post("/join", async (req, res) => {
    const { guildId, channelId } = req.body;
    if (!guildId || !channelId)
      return res.status(400).json({ error: "guildId and channelId required" });
    try {
      const guild = await client.guilds.fetch(guildId);
      session = new VoiceSession({ guild, voiceChannelId: channelId });
      session.start();
      return res.json({ status: "ok" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  app.post("/leave", (_req, res) => {
    session?.stop();
    session = null;
    res.json({ status: "ok" });
  });
  async function withUser(id) {
    return client.users.fetch(id);
  }
  app.post("/record/start", async (req, res) => {
    if (!session) return res.status(400).json({ error: "no session" });
    const { userId } = req.body;
    try {
      const user = await withUser(userId);
      await session.addSpeaker(user);
      await session.startSpeakerRecord(user);
      return res.json({ status: "ok" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  app.post("/record/stop", async (req, res) => {
    if (!session) return res.status(400).json({ error: "no session" });
    const { userId } = req.body;
    try {
      const user = await withUser(userId);
      await session.stopSpeakerRecord(user);
      return res.json({ status: "ok" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  app.post("/transcribe/start", async (req, res) => {
    if (!session) return res.status(400).json({ error: "no session" });
    const { userId, log } = req.body;
    try {
      const user = await withUser(userId);
      await session.addSpeaker(user);
      await session.startSpeakerTranscribe(user, Boolean(log));
      return res.json({ status: "ok" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  app.post("/transcribe/stop", async (req, res) => {
    if (!session) return res.status(400).json({ error: "no session" });
    const { userId } = req.body;
    try {
      const user = await withUser(userId);
      await session.stopSpeakerTranscribe(user);
      return res.json({ status: "ok" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  app.post("/speak", async (req, res) => {
    if (!session) return res.status(400).json({ error: "no session" });
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });
    try {
      await session.playVoice(text);
      return res.json({ status: "ok" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
  async function start(port = parseInt(process.env.PORT || "4000")) {
    const hb = new HeartbeatClient();
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
  return { app, client, start, getSession: () => session };
}
if (process.env.NODE_ENV !== "test") {
  createVoiceService()
    .start()
    .catch((err) => {
      console.error("Failed to start voice service", err);
      process.exit(1);
    });
}
//# sourceMappingURL=index.js.map
