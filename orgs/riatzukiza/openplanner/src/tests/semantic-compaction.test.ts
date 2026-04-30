import assert from "node:assert/strict";
import test from "node:test";
import { buildSemanticPack, normalizeSemanticText, type CompactableEvent } from "../lib/semantic-compaction.js";

test("normalizeSemanticText strips urls and collapses whitespace", () => {
  assert.equal(
    normalizeSemanticText("Hello   https://example.com   WORLD"),
    "hello world",
  );
});

test("buildSemanticPack deduplicates near-identical message text and respects char budget", () => {
  const seed: CompactableEvent = {
    id: "seed",
    ts: "2026-03-27T00:00:00.000Z",
    source: "discord",
    kind: "message",
    project: "cephalon-hive",
    session: "session-1",
    text: "Duck says we should inspect the rust logs before changing the deploy.",
  };

  const neighbors: CompactableEvent[] = [
    {
      id: "dup",
      ts: "2026-03-27T00:01:00.000Z",
      source: "discord",
      kind: "message",
      project: "cephalon-hive",
      session: "session-1",
      text: "Duck says we should inspect the rust logs before changing the deploy.",
    },
    {
      id: "n1",
      ts: "2026-03-27T00:02:00.000Z",
      source: "discord",
      kind: "message",
      project: "cephalon-hive",
      session: "session-1",
      text: "The deploy issue looks related to a missing environment variable in staging.",
    },
    {
      id: "n2",
      ts: "2026-03-27T00:03:00.000Z",
      source: "discord",
      kind: "message",
      project: "cephalon-hive",
      session: "session-1",
      text: "We should compare the service env between local and staging before restarting again.",
    },
  ];

  const pack = buildSemanticPack(seed, neighbors, {
    maxChars: 10000,
    minClusterSize: 3,
  }, "qwen3-embedding:4b");

  assert.ok(pack);
  assert.equal(pack?.memberCount, 3);
  assert.deepEqual(pack?.memberIds, ["seed", "n1", "n2"]);
  assert.match(pack?.text ?? "", /Semantic memory pack/);
});
