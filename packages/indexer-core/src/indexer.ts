import fs from "node:fs/promises";
import path from "node:path";

import {
  ChromaClient,
  type UpsertRecordsParams,
  type QueryRecordsParams,
  type DeleteParams,
  type GetOrCreateCollectionParams,
} from "chromadb";
import { createLogger, type Logger } from "@promethean/utils";
import { scanFiles as indexFiles } from "@promethean/file-indexer";
import type { IndexedFile } from "@promethean/file-indexer";

import { RemoteEmbeddingFunction } from "./embedding.js";
import {
  createInclusionChecker,
  deriveExtensions,
  toPosixPath,
} from "./glob.js";
import {
  deleteBootstrapState,
  loadBootstrapState,
  saveBootstrapState,
  type BootstrapState,
} from "./state/index.js";

let logger: Logger = createLogger({ service: "indexer-core" });

export function setIndexerLogger(next: Logger): void {
  logger = next;
}

export function getIndexerLogger(): Logger {
  return logger;
}

export type CollectionLike = {
  upsert(args: UpsertRecordsParams): Promise<void>;
  query(args: QueryRecordsParams): Promise<any>;
  delete(args: DeleteParams): Promise<void>;
  get?(...args: any[]): Promise<any>;
  count?(): Promise<number>;
  add?(...args: any[]): Promise<void>;
};

export type ChromaLike = {
  getOrCreateCollection(
    args: GetOrCreateCollectionParams,
  ): Promise<CollectionLike>;
};

let CHROMA: ChromaLike | null = null; // lazily created to avoid holding open handles during import
let EMBEDDING_FACTORY: (() => Promise<any>) | null = null; // optional override for tests
let EMBEDDING_INSTANCE: any = null; // cached default embedding fn
let EMBEDDING_INSTANCE_KEY: string | null = null; // cache key for default embedding fn

export function setChromaClient(client: ChromaLike) {
  CHROMA = client;
}
export function setEmbeddingFactory(factory: (() => Promise<any>) | null) {
  EMBEDDING_FACTORY = factory;
}
export function resetChroma() {
  CHROMA = null;
}
export function resetEmbeddingCache() {
  try {
    EMBEDDING_INSTANCE?.dispose?.();
  } catch {}
  EMBEDDING_INSTANCE = null;
  EMBEDDING_INSTANCE_KEY = null;
}

export function getChroma(): ChromaLike {
  if (!CHROMA) {
    const real = new ChromaClient();
    CHROMA = {
      async getOrCreateCollection(
        args: GetOrCreateCollectionParams,
      ): Promise<CollectionLike> {
        const col = await real.getOrCreateCollection(args);
        return {
          upsert: (a: UpsertRecordsParams) => col.upsert(a),
          delete: (a: DeleteParams) => col.delete(a),
          query: (a: QueryRecordsParams) => col.query(a),
          get: (...a: any[]) => (col as any).get?.(...a),
          count: () => (col as any).count?.(),
          add: (...a: any[]) => (col as any).add?.(...a),
        };
      },
    };
  }
  return CHROMA;
}

