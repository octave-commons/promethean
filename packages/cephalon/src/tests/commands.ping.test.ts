// SPDX-License-Identifier: GPL-3.0-only
import test from "ava";
import execute, { data } from "../commands/ping.js";

function makeInteraction() {
  const calls: any[] = [];
  return {
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

test("ping command defers and replies with pong", async (t) => {
  const interaction = makeInteraction();
  await execute(interaction as any, { bot: {} as any });
  t.is((data as any).name, "ping");
  t.deepEqual(interaction.calls[0], ["deferReply", { ephemeral: true }]);
  t.deepEqual(interaction.calls[interaction.calls.length - 1], [
    "editReply",
    "pong",
  ]);
});
