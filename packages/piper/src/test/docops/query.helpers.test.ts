import test from "ava";

import { toScore, mapHits } from "@promethean/docops/dist/lib/query.js";

test("toScore maps cosine and l2 distances", (t) => {
  t.is(toScore(0), 1);
  t.is(toScore(1), 0);
  t.true(toScore(0.25) > toScore(0.75));
  t.true(toScore(2) > 0 && toScore(2) < 1);
  t.is(toScore(NaN), 0);
});

test("mapHits filters self-doc and caps k", (t) => {
  const byId: ReadonlyMap<string, any> = new Map([
    [
      "a:0",
      {
        id: "a:0",
        docUuid: "a",
        score: 1,
        title: "A0",
      } as any,
    ],
    [
      "b:0",
      {
        id: "b:0",
        docUuid: "b",
        score: 0.9,
        title: "B0",
      } as any,
    ],
  ]);
  const hits = [
    { id: "a:0", distance: 0.1 },
    { id: "b:0", distance: 0.2 },
  ];
  const ids = hits.map((h) => h.id);
  const dists = hits.map((h) => h.distance);
  const mapped = mapHits(ids, dists, byId, "a", 5);
  t.is(mapped.length, 1);
  t.is(mapped[0]!.docUuid, "b");
});