function splitCSV(s?: string) {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
function defaultExcludes() {
  const env = splitCSV(process.env.EXCLUDE_GLOBS);
  return env.length
    ? env
    : ["node_modules/**", ".git/**", "dist/**", "build/**", ".obsidian/**"];
}

const SUPPORTED_EXTENSIONS = new Set<string>([
  ".md",
  ".txt",
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".py",
  ".go",
  ".rs",
  ".json",
  ".yml",
  ".yaml",
  ".sh",
]);

const DEFAULT_INCLUDE = [
  "**/*.{md,txt,js,ts,jsx,tsx,py,go,rs,json,yml,yaml,sh}",
];

function isPathMissingError(value: unknown): value is NodeJS.ErrnoException {
  if (!value || typeof value !== "object") return false;
  const maybeError = value as Partial<NodeJS.ErrnoException>;
  const code = maybeError.code;
  return code === "ENOENT" || code === "ENOTDIR";
}

const realpathOrNull = async (rootPath: string, targetPath: string) => {
  const rootAbs = path.resolve(rootPath);
  const candidate = path.resolve(rootAbs, targetPath);
  try {
    const resolved = await fs.realpath(candidate);
    const rel = path.relative(rootAbs, resolved);
    // Ensure the resolved path is strictly under the root directory.
    // Avoids cases like root '/a/foo' and candidate '/a/foobar' by using path sep.
    const isUnderRoot =
      resolved === rootAbs ||
      resolved.startsWith(rootAbs + path.sep);
    if (!isUnderRoot) {
      return null;
    }
    return resolved;
  } catch (error: unknown) {
    if (!isPathMissingError(error)) {
      throw error;
    }
    return null;
  }
};

async function resolveWithinRoot(rootPath: string, rel: string) {
  const rootAbs = path.resolve(rootPath);
  const candidate = path.resolve(rootAbs, rel);
  const rootReal = await fs.realpath(rootAbs);

  const candidateReal = await realpathOrNull(rootReal, candidate).then(
    async (resolved) => {
      if (resolved !== null) return resolved;
      const parentReal = await realpathOrNull(rootReal, path.dirname(candidate));
      let attempted;
      if (parentReal !== null) {
        attempted = path.join(parentReal, path.basename(candidate));
      } else {
        attempted = path.normalize(candidate);
      }
      // Explicitly check fallback against rootAbs
      const rootCheck = path.resolve(rootAbs);
      const absAttempted = path.resolve(attempted);
      const relAttempted = path.relative(rootCheck, absAttempted);
      const escapesRootAttempted =
        relAttempted.length > 0 &&
        (relAttempted.startsWith("..") || path.isAbsolute(relAttempted));
      if (escapesRootAttempted) {
        throw new Error("Path escapes index root (fallback)");
      }
      return absAttempted;
    },
  );

  const relativeToRoot = path.relative(rootReal, candidateReal);
  const absWithSep = rootReal.endsWith(path.sep) ? rootReal : rootReal + path.sep;
  const isUnderRoot =
    candidateReal === rootReal ||
    candidateReal.startsWith(absWithSep);
  if (!isUnderRoot) {
    throw new Error("Path escapes index root");
  }
  const normalizedRel = toPosixPath(relativeToRoot);
  return { abs: candidateReal, rel: normalizedRel };
}

function toIgnoreDirs(patterns: readonly string[]): string[] {
  const stripSuffix = (value: string) => {
    const starIndex = value.indexOf("**");
    if (starIndex === -1) return value;
    return value.slice(0, starIndex);
  };
  const trimRepeatedSlashes = (value: string) => {
    let next = value;
    while (next.endsWith("/")) {
      next = next.slice(0, -1);
    }
    return next;
  };
  return patterns
    .map((raw) => raw.trim())
    .filter((value) => value.length > 0)
    .map((value) => (value.startsWith("!") ? value.slice(1) : value))
    .map((value) => value.split("\\").join("/"))
    .map((value) => (value.startsWith("**/") ? value.slice(3) : value))
    .map((value) => (value.startsWith("/") ? value.slice(1) : value))
    .map(stripSuffix)
    .map(trimRepeatedSlashes)
    .filter((value) => value.length > 0)
    .map((value) => path.normalize(value));
}

export async function gatherRepoFiles(
  rootPath: string,
  options: Readonly<{
    include?: readonly string[];
    exclude?: readonly string[];
  }> = {},
) {
  const resolvedRoot = path.resolve(rootPath);
  const include = options.include ?? [];
  const exclude = options.exclude ?? defaultExcludes();
  const ignoreDirs = toIgnoreDirs(exclude);
  const extCandidates = include.length
    ? deriveExtensions(include, { fallback: SUPPORTED_EXTENSIONS })
    : SUPPORTED_EXTENSIONS;
  const shouldInclude = include.length
    ? createInclusionChecker(include)
    : () => true;
  const shouldExclude = exclude.length
    ? createInclusionChecker(exclude)
    : () => false;
  const files: string[] = [];
  const fileInfo: Record<string, { size: number; mtimeMs: number }> = {};
  await indexFiles({
    root: resolvedRoot,
    ...(extCandidates ? { exts: extCandidates } : {}),
    ignoreDirs,
    onFile: async (file: IndexedFile) => {
      const abs = path.isAbsolute(file.path)
        ? path.resolve(file.path)
        : path.resolve(resolvedRoot, file.path);
      const rel = path.relative(resolvedRoot, abs);
      if (rel.startsWith("..")) {
        return;
      }
      const normalized = toPosixPath(rel);
      if (shouldExclude(normalized)) {
        return;
      }
      if (!shouldInclude(normalized)) {
        return;
      }
      try {
        const st = await fs.stat(abs);
        files.push(normalized);
        fileInfo[normalized] = {
          size: Number(st.size),
          mtimeMs: Number(st.mtimeMs),
        };
      } catch {
        // file could disappear between listing and stat; skip
      }
    },
  });
  return { files, fileInfo };
}

// Chunk by ~2000 chars with 200 overlap; track line numbers.
function makeChunks(text: string, maxLen = 2000, overlap = 200) {
  const chunks: Array<{
    index: number;
    start: number;
    end: number;
    startLine: number;
    endLine: number;
    text: string;
  }> = [];
  let i = 0;
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + maxLen);
    const chunk = text.slice(start, end);
    const startLine = text.slice(0, start).split("\n").length;
    const endLine = text.slice(0, end).split("\n").length;
    chunks.push({
      index: i++,
      start,
      end,
      startLine,
      endLine,
      text: chunk,
    });
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}

