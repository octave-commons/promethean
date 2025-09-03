// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import execute, { data } from "../commands/leave-voice.js";

function makeInteraction() {
  const calls: any[] = [];
  return {
    guildId: "g1",
    user: { id: "u1" },
    deferReply: async (o: any) => {
      calls.push(["deferReply", o]);
    },
    editReply: async (m: any) => {
      calls.push(["editReply", m]);
    },
    get calls() {
      return calls;
    },
  } as any;
}

test("leave-voice command defers and dispatches event", async (t) => {
  const interaction = makeInteraction();
  const dispatched: any[] = [];
  const ctx = {
    bot: {} as any,
    dispatch: async (e: any) => void dispatched.push(e),
  };
  await execute(interaction as any, ctx);
  t.is((data as any).name, "leave-voice");
  t.deepEqual(interaction.calls[0], ["deferReply", { ephemeral: true }]);
  t.deepEqual(dispatched[0], {
    type: "VOICE/LEAVE_REQUESTED",
    guildId: "g1",
    by: "u1",
  });
  t.deepEqual(interaction.calls[interaction.calls.length - 1], [
    "editReply",
    "Leaving voice…",
  ]);
});
