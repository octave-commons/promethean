import assert from "node:assert/strict";
import test from "node:test";
import { extractTieredVectorHits, mergeTieredVectorHits } from "../lib/vector-search.js";

test("extractTieredVectorHits unwraps chroma-style nested arrays", () => {
  const hits = extractTieredVectorHits({
    ids: [["a", "b"]],
    documents: [["doc a", "doc b"]],
    metadatas: [[{ source: "hot" }, { source: "hot" }]],
    distances: [[0.2, 0.4]],
  }, "hot");

  assert.equal(hits.length, 2);
  assert.equal(hits[0].id, "a");
  assert.equal(hits[0].tier, "hot");
  assert.equal(hits[0].distance, 0.2);
});

test("mergeTieredVectorHits combines hot and compact results with reciprocal-rank fusion", () => {
  const merged = mergeTieredVectorHits([
    [
      { id: "hot-1", tier: "hot", rank: 0, document: "hot one", metadata: { source: "discord" }, distance: 0.1 },
      { id: "shared", tier: "hot", rank: 1, document: "shared hot", metadata: { source: "discord" }, distance: 0.2 },
    ],
    [
      { id: "shared", tier: "compact", rank: 0, document: "shared compact", metadata: { source: "openplanner.compaction" }, distance: 0.3 },
      { id: "compact-1", tier: "compact", rank: 1, document: "compact one", metadata: { source: "openplanner.compaction" }, distance: 0.1 },
    ],
  ], 3) as {
    ids: string[][];
    documents: string[][];
    metadatas: Array<Array<Record<string, unknown>>>;
  };

  assert.deepEqual(merged.ids[0], ["shared", "hot-1", "compact-1"]);
  assert.equal(merged.documents[0][0], "shared hot");
  assert.deepEqual(merged.metadatas[0][0]?.search_tiers, ["hot", "compact"]);
});