export async function buildEmbeddingFn() {
  const driver = process.env.EMBEDDING_DRIVER || "ollama";
  const fn = process.env.EMBEDDING_FUNCTION || "nomic-embed-text";
  const key = `${driver}::${fn}::${process.env.BROKER_URL || ""}`;
  if (EMBEDDING_INSTANCE && EMBEDDING_INSTANCE_KEY === key)
    return EMBEDDING_INSTANCE;
  try {
    EMBEDDING_INSTANCE?.dispose?.();
  } catch {}
  EMBEDDING_INSTANCE = RemoteEmbeddingFunction.fromConfig({ driver, fn });
  EMBEDDING_INSTANCE_KEY = key;
  return EMBEDDING_INSTANCE;
}

export function embeddingEnvConfig() {
  return {
    driver: process.env.EMBEDDING_DRIVER || "ollama",
    fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
  };
}

// Index a single file (helper used by queue/manager and tests)
export async function indexFile(
  rootPath: string,
  rel: string,
  _options: Record<string, unknown> = {},
) {
  const family = String(process.env.COLLECTION_FAMILY || "repo_files");
  const version = String(process.env.EMBED_VERSION || "dev");
  const cfg = {
    driver: process.env.EMBEDDING_DRIVER || "ollama",
    fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
    dims: Number(process.env.EMBED_DIMS || 768),
  };
  const col = await collectionForFamily(family, version, cfg);
  const { abs, rel: safeRel } = await resolveWithinRoot(rootPath, rel);
  if (!abs) {
    logger.warn("indexFile read blocked - candidate file is outside root", { path: rel });
    return { ok: false, error: "File is outside index root" };
  }
  let raw = "";
  try {
    raw = await fs.readFile(abs, "utf8");
  } catch (e: any) {
    logger.warn("indexFile read failed", { path: safeRel, err: e });
    return { ok: false, error: String(e?.message || e) };
  }
  const chunks = makeChunks(raw);
  let processed = 0;
  for (const c of chunks) {
    const id = `${safeRel}#${c.index}`;
    await col.upsert({
      ids: [id],
      documents: [c.text],
      metadatas: [
        {
          path: safeRel,
          chunkIndex: c.index,
          startLine: c.startLine,
          endLine: c.endLine,
          bytesStart: c.start,
          bytesEnd: c.end,
          version,
          driver: cfg.driver,
          fn: cfg.fn,
        },
      ],
    });
    processed++;
  }
  return { ok: true, path: safeRel, processed };
}

