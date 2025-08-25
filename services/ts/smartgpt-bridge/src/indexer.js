import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import { ChromaClient } from 'chromadb';
import { RemoteEmbeddingFunction } from './remoteEmbedding.js';
import { logger } from './logger.js';
import { loadBootstrapState, saveBootstrapState, deleteBootstrapState } from './indexerState.js';

let CHROMA = null; // lazily created to avoid holding open handles during import
let EMBEDDING_FACTORY = null; // optional override for tests
let EMBEDDING_INSTANCE = null; // cached default embedding fn
let EMBEDDING_INSTANCE_KEY = null; // cache key for default embedding fn

export function setChromaClient(client) {
    CHROMA = client;
}
export function setEmbeddingFactory(factory) {
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

export function getChroma() {
    if (!CHROMA) CHROMA = new ChromaClient();
    return CHROMA;
}

function splitCSV(s) {
    return (s || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
}
function defaultExcludes() {
    const env = splitCSV(process.env.EXCLUDE_GLOBS);
    return env.length ? env : ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.obsidian/**'];
}

// Enumerate files + capture quick stats used for incremental comparisons
async function scanFiles(rootPath) {
    const include = ['**/*.{md,txt,js,ts,jsx,tsx,py,go,rs,json,yml,yaml,sh}'];
    const files = await fg(include, {
        cwd: rootPath,
        ignore: defaultExcludes(),
        onlyFiles: true,
        dot: false,
    });
    const fileInfo = {};
    for (const rel of files) {
        try {
            const st = await fs.stat(path.join(rootPath, rel));
            fileInfo[rel] = { size: Number(st.size), mtimeMs: Number(st.mtimeMs) };
        } catch {
            // file could disappear between listing and stat; skip
        }
    }
    return { files, fileInfo };
}

// Chunk by ~2000 chars with 200 overlap; track line numbers.
function makeChunks(text, maxLen = 2000, overlap = 200) {
    const chunks = [];
    let i = 0;
    let start = 0;
    while (start < text.length) {
        const end = Math.min(text.length, start + maxLen);
        const chunk = text.slice(start, end);
        const startLine = text.slice(0, start).split('\n').length;
        const endLine = text.slice(0, end).split('\n').length;
        chunks.push({ index: i++, start, end, startLine, endLine, text: chunk });
        if (end === text.length) break;
        start = end - overlap;
    }
    return chunks;
}

export async function buildEmbeddingFn() {
    const driver = process.env.EMBEDDING_DRIVER || 'ollama';
    const fn = process.env.EMBEDDING_FUNCTION || 'nomic-embed-text';
    const key = `${driver}::${fn}::${process.env.BROKER_URL || ''}`;
    if (EMBEDDING_INSTANCE && EMBEDDING_INSTANCE_KEY === key) return EMBEDDING_INSTANCE;
    try {
        EMBEDDING_INSTANCE?.dispose?.();
    } catch {}
    EMBEDDING_INSTANCE = RemoteEmbeddingFunction.fromConfig({ driver, fn });
    EMBEDDING_INSTANCE_KEY = key;
    return EMBEDDING_INSTANCE;
}

export function embeddingEnvConfig() {
    return {
        driver: process.env.EMBEDDING_DRIVER || 'ollama',
        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
    };
}

// Index a single file (helper used by queue/manager and tests)
export async function indexFile(rootPath, rel, options = {}) {
    const family = process.env.COLLECTION_FAMILY || 'repo_files';
    const version = process.env.EMBED_VERSION || 'dev';
    const cfg = {
        driver: process.env.EMBEDDING_DRIVER || 'ollama',
        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
        dims: Number(process.env.EMBED_DIMS || 768),
    };
    const col = await collectionForFamily(family, version, cfg);
    const abs = path.join(rootPath, rel);
    let raw = '';
    try {
        raw = await fs.readFile(abs, 'utf8');
    } catch (e) {
        logger.warn('indexFile read failed', { path: rel, err: e });
        return { ok: false, error: String(e?.message || e) };
    }
    const chunks = makeChunks(raw);
    let processed = 0;
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
    return { ok: true, path: rel, processed };
}

export async function removeFileFromIndex(rootPath, rel) {
    const family = process.env.COLLECTION_FAMILY || 'repo_files';
    const version = process.env.EMBED_VERSION || 'dev';
    const cfg = {
        driver: process.env.EMBEDDING_DRIVER || 'ollama',
        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
    };
    const col = await collectionForFamily(family, version, cfg);
    try {
        await col.delete({ where: { path: rel } });
        return { ok: true };
    } catch (e) {
        logger.error('removeFileFromIndex failed', { path: rel, err: e });
        return { ok: false, error: String(e?.message || e) };
    }
}

// Simple in-memory queue manager with delay between files and bootstrap mode
class IndexerManager {
    constructor() {
        this.mode = 'bootstrap'; // 'bootstrap' | 'indexed'
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
    async resetAndBootstrap(rootPath) {
        if (this.isBusy()) throw new Error('Indexer is busy');
        this.mode = 'bootstrap';
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
        await deleteBootstrapState(rootPath);
        await this.ensureBootstrap(rootPath);
        return { ok: true };
    }
    async ensureBootstrap(rootPath) {
        if (this.rootPath) return; // already initialized
        this.rootPath = rootPath;
        this.startedAt = Date.now();
        // Try resuming previous bootstrap state
        const prev = await loadBootstrapState(rootPath);
        this.state = prev;
        if (prev && prev.mode === 'bootstrap' && Array.isArray(prev.fileList)) {
            this.mode = 'bootstrap';
            this.bootstrap = { fileList: prev.fileList, cursor: Number(prev.cursor || 0) };
            // Append any newly discovered files to the end of the bootstrap list
            try {
                const { files: now } = await scanFiles(rootPath);
                const known = new Set(this.bootstrap.fileList);
                const add = now.filter((f) => !known.has(f));
                if (add.length) {
                    this.bootstrap.fileList.push(...add);
                    await saveBootstrapState(this.rootPath, {
                        mode: 'bootstrap',
                        cursor: this.bootstrap.cursor,
                        fileList: this.bootstrap.fileList,
                        startedAt: this.startedAt,
                        fileInfo: prev.fileInfo || {},
                    });
                }
            } catch {}
            const remaining = this.bootstrap.fileList.slice(this.bootstrap.cursor);
            logger.info('indexer bootstrap resumed', {
                total: this.bootstrap.fileList.length,
                cursor: this.bootstrap.cursor,
                remaining: remaining.length,
                rootPath,
            });
            this.enqueueFiles(remaining);
            this._drain();
            return;
        }
        if (prev && prev.mode === 'indexed') {
            // Completed previously; run incremental scan and enqueue changes
            this.mode = 'indexed';
            this.bootstrap = null;
            this.finishedAt = prev.finishedAt || null;
            logger.info('indexer incremental scan starting', { rootPath });
            await this._scheduleIncremental(prev);
            return;
        }
        // Fresh bootstrap: schedule all files with delay between files and create state
        const { files, fileInfo } = await scanFiles(rootPath);
        logger.info('indexer bootstrap discovered files', { count: files.length, rootPath });
        this.mode = 'bootstrap';
        this.bootstrap = { fileList: files, cursor: 0 };
        await saveBootstrapState(rootPath, {
            mode: 'bootstrap',
            cursor: 0,
            fileList: files,
            startedAt: this.startedAt,
            fileInfo,
        });
        this.enqueueFiles(files);
        this._drain();
    }
    enqueueFiles(rels) {
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
            const rel = this.queue.shift();
            logger.info('indexer processing file', { path: rel, remaining: this.queue.length });
            try {
                await indexFile(this.rootPath, rel);
                this.processedFiles++;
                // If this item corresponds to current bootstrap cursor, advance and persist
                if (
                    this.mode === 'bootstrap' &&
                    this.bootstrap &&
                    this.bootstrap.fileList[this.bootstrap.cursor] === rel
                ) {
                    this.bootstrap.cursor++;
                    await saveBootstrapState(this.rootPath, {
                        mode: 'bootstrap',
                        cursor: this.bootstrap.cursor,
                        fileList: this.bootstrap.fileList,
                        startedAt: this.startedAt,
                    });
                }
            } catch (e) {
                this.errors.push(String(e?.message || e));
                logger.error('index queue error', { err: e, path: rel });
                // On error during bootstrap, skip forward to avoid being stuck
                if (
                    this.mode === 'bootstrap' &&
                    this.bootstrap &&
                    this.bootstrap.fileList[this.bootstrap.cursor] === rel
                ) {
                    this.bootstrap.cursor++;
                    await saveBootstrapState(this.rootPath, {
                        mode: 'bootstrap',
                        cursor: this.bootstrap.cursor,
                        fileList: this.bootstrap.fileList,
                        startedAt: this.startedAt,
                    });
                }
            }
            if (this.queue.length) await new Promise((r) => setTimeout(r, delayMs));
        }
        this.active = false;
        this.finishedAt = Date.now();
        this._draining = false;
        if (this.mode === 'bootstrap') {
            // If finished processing bootstrap files, mark complete
            if (this.bootstrap && this.bootstrap.cursor >= this.bootstrap.fileList.length) {
                this.mode = 'indexed';
                const { files, fileInfo } = await scanFiles(this.rootPath);
                await saveBootstrapState(this.rootPath, {
                    mode: 'indexed',
                    cursor: this.bootstrap.cursor,
                    fileList: files,
                    fileInfo,
                    startedAt: this.startedAt,
                    finishedAt: this.finishedAt,
                });
            }
        }
        logger.info('indexer drain complete', {
            processedFiles: this.processedFiles,
            errors: this.errors.length,
            mode: this.mode,
        });
    }
    async scheduleReindexAll() {
        if (this.mode === 'bootstrap') return { ok: true, ignored: true, mode: this.mode };
        const include = ['**/*.{md,txt,js,ts,jsx,tsx,py,go,rs,json,yml,yaml,sh}'];
        const files = await fg(include, {
            cwd: this.rootPath,
            ignore: defaultExcludes(),
            onlyFiles: true,
            dot: false,
        });
        this.enqueueFiles(files);
        this._drain();
        return { ok: true, queued: files.length };
    }
    async scheduleReindexSubset(globs) {
        if (this.mode === 'bootstrap') return { ok: true, ignored: true, mode: this.mode };
        const include = Array.isArray(globs) ? globs : [String(globs)];
        const files = await fg(include, {
            cwd: this.rootPath,
            ignore: defaultExcludes(),
            onlyFiles: true,
            dot: false,
        });
        this.enqueueFiles(files);
        this._drain();
        return { ok: true, queued: files.length };
    }
    async scheduleIndexFile(rel) {
        const fileRel = path.isAbsolute(rel) ? path.relative(this.rootPath, rel) : rel;
        this.enqueueFiles([fileRel]);
        this._drain();
        return { ok: true, queued: 1 };
    }
    async removeFile(rel) {
        return await removeFileFromIndex(this.rootPath, rel);
    }

    async _scheduleIncremental(prev) {
        const { files: currentFiles, fileInfo: currentInfo } = await scanFiles(this.rootPath);
        const prevInfo = prev?.fileInfo || {};
        const prevSet = new Set(Object.keys(prevInfo));
        const curSet = new Set(currentFiles);
        const toIndex = [];
        for (const f of currentFiles) {
            const cur = currentInfo[f];
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
                } catch (e) {
                    logger.warn('incremental remove failed', { path: rel, err: e });
                }
            }
        }
        if (toIndex.length) {
            logger.info('indexer incremental changes', {
                new_or_changed: toIndex.length,
                removed: toRemove.length,
            });
            this.enqueueFiles(toIndex);
            this._drain();
        } else if (toRemove.length) {
            logger.info('indexer incremental removed only', { removed: toRemove.length });
        } else {
            logger.info('indexer incremental no changes');
        }
        await saveBootstrapState(this.rootPath, {
            mode: 'indexed',
            cursor: prev?.cursor || 0,
            fileList: currentFiles,
            fileInfo: currentInfo,
            startedAt: prev?.startedAt || this.startedAt,
            finishedAt: Date.now(),
        });
    }
}

