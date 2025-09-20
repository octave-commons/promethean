import test from "ava";

import { InMemoryChroma } from "../index.js";

test("queryByEmbedding returns the closest matches first", (t) => {
  const index = new InMemoryChroma<{ label: string }>();
  index.add([
    { id: "a", embedding: [1, 0, 0], metadata: { label: "alpha" } },
    { id: "b", embedding: [0, 1, 0], metadata: { label: "beta" } },
    { id: "c", embedding: [0.9, 0.1, 0], metadata: { label: "gamma" } },
  ]);

  const hits = index.queryByEmbedding([1, 0, 0], { k: 2 });

  t.deepEqual(
    hits.map((hit) => hit.id),
    ["a", "c"],
    "results should be ordered by cosine similarity",
  );
  t.true(hits[0]!.score >= hits[1]!.score);
});

test("queryByEmbedding applies metadata filters", (t) => {
  const index = new InMemoryChroma<{ label: string }>();
  index.add(
    ["x", "y"],
    [
      [1, 0],
      [0, 1],
    ],
    [{ label: "keep" }, { label: "skip" }],
  );

  const hits = index.queryByEmbedding([1, 0], {
    filter: (meta) => meta.label === "keep",
  });

  t.deepEqual(
    hits.map((hit) => hit.id),
    ["x"],
  );
});

test("add throws when arrays have different lengths", (t) => {
  const index = new InMemoryChroma();

  t.throws(() => index.add(["x"], [[1, 0]], []), { message: /equal length/ });
});

test("add throws when embedding dimensions do not match", (t) => {
  const index = new InMemoryChroma();
  index.add([{ id: "a", embedding: [1, 0], metadata: {} }]);

  const error = t.throws(() =>
    index.add([{ id: "b", embedding: [1, 0, 0], metadata: {} }]),
  );

  t.regex(error?.message ?? "", /dimension 3, expected 2/);
});

test("queryByEmbedding throws when dimension mismatches", (t) => {
  const index = new InMemoryChroma();
  index.add([{ id: "a", embedding: [1, 0], metadata: {} }]);

  t.throws(() => index.queryByEmbedding([0, 0, 1]), {
    message: /dimension 3, expected 2/,
  });
});

test("queryByEmbedding throws when index is empty", (t) => {
  const index = new InMemoryChroma();

  t.throws(() => index.queryByEmbedding([1, 0]), {
    message: /cannot query an empty index/,
  });
});

test("clear resets the expected dimension", (t) => {
  const index = new InMemoryChroma();
  index.add([{ id: "a", embedding: [1, 0], metadata: {} }]);
  index.clear();

  t.notThrows(() =>
    index.add([{ id: "b", embedding: [0, 1, 0], metadata: {} }]),
  );
});