export async function removeFileFromIndex(_rootPath: string, rel: string) {
  const family = String(process.env.COLLECTION_FAMILY || "repo_files");
  const version = String(process.env.EMBED_VERSION || "dev");
  const cfg = {
    driver: process.env.EMBEDDING_DRIVER || "ollama",
    fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
  };
  const col = await collectionForFamily(family, version, cfg);
  try {
    const { rel: safeRel } = await resolveWithinRoot(_rootPath, rel);
    await col.delete({ where: { path: safeRel } });
    return { ok: true };
  } catch (e: any) {
    logger.error("removeFileFromIndex failed", { path: rel, err: e });
    return { ok: false, error: String(e?.message || e) };
  }
}

// Simple in-memory queue manager with delay between files and bootstrap mode
export class IndexerManager {
  mode: "bootstrap" | "indexed";
  queue: string[];
  active: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  processedFiles: number;
  errors: string[];
  rootPath: string | null;
  _draining: boolean;
  bootstrap: { fileList: string[]; cursor: number } | null;
  state: any;
  constructor() {
    this.mode = "bootstrap"; // 'bootstrap' | 'indexed'
    this.queue = [];
    this.active = false;
    this.startedAt = null;
    this.finishedAt = null;
    this.processedFiles = 0;
    this.errors = [];
    this.rootPath = null;
    this._draining = false;
    this.bootstrap = null; // { fileList: string[], cursor: number }
    this.state = null; // last persisted state
  }
  status() {
    return {
      mode: this.mode,
      active: this.active,
      queuedFiles: this.queue.length,
      processedFiles: this.processedFiles,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      lastError: this.errors[this.errors.length - 1] || null,
      bootstrap: this.bootstrap
        ? {
            total: this.bootstrap.fileList.length,
            cursor: this.bootstrap.cursor,
            remaining: Math.max(
              0,
              this.bootstrap.fileList.length - this.bootstrap.cursor,
            ),
          }
        : null,
    };
  }
  isBusy() {
    return this.active || this._draining || this.queue.length > 0;
  }
  async resetAndBootstrap(_rootPath: string) {
    if (this.isBusy()) throw new Error("Indexer is busy");
    this.mode = "bootstrap";
    this.queue = [];
    this.active = false;
    this.startedAt = null;
    this.finishedAt = null;
    this.processedFiles = 0;
    this.errors = [];
    this.rootPath = null;
    this._draining = false;
    this.bootstrap = null;
    this.state = null;
    await deleteBootstrapState(_rootPath);
    await this.ensureBootstrap(_rootPath);
    return { ok: true };
  }
  async ensureBootstrap(rootPath: string) {
    if (this.rootPath) return; // already initialized
    this.rootPath = rootPath;
    this.startedAt = Date.now();
    // Try resuming previous bootstrap state
    const prev = await loadBootstrapState(rootPath);
    this.state = prev;
    if (prev && prev.mode === "bootstrap" && Array.isArray(prev.fileList)) {
      this.mode = "bootstrap";
      this.bootstrap = {
        fileList: prev.fileList,
        cursor: Number(prev.cursor || 0),
      };
      // Append any newly discovered files to the end of the bootstrap list
      try {
        const { files: now } = await gatherRepoFiles(rootPath);
        const known = new Set(this.bootstrap.fileList);
        const add = now.filter((f) => !known.has(f));
        if (add.length) {
          this.bootstrap.fileList.push(...add);
          await saveBootstrapState(this.rootPath, {
            mode: "bootstrap",
            cursor: this.bootstrap.cursor,
            fileList: this.bootstrap.fileList,
            startedAt: this.startedAt,
            fileInfo: prev.fileInfo || {},
          });
        }
      } catch {}
      const remaining = this.bootstrap.fileList.slice(this.bootstrap.cursor);
      logger.info("indexer bootstrap resumed", {
        total: this.bootstrap.fileList.length,
        cursor: this.bootstrap.cursor,
        remaining: remaining.length,
        rootPath,
      });
      this.enqueueFiles(remaining);
      this._drain();
      return;
    }
    if (prev && prev.mode === "indexed") {
      // Completed previously; run incremental scan and enqueue changes
      this.mode = "indexed";
      this.bootstrap = null;
      this.finishedAt = prev.finishedAt || null;
      logger.info("indexer incremental scan starting", { rootPath });
      await this._scheduleIncremental(prev);
      return;
    }
    // Fresh bootstrap: schedule all files with delay between files and create state
    const { files, fileInfo } = await gatherRepoFiles(rootPath);
    logger.info("indexer bootstrap discovered files", {
      count: files.length,
      rootPath,
    });
    this.mode = "bootstrap";
    this.bootstrap = { fileList: files, cursor: 0 };
    await saveBootstrapState(rootPath, {
      mode: "bootstrap",
      cursor: 0,
      fileList: files,
      startedAt: this.startedAt,
      fileInfo,
    });
    this.enqueueFiles(files);
    this._drain();
  }
  enqueueFiles(rels: string[]) {
    const set = new Set(this.queue);
    for (const r of rels) {
      if (!set.has(r)) {
        set.add(r);
        this.queue.push(r);
      }
    }
  }
  async _drain() {
    if (this._draining) return;
    this._draining = true;
    const delayMs = Number(process.env.INDEXER_FILE_DELAY_MS || 250);
    while (this.queue.length) {
      this.active = true;
      const rel = this.queue.shift()!;
      logger.info("indexer processing file", {
        path: rel,
        remaining: this.queue.length,
      });
      try {
        await indexFile(this.rootPath!, rel);
        this.processedFiles++;
        // If this item corresponds to current bootstrap cursor, advance and persist
        if (
          this.mode === "bootstrap" &&
          this.bootstrap &&
          this.bootstrap.fileList[this.bootstrap.cursor] === rel
        ) {
          this.bootstrap.cursor++;
          const nextState1: Omit<BootstrapState, "rootPath"> = {
            mode: "bootstrap",
            cursor: this.bootstrap.cursor,
            fileList: this.bootstrap.fileList,
            ...(this.startedAt !== null ? { startedAt: this.startedAt } : {}),
          };
          await saveBootstrapState(this.rootPath!, nextState1);
        }
      } catch (e: any) {
        this.errors.push(String(e?.message || e));
        logger.error("index queue error", { err: e, path: rel });
        // On error during bootstrap, skip forward to avoid being stuck
        if (
          this.mode === "bootstrap" &&
          this.bootstrap &&
          this.bootstrap.fileList[this.bootstrap.cursor] === rel
        ) {
          this.bootstrap.cursor++;
          const nextState2: Omit<BootstrapState, "rootPath"> = {
            mode: "bootstrap",
            cursor: this.bootstrap.cursor,
            fileList: this.bootstrap.fileList,
            ...(this.startedAt !== null ? { startedAt: this.startedAt } : {}),
          };
          await saveBootstrapState(this.rootPath!, nextState2);
        }
      }
      if (this.queue.length) await new Promise((r) => setTimeout(r, delayMs));
    }
    this.active = false;
    this.finishedAt = Date.now();
    if (this.mode === "bootstrap") {
      // If finished processing bootstrap files, mark complete
      if (
        this.bootstrap &&
        this.bootstrap.cursor >= this.bootstrap.fileList.length
      ) {
        this.mode = "indexed";
        const { files, fileInfo } = await gatherRepoFiles(this.rootPath!);
        const nextState3: Omit<BootstrapState, "rootPath"> = {
          mode: "indexed",
          cursor: this.bootstrap.cursor,
          fileList: files,
          fileInfo,
          ...(this.startedAt !== null ? { startedAt: this.startedAt } : {}),
          ...(this.finishedAt !== null ? { finishedAt: this.finishedAt } : {}),
        };
        await saveBootstrapState(this.rootPath!, nextState3);
      }
    }
    this._draining = false;
    logger.info("indexer drain complete", {
      processedFiles: this.processedFiles,
      errors: this.errors.length,
      mode: this.mode,
    });
  }
  async scheduleReindexAll() {
    if (this.mode === "bootstrap")
      return { ok: true, ignored: true, mode: this.mode };
    const { files } = await gatherRepoFiles(this.rootPath!, {
      include: DEFAULT_INCLUDE,
    });
    this.enqueueFiles(files);
    this._drain();
    return { ok: true, queued: files.length };
  }
  async scheduleReindexSubset(globs: string | string[]) {
    if (this.mode === "bootstrap")
      return { ok: true, ignored: true, mode: this.mode };
    const include = Array.isArray(globs) ? globs : [String(globs)];
    const { files } = await gatherRepoFiles(this.rootPath!, { include });
    this.enqueueFiles(files);
    this._drain();
    return { ok: true, queued: files.length };
  }
  async scheduleIndexFile(rel: string) {
    const fileRel = path.isAbsolute(rel)
      ? path.relative(this.rootPath!, rel)
      : rel;
    this.enqueueFiles([fileRel]);
    this._drain();
    return { ok: true, queued: 1 };
  }
  async removeFile(rel: string) {
    return await removeFileFromIndex(this.rootPath!, rel);
  }

