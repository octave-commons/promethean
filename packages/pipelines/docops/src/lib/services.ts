import type { ChromaCollection as QueryCollection } from "./query.js";
import { OLLAMA_URL } from "../utils.js";
import { Ollama } from "ollama";

type EmbeddingLike = readonly number[];

type StoredRecord = {
  readonly id: string;
  readonly embedding: EmbeddingLike;
  readonly document?: string;
  readonly metadata?: Record<string, unknown> | null;
};

const FLAG = "DOCOPS_FAKE_SERVICES";

export const usingFakeServices = () => process.env[FLAG] === "1";

class FakeOllamaClient {
  async list(): Promise<{ models: readonly { name: string }[] }> {
    return { models: [{ name: "fake-docops" }] };
  }

  async embed({ input }: { input: readonly string[] | string }) {
    const texts = Array.isArray(input) ? input : [input];
    return { embeddings: texts.map(fakeEmbedding) };
  }

  async embeddings(request: { input: readonly string[] | string }) {
    return this.embed(request);
  }
}

type FakeStore = Map<string, StoredRecord>;

type FakeState = {
  readonly collections: Map<string, FakeStore>;
};

const getState = (): FakeState => {
  const g = globalThis as typeof globalThis & {
    __DOCOPS_FAKE_STATE__?: FakeState;
  };
  if (!g.__DOCOPS_FAKE_STATE__) {
    g.__DOCOPS_FAKE_STATE__ = {
      collections: new Map<string, FakeStore>(),
    };
  }
  return g.__DOCOPS_FAKE_STATE__;
};

const ensureStore = (name: string): FakeStore => {
  const state = getState();
  let store = state.collections.get(name);
  if (!store) {
    store = new Map();
    state.collections.set(name, store);
  }
  return store;
};

const norm = (vec: EmbeddingLike): number => {
  if (vec.length === 0) return 0;
  const sum = vec.reduce((sum, v) => sum + v * v, 0);
  return Math.sqrt(sum);
};

const cosineDistance = (a: EmbeddingLike, b: EmbeddingLike) => {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return 1;
  const dot = a.reduce((sum, v, i) => sum + v * (b[i] ?? 0), 0);
  const cos = dot / (na * nb);
  const bounded = Math.max(-1, Math.min(1, cos));
  return 1 - (bounded + 1) / 2;
};

const fakeEmbedding = (text: string): number[] => {
  const dims = 8;
  const out = new Array<number>(dims).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const idx = i % dims;
    const currentValue = out[idx] ?? 0;
    out[idx] = currentValue + (code % 97) / 97;
  }
  const n: number = norm(out);
  if (n === 0 || isNaN(n)) return out;
  return out.map((v) => v / n);
};

class FakeChromaCollection implements QueryCollection {
  readonly #store: FakeStore;
  constructor(readonly name: string) {
    this.#store = ensureStore(name);
  }

  async upsert(input: {
    ids: readonly string[];
    embeddings: readonly EmbeddingLike[];
    documents?: readonly string[];
    metadatas?: readonly (Record<string, unknown> | null | undefined)[];
  }) {
    input.ids.forEach((id, idx) => {
      const embedding = input.embeddings[idx] ?? fakeEmbedding("");
      const document = input.documents?.[idx] ?? null;
      const metadata = input.metadatas?.[idx] ?? null;
      this.#store.set(id, {
        id,
        embedding: [...embedding],
        document: document ?? undefined,
        metadata: metadata ?? null,
      });
    });
    return { ids: [...input.ids] };
  }

  async get(input: {
    ids: readonly string[];
    include?: readonly ("metadatas" | "documents" | "embeddings")[];
  }) {
    const include = new Set(input.include ?? []);
    const ids = input.ids.map((id) => id);
    const result: any = { ids };
    if (include.has("embeddings")) {
      result.embeddings = ids.map((id) =>
        this.#store.get(id)?.embedding
          ? [...(this.#store.get(id)!.embedding as number[])]
          : null,
      );
    }
    if (include.has("documents")) {
      result.documents = ids.map((id) => this.#store.get(id)?.document ?? null);
    }
    if (include.has("metadatas")) {
      result.metadatas = ids.map((id) => this.#store.get(id)?.metadata ?? null);
    }
    return result;
  }

  async query(input: {
    queryEmbeddings: readonly EmbeddingLike[];
    nResults: number;
    where?: Record<string, unknown>;
  }) {
    const all = [...this.#store.values()];
    const ids: string[][] = [];
    const distances: number[][] = [];
    const documents: (string | null)[][] = [];
    const metadatas: (Record<string, unknown> | null)[][] = [];
    for (const q of input.queryEmbeddings) {
      const scored = all.map((entry) => ({
        id: entry.id,
        distance: cosineDistance(q, entry.embedding),
        document: entry.document ?? null,
        metadata: entry.metadata ?? null,
      }));
      scored.sort((a, b) => a.distance - b.distance);
      const top = scored.slice(0, input.nResults);
      ids.push(top.map((item) => item.id));
      distances.push(top.map((item) => item.distance));
      documents.push(top.map((item) => item.document));
      metadatas.push(top.map((item) => item.metadata));
    }
    return { ids, distances, documents, metadatas };
  }
}

class FakeChromaClient {
  async heartbeat(): Promise<number> {
    return Date.now();
  }

  async getOrCreateCollection(input: { name: string }) {
    return new FakeChromaCollection(input.name);
  }
}

export type OllamaClient = InstanceType<typeof Ollama> | FakeOllamaClient;

export const createOllamaClient = (): OllamaClient => {
  if (usingFakeServices()) return new FakeOllamaClient();
  return new Ollama({ host: OLLAMA_URL });
};

export const getFakeChroma = async (opts: {
  collection: string;
  embedModel: string;
}) => {
  const client = new FakeChromaClient();
  const coll = await client.getOrCreateCollection({ name: opts.collection });
  return { client, coll } as const;
};

export const ensureFakeServices = () => {
  process.env[FLAG] = "1";
};

export { fakeEmbedding };
