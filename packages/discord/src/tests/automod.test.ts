import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import test from "ava";

import type { AutomodMessage } from "../automod/index.js";
import { containsSora, hasFuzzyCode, createAutomod } from "../automod/index.js";

const createTempLogPath = async () => {
  const dir = await mkdtemp(join(tmpdir(), "automod-"));
  return join(dir, "log.csv");
};

test("containsSora matches variations", (t) => {
  t.true(containsSora("SORA appears"));
  t.true(containsSora("hello sora world"));
  t.false(containsSora("soran"));
});

test("hasFuzzyCode respects distance", (t) => {
  t.true(hasFuzzyCode("writing code"));
  t.true(hasFuzzyCode("writing coda"));
  t.false(hasFuzzyCode("writing coffee", 1));
});

test("rule based evaluation logs deleted messages", async (t) => {
  const automod = await createAutomod({ logPath: await createTempLogPath() });
  const message: AutomodMessage = {
    id: "42",
    authorId: "user",
    channelId: "chan",
    content: "Sora loves cdoe",
    createdTimestamp: Date.now(),
  };

  const decision = await automod.handleMessage(message);
  t.deepEqual(decision, { action: "delete", reason: "rule" });

  const logged = await automod.listLoggedMessages();
  t.is(logged.length, 1);
  t.like(logged[0], { id: "42", content: "Sora loves cdoe" });
});

test("classifier bans without rule trigger when activated", async (t) => {
  const automod = await createAutomod({
    logPath: await createTempLogPath(),
    minimumExamples: 1,
  });

  automod.addExample("friendly conversation", "allowed");
  automod.addExample("suspicious payload", "banned");
  automod.trainClassifier();
  t.true(automod.activateClassifier());

  const decision = automod.evaluate("totally suspicious payload");
  t.deepEqual(decision, { action: "delete", reason: "classifier:banned" });
});

test("promoting logged message feeds explicit examples", async (t) => {
  const automod = await createAutomod({
    logPath: await createTempLogPath(),
    minimumExamples: 1,
  });

  const message: AutomodMessage = {
    id: "55",
    authorId: "user",
    channelId: "chan",
    content: "Sora loves cdoe",
    createdTimestamp: Date.now(),
  };
  await automod.handleMessage(message);

  const snapshot = await automod.promoteLoggedMessage("55", "banned");
  t.deepEqual(snapshot.bannedExamples, ["Sora loves cdoe"]);
});