  async _scheduleIncremental(prev: any) {
    const { files: currentFiles, fileInfo: currentInfo } =
      await gatherRepoFiles(this.rootPath!);
    const prevInfo = prev?.fileInfo || {};
    const prevSet = new Set(Object.keys(prevInfo));
    const curSet = new Set(currentFiles);
    const toIndex = [];
    for (const f of currentFiles) {
      const cur = currentInfo[f]!;
      const p = prevInfo[f];
      if (!p) {
        toIndex.push(f);
      } else if (p.size !== cur.size || p.mtimeMs !== cur.mtimeMs) {
        toIndex.push(f);
      }
    }
    const toRemove = [];
    for (const f of prevSet) if (!curSet.has(f)) toRemove.push(f);
    if (toRemove.length) {
      for (const rel of toRemove) {
        try {
          await this.removeFile(rel);
        } catch (e: any) {
          logger.warn("incremental remove failed", {
            path: rel,
            err: e,
          });
        }
      }
    }
    if (toIndex.length) {
      logger.info("indexer incremental changes", {
        new_or_changed: toIndex.length,
        removed: toRemove.length,
      });
      this.enqueueFiles(toIndex);
      this._drain();
    } else if (toRemove.length) {
      logger.info("indexer incremental removed only", {
        removed: toRemove.length,
      });
    } else {
      logger.info("indexer incremental no changes");
    }
    await saveBootstrapState(this.rootPath!, {
      mode: "indexed",
      cursor: prev?.cursor || 0,
      fileList: currentFiles,
      fileInfo: currentInfo,
      startedAt: prev?.startedAt || this.startedAt,
      finishedAt: Date.now(),
    });
  }
}

