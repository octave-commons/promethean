import test from "ava";

import { toScore, mapHits } from "../lib/query.js";
import type { Chunk } from "../types.js";

test("toScore maps cosine and l2 distances", (t) => {
  t.is(toScore(0), 1);
  t.is(toScore(1), 0);
  t.true(toScore(0.25) > toScore(0.75));
  t.true(toScore(2) > 0 && toScore(2) < 1);
  t.is(toScore(NaN), 0);
});

test("mapHits filters self-doc and caps k", (t) => {
  const byId: ReadonlyMap<string, Chunk> = new Map([
    [
      "a:0",
      {
        id: "a:0",
        docUuid: "a",
        docPath: "/a",
        startLine: 1,
        startCol: 0,
        endLine: 1,
        endCol: 1,
        text: "",
        kind: "text",
      },
    ],
    [
      "b:0",
      {
        id: "b:0",
        docUuid: "b",
        docPath: "/b",
        startLine: 2,
        startCol: 0,
        endLine: 2,
        endCol: 1,
        text: "",
        kind: "text",
      },
    ],
    [
      "c:0",
      {
        id: "c:0",
        docUuid: "c",
        docPath: "/c",
        startLine: 3,
        startCol: 0,
        endLine: 3,
        endCol: 1,
        text: "",
        kind: "text",
      },
    ],
  ]);
  const ids = ["a:0", "b:0", "c:0"]; // first is self, should be dropped
  const dists = [0.0, 0.2, 0.9];
  const out = mapHits(ids, dists, byId, "a", 1);
  t.is(out.length, 1);
  t.is(out[0]!.docUuid, "b");
  t.true(out[0]!.score > 0);
});