export const indexerManager = new IndexerManager();

export async function collectionForFamily(family, version, cfg) {
    const embeddingFunction = EMBEDDING_FACTORY
        ? await EMBEDDING_FACTORY()
        : await buildEmbeddingFn();
    return await getChroma().getOrCreateCollection({
        name: `${family}__${version}__${cfg.driver}__${cfg.fn}`,
        embeddingFunction,
        metadata: { family, version, ...cfg },
    });
}

export async function reindexAll(rootPath, options = {}) {
    const family = process.env.COLLECTION_FAMILY || 'repo_files';
    const version = process.env.EMBED_VERSION || 'dev';
    const include = options.include || ['**/*.{md,txt,js,ts,jsx,tsx,py,go,rs,json,yml,yaml,sh}'];
    const exclude = options.exclude || defaultExcludes();
    const limit = options.limit || 0;
    const cfg = {
        driver: process.env.EMBEDDING_DRIVER || 'ollama',
        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
        dims: Number(process.env.EMBED_DIMS || 768),
    };
    const col = await collectionForFamily(family, version, cfg);
    const files = await fg(include, {
        cwd: rootPath,
        ignore: exclude,
        onlyFiles: true,
        dot: false,
    });
    const max = limit > 0 ? Math.min(limit, files.length) : files.length;
    let processed = 0;
    for (let i = 0; i < max; i++) {
        const rel = files[i];
        const abs = path.join(rootPath, rel);
        const raw = await fs.readFile(abs, 'utf8');
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

export async function reindexSubset(rootPath, globs, options = {}) {
    const include = Array.isArray(globs) ? globs : [String(globs)];
    const merged = { ...options, include };
    return reindexAll(rootPath, merged);
}

export async function search(rootPath, q, n = 8) {
    const family = process.env.COLLECTION_FAMILY || 'repo_files';
    const version = process.env.EMBED_VERSION || 'dev';
    const cfg = {
        driver: process.env.EMBEDDING_DRIVER || 'ollama',
        fn: process.env.EMBEDDING_FUNCTION || 'nomic-embed-text',
    };
    const col = await collectionForFamily(family, version, cfg);
    const r = await col.query({ queryTexts: [q], nResults: n });
    const ids = r.ids?.flat(2) || [];
    const docs = r.documents?.flat(2) || [];
    const metas = r.metadatas?.flat(2) || [];
    const dists = r.distances?.flat(2) || [];
    const out = [];
    for (let i = 0; i < docs.length; i++) {
        const m = metas[i] || {};
        out.push({
            id: ids[i],
            path: m.path,
            chunkIndex: m.chunkIndex,
            startLine: m.startLine,
            endLine: m.endLine,
            score: typeof dists[i] === 'number' ? dists[i] : undefined,
            text: docs[i],
        });
    }
    return out;
}