export const indexerManager = new IndexerManager();

export function createIndexerManager(): IndexerManager {
  return new IndexerManager();
}

export async function collectionForFamily(
  family: string,
  version: string,
  cfg: { driver: string; fn: string; dims?: number },
): Promise<CollectionLike> {
  const embeddingFunction = EMBEDDING_FACTORY
    ? await EMBEDDING_FACTORY()
    : await buildEmbeddingFn();
  return await getChroma().getOrCreateCollection({
    name: `${family}__${version}__${cfg.driver}__${cfg.fn}`,
    embeddingFunction,
    metadata: { family, version, ...cfg } as any,
  });
}

export async function reindexAll(
  rootPath: string,
  options: Partial<{
    include: string[];
    exclude: string[];
    limit: number;
  }> = {},
) {
  const family = String(process.env.COLLECTION_FAMILY || "repo_files");
  const version = String(process.env.EMBED_VERSION || "dev");
  const include = options.include || [
    "**/*.{md,txt,js,ts,jsx,tsx,py,go,rs,json,yml,yaml,sh}",
  ];
  const exclude = options.exclude || defaultExcludes();
  const limit = options.limit || 0;
  const cfg = {
    driver: process.env.EMBEDDING_DRIVER || "ollama",
    fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
    dims: Number(process.env.EMBED_DIMS || 768),
  };
  const col = await collectionForFamily(family, version, cfg);
  const { files } = await gatherRepoFiles(rootPath, { include, exclude });
  const max = limit > 0 ? Math.min(limit, files.length) : files.length;
  let processed = 0;
  for (let i = 0; i < max; i++) {
    const rel = files[i]!;
    const abs = path.join(rootPath, rel);
    let raw = "";
    try {
      raw = await fs.readFile(abs, "utf8");
    } catch (e: any) {
      logger.warn("reindexAll read failed", { path: rel, err: e });
      continue;
    }
    const chunks = makeChunks(raw);
    for (const c of chunks) {
      const id = `${rel}#${c.index}`;
      await col.upsert({
        ids: [id],
        documents: [c.text],
        metadatas: [
          {
            path: rel,
            chunkIndex: c.index,
            startLine: c.startLine,
            endLine: c.endLine,
            bytesStart: c.start,
            bytesEnd: c.end,
            version,
            driver: cfg.driver,
            fn: cfg.fn,
          },
        ],
      });
      processed++;
    }
  }
  return { family, version, processed };
}

