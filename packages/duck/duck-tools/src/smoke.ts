import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import crypto from "node:crypto";

const CHUNK_SIZE = 1024 * 1024; // 1 MiB

type Primitive = bigint | boolean | null | number | string | symbol | undefined;

type Immutable<T> = T extends
  | Primitive
  | ((...args: readonly never[]) => unknown)
  ? T
  : T extends readonly (infer U)[]
    ? readonly Immutable<U>[]
    : { readonly [K in keyof T]: Immutable<T[K]> };

type ChunkVisitInput = Immutable<{ chunk: Buffer; id: number }>;

type ChunkVisit = (input: ChunkVisitInput) => void | Promise<void>;

type ChunkIterationResult = Immutable<{ readBytes: number; chunks: number }>;

type ChunkIterationArgs = Immutable<{
  iterator: AsyncIterator<Buffer>;
  visit: ChunkVisit;
  id: number;
  readBytes: number;
}>;

type ConsumeArgs = Immutable<{
  iterator: AsyncIterator<Buffer>;
  effect: (chunk: Immutable<Buffer>) => void | Promise<void>;
}>;

type ChunkStats = Immutable<{
  totalBytes: number;
  readBytes: number;
  chunks: number;
}>;

const noopChunkVisit: ChunkVisit = async () => undefined;

const iterateChunks = async ({
  iterator,
  visit,
  id,
  readBytes,
}: ChunkIterationArgs): Promise<ChunkIterationResult> => {
  const next = await iterator.next();
  if (next.done || typeof next.value === "undefined") {
    return { readBytes, chunks: id };
  }
  const chunk = Buffer.from(next.value);
  await visit({ id, chunk });
  return iterateChunks({
    iterator,
    visit,
    id: id + 1,
    readBytes: readBytes + chunk.byteLength,
  });
};

export const readInChunks = async (
  path: string,
  visit: ChunkVisit = noopChunkVisit,
): Promise<ChunkStats> => {
  const fileStats = await stat(path);
  const stream = createReadStream(path, { highWaterMark: CHUNK_SIZE });
  const iterator = stream[Symbol.asyncIterator]() as AsyncIterator<Buffer>;
  const { readBytes, chunks } = await iterateChunks({
    iterator,
    visit,
    id: 0,
    readBytes: 0,
  });
  return { totalBytes: fileStats.size, readBytes, chunks };
};

const consumeStream = async ({
  iterator,
  effect,
}: ConsumeArgs): Promise<void> => {
  const next = await iterator.next();
  if (next.done || typeof next.value === "undefined") {
    return;
  }
  const chunk = Buffer.from(next.value);
  await effect(chunk);
  await consumeStream({ iterator, effect });
};

export const sha256File = async (path: string): Promise<string> => {
  const hash = crypto.createHash("sha256");
  const stream = createReadStream(path, { highWaterMark: CHUNK_SIZE });
  await consumeStream({
    iterator: stream[Symbol.asyncIterator]() as AsyncIterator<Buffer>,
    effect: (chunk) => {
      hash.update(chunk);
    },
  });
  return hash.digest("hex");
};

export const smoke = async (path: string): Promise<void> => {
  const { totalBytes, readBytes, chunks } = await readInChunks(path);
  const sha256 = await sha256File(path);
  const reducedBytes = readBytes;
  console.log(
    JSON.stringify(
      { chunks, totalBytes, streamedBytes: readBytes, reducedBytes, sha256 },
      null,
      2,
    ),
  );
};

const shouldRun = (): boolean => {
  const script = process.argv[1];
  return Boolean(script?.endsWith("smoke.js") || script?.endsWith("smoke.ts"));
};

if (shouldRun()) {
  const [, , input] = process.argv;
  if (!input) {
    console.error("USAGE: duck-smoke <PATH_TO_FILE>");
    process.exit(1);
  }
  smoke(input).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
