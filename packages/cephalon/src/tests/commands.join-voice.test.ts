// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import execute, { data } from "../commands/join-voice.js";

function makeInteraction() {
  const calls: any[] = [];
  return {
    guild: { id: "g1" },
    user: { id: "u1" },
    member: { voice: { channelId: "c1" } },
    channel: { isTextBased: () => true, id: "t1" },
    inCachedGuild: () => true,
    deferReply: async (o: any) => calls.push(["deferReply", o]),
    editReply: async (m: any) => calls.push(["editReply", m]),
    get calls() {
      return calls;
    },
  } as any;
}

test("join-voice command defers and dispatches event", async (t) => {
  const interaction = makeInteraction();
  const dispatched: any[] = [];
  const ctx = {
    bot: {} as any,
    dispatch: async (e: any): Promise<void> => {
      dispatched.push(e);
    },
  };
  await execute(interaction as any, ctx);
  t.is((data as any).name, "join-voice");
  t.deepEqual(interaction.calls[0], ["deferReply", { ephemeral: true }]);
  t.deepEqual(dispatched[0], {
    type: "VOICE/JOIN_REQUESTED",
    guildId: "g1",
    voiceChannelId: "c1",
    by: "u1",
    textChannelId: "t1",
  });
  t.deepEqual(interaction.calls[interaction.calls.length - 1], [
    "editReply",
    "Joining voice…",
  ]);
});