export async function reindexSubset(
  rootPath: string,
  globs: string | string[],
  options: Partial<{
    include: string[];
    exclude: string[];
    limit: number;
  }> = {},
) {
  const include = Array.isArray(globs) ? globs : [String(globs)];
  const merged = { ...options, include };
  return reindexAll(rootPath, merged);
}

export async function search(_rootPath: string, q: string, n = 8) {
  const family = String(process.env.COLLECTION_FAMILY || "repo_files");
  const version = String(process.env.EMBED_VERSION || "dev");
  const cfg = {
    driver: process.env.EMBEDDING_DRIVER || "ollama",
    fn: process.env.EMBEDDING_FUNCTION || "nomic-embed-text",
  };
  const col = await collectionForFamily(family, version, cfg);
  const r = await col.query({ queryTexts: [q], nResults: n });
  const ids = (r.ids?.flat(2) as string[]) || [];
  const docs = (r.documents?.flat(2) as string[]) || [];
  const metas = (r.metadatas?.flat(2) as any[]) || [];
  const dists = (r.distances?.flat(2) as number[]) || [];
  const out: Array<{
    id: string;
    path: string;
    chunkIndex: number;
    startLine: number;
    endLine: number;
    score?: number;
    text: string;
  }> = [];
  for (let i = 0; i < docs.length; i++) {
    const m = metas[i] || {};
    const s = dists[i];
    const item: {
      id: string;
      path: string;
      chunkIndex: number;
      startLine: number;
      endLine: number;
      text: string;
      score?: number;
    } = {
      id: String(ids[i] ?? ""),
      path: String(m.path || ""),
      chunkIndex: Number(m.chunkIndex || 0),
      startLine: Number(m.startLine || 0),
      endLine: Number(m.endLine || 0),
      text: String(docs[i] ?? ""),
    };
    if (typeof s === "number") item.score = s;
    out.push(item);
  }
  return out;
}
