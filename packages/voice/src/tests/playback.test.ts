import type { Server } from "http";
import type { AddressInfo } from "node:net";
import { PassThrough } from "stream";

import test from "ava";
import type { Guild, User } from "discord.js";
import type { AudioPlayer } from "@discordjs/voice";

if (process.env.SKIP_NETWORK_TESTS === "1") {
  test("voice playback network tests skipped in sandbox", (t) => t.pass());
} else {
  test("speak endpoint plays voice", async (t) => {
    const { createVoiceService } = await import("../index.js");
    const service = createVoiceService("tok");
    // stub guild and user fetching
    const fetchGuildStub = async (id: string): Promise<Guild> =>
      ({ id, voiceAdapterCreator: {} }) as unknown as Guild;
    service.client.guilds.fetch =
      fetchGuildStub as typeof service.client.guilds.fetch;
    const fetchUserStub = async (id: string): Promise<User> =>
      ({ id, username: "bob" }) as unknown as User;
    service.client.users.fetch =
      fetchUserStub as typeof service.client.users.fetch;

    const server: Server = await service.start(0);
    const port = (server.address() as AddressInfo).port;

    await fetch(`http://localhost:${port}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId: "1", channelId: "10" }),
    });

    const session = service.getSession();
    if (!session) {
      t.fail("session not created");
      return;
    }

    session.voiceSynth.generateAndUpsampleVoice = async () => {
      const stream = new PassThrough();
      process.nextTick(() => {
        stream.end();
        session.emit("audioPlayerStop", {} as AudioPlayer);
      });
      return { stream, cleanup: () => {} };
    };

    const res = await fetch(`http://localhost:${port}/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "hello" }),
    });

    t.true(res.ok);
    const data = (await res.json()) as { readonly status: string };
    t.is(data.status, "ok");

    server.close();
  });
}
