// src/db.ts
import { Level } from "level";
import type { AbstractSublevel } from "abstract-level";

import type { Chunk, QueryHit } from "./types.js";

type KeyFormat = string | Buffer | Uint8Array;

export type DBs = {
  root: Level<string, unknown>;
  docs: AbstractSublevel<
    Level<string, unknown>,
    KeyFormat,
    string,
    { path: string; title: string }
  >;
  chunks: AbstractSublevel<
    Level<string, unknown>,
    KeyFormat,
    string,
    readonly Chunk[]
  >;
  fp: AbstractSublevel<Level<string, unknown>, KeyFormat, string, string>;
  q: AbstractSublevel<
    Level<string, unknown>,
    KeyFormat,
    string,
    readonly QueryHit[]
  >;
};

export const openDB = async (
  location = process.env.DOCOPS_DB || ".cache/docops.level",
): Promise<DBs> => {
  const root: DBs["root"] = new Level<string, unknown>(location, {
    valueEncoding: "json",
  });
  const docs: DBs["docs"] = root.sublevel<
    string,
    { path: string; title: string }
  >("docs", { keyEncoding: "utf8", valueEncoding: "json" });
  const chunks: DBs["chunks"] = root.sublevel<string, readonly Chunk[]>(
    "chunks",
    { keyEncoding: "utf8", valueEncoding: "json" },
  );
  const fp: DBs["fp"] = root.sublevel<string, string>("fp", {
    keyEncoding: "utf8",
    valueEncoding: "utf8",
  });
  const q: DBs["q"] = root.sublevel<string, readonly QueryHit[]>("q", {
    keyEncoding: "utf8",
    valueEncoding: "json",
  });
  await root.open(); // open main DB

  await Promise.all([chunks.open(), fp.open(), docs.open(), q.open()]);
  return { root, docs, chunks, fp, q };
};
// packages/docops/src/03-query.ts

type Json = unknown;

type Range = {
  gt?: string;
  gte?: string;
  lt?: string;
  lte?: string;
  reverse?: boolean;
  limit?: number;
};

const DB_PATH = ".cache/docs-pipeline"; // keep in one place

// Pure-ish helper to build ranges
export const range = (prefix: string): Range => ({
  gt: `${prefix}`,
  lt: `${prefix}~`,
});

export const usingIterator = async <T>(
  it: AsyncIterable<[string, T]>,
  onItem: (kv: readonly [string, T]) => void | Promise<void>,
): Promise<void> => {
  // Level iterators are also closable; we rely on caller to pass the actual iterator
  // @ts-ignore - Level iterator types can be loose; we call close in finally.
  const iterator = it as unknown as {
    [Symbol.asyncIterator](): AsyncIterator<[string, T]>;
    close(): Promise<void>;
  };
  try {
    for await (const kv of iterator) {
      await onItem(kv);
    }
  } finally {
    await iterator.close();
  }
};

// Create DB once, create sublevels once, then operate.
export const withDb = async <R>(
  f: (root: Level<string, Json>, subs: Partial<DBs>) => Promise<R>,
): Promise<R> => {
  const { root, chunks, fp, docs } = await openDB(DB_PATH);

  try {
    // Optionally ensure sublevels are ready (open is inherited; this is defensive)
    return await f(root, { chunks, fp, docs });
  } finally {
    // Close once all work (including iterators) is done
    await root.close();
  }
};

export const collect = async <T>(
  xs: Iterable<T> | AsyncIterable<T>,
): Promise<readonly T[]> => {
  const acc: T[] = [];
  const asyncIterator = (xs as AsyncIterable<T>)[Symbol.asyncIterator];
  if (typeof asyncIterator === "function") {
    for await (const item of xs as AsyncIterable<T>) {
      acc.push(item);
    }
  } else {
    for (const item of xs as Iterable<T>) {
      acc.push(item);
    }
  }
  return acc;
};
