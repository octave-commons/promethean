// @shared/ts/dist/fsMirrorGeneric.ts
import { promises as fs, Stats } from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

import { ensureDir } from './ensureDir.js';
import { streamTreeConcurrent, StreamNode } from './streamTreeGeneratorsConcurrent.js';

type OverwriteMode = 'always' | 'if-newer' | 'never';
type DeleteExtraMode = 'none' | 'files' | 'all';

export type MirrorOptions = {
    includeHidden?: boolean;
    maxDepth?: number;
    followSymlinks?: boolean;
    predicate?: (absPath: string, node: { isDirectory: boolean; name: string }) => boolean;

    /** File processing parallelism (read/transform/write). Default: 8 */
    concurrency?: number;

    /** Overwrite policy for writes/copies. Default: "if-newer" */
    overwrite?: OverwriteMode;

    /** Preserve atime/mtime from source when writing/copying. Default: true */
    preserveTimes?: boolean;

    /** Dry-run: don’t touch disk; return plan only. */
    dryRun?: boolean;

    /** Abort mid-run */
    signal?: AbortSignal;

    /** Optional debug logger */
    log?: (msg: string) => void;

    /** Enable content hashing to skip identical writes/copies. Default: true */
    hashCompare?: boolean;

    /** Hash algorithm; only sha256 implemented. */
    hashAlgorithm?: 'sha256';

    /**
     * Deletion sync:
     *  - "none": never delete anything in dst (default)
     *  - "files": delete files not produced; remove dirs only if they become empty
     *  - "all": same as "files", plus delete extra empty directories even if they existed before
     */
    deleteExtra?: DeleteExtraMode;

    /** Protect specific dst paths from deletion (return false to prevent delete). */
    deleteFilter?: (dstAbsPath: string, relPath: string) => boolean;
};

/** The input we pass to your handler — lazy readers to avoid unnecessary I/O. */
export type FileIn = {
    srcPath: string; // absolute
    relPath: string; // relative to src root
    name: string;
    ext: string;
    srcRoot: string;
    dstRoot: string;
    node: StreamNode;
    stat(): Promise<Stats>;
    text(): Promise<string>;
    bytes(): Promise<Buffer>;
};

/** What your handler returns to decide the mirrored result. */
export type HandlerResult =
    | 'copy'
    | 'skip'
    | {
          path?: string; // destination-relative path
          content?: string | Buffer; // if omitted (and not "copy"), creates empty file
          encoding?: BufferEncoding; // default 'utf8' if content is string
      };

export type MirrorStats = {
    filesProcessed: number;
    filesWritten: number;
    filesCopied: number;
    filesSkipped: number;
    dirsEnsured: number;
    deletedFiles: number;
    deletedDirs: number;
    errors: number;
    planned?: PlannedOp[];
};

export type PlannedOp =
    | { kind: 'mkdir'; path: string }
    | { kind: 'write'; dst: string; bytes: number; reason?: string }
    | { kind: 'copy'; src: string; dst: string; reason?: string }
    | { kind: 'skip'; src: string; reason: string }
    | { kind: 'deleteFile'; path: string }
    | { kind: 'deleteDir'; path: string }
    | { kind: 'error'; at: string; error: string };

/** Main entry: mirror a tree by delegating each file to your handler. */
export async function mirrorWithHandler(
    srcRoot: string,
    dstRoot: string,
    handler: (file: FileIn) => Promise<HandlerResult> | HandlerResult,
    opts: MirrorOptions = {},
): Promise<MirrorStats> {
    const {
        includeHidden = false,
        maxDepth = Infinity,
        followSymlinks = false,
        predicate,
        concurrency = 8,
        overwrite = 'if-newer',
        preserveTimes = true,
        dryRun = false,
        signal,
        log,
        hashCompare = true,
        hashAlgorithm = 'sha256',
        deleteExtra = 'none',
        deleteFilter = () => true,
    } = opts;

    const absSrc = path.resolve(srcRoot);
    const absDst = path.resolve(dstRoot);

    let filesProcessed = 0;
    let filesWritten = 0;
    let filesCopied = 0;
    let filesSkipped = 0;
    let dirsEnsured = 0;
    let deletedFiles = 0;
    let deletedDirs = 0;
    let errors = 0;
    const planned: PlannedOp[] = [];

    const keptFiles = new Set<string>(); // absolute dst file paths produced this run
    const keptDirs = new Set<string>(); // absolute dst dirs ensured/needed

    const dbg = (s: string) => log?.(s);
    const shouldStop = () => !!signal?.aborted;

    // Simple semaphore for bounded concurrency
    let active = 0;
    const waiters: Array<() => void> = [];
    const acquire = async () => {
        if (active < concurrency) {
            active++;
            return;
        }
        await new Promise<void>((res) => waiters.push(res));
        active++;
    };
    const release = () => {
        active--;
        waiters.shift()?.();
    };

    // Cache ensured dirs to minimize fs.mkdir calls
    const ensuredDirs = new Set<string>();
    const ensureDirCached = async (dir: string) => {
        const norm = path.normalize(dir);
        keptDirs.add(norm);
        if (ensuredDirs.has(norm) || dryRun) {
            if (!ensuredDirs.has(norm)) {
                planned.push({ kind: 'mkdir', path: norm });
                ensuredDirs.add(norm);
            }
            return;
        }
        await ensureDir(norm);
        ensuredDirs.add(norm);
        dirsEnsured++;
    };

    // Overwrite heuristic
    const needsWrite = async (src: string, dst: string): Promise<boolean> => {
        try {
            const stDst = await fs.stat(dst);
            if (overwrite === 'always') return true;
            if (overwrite === 'never') return false;
            // if-newer
            const stSrc = await fs.stat(src);
            return stSrc.mtimeMs > stDst.mtimeMs;
        } catch {
            return true; // dst doesn’t exist
        }
    };

    // Hash helpers
    async function fileHash(absPath: string): Promise<string> {
        const h = createHash(hashAlgorithm);
        const fh = await fs.open(absPath, 'r');
        try {
            const rs = fh.createReadStream();
            await new Promise<void>((resolve, reject) => {
                rs.on('data', (c) => h.update(c));
                rs.on('end', () => resolve());
                rs.on('error', reject);
            });
            return h.digest('hex');
        } finally {
            await fh.close().catch(() => {});
        }
    }
    function bufferHash(buf: Buffer | string, enc?: BufferEncoding): string {
        const h = createHash(hashAlgorithm);
        if (typeof buf === 'string') h.update(Buffer.from(buf, enc ?? 'utf8'));
        else h.update(buf);
        return h.digest('hex');
    }

    // In-flight tasks
    const tasks: Promise<void>[] = [];

    // Walk the tree and schedule file jobs
    for await (const ev of streamTreeConcurrent(absSrc, {
        includeHidden,
        maxDepth,
        followSymlinks,
        predicate: (abs, d) => {
            if (shouldStop()) return false;
            if (predicate) return predicate(abs, { isDirectory: d.isDirectory(), name: d.name });
            return true;
        },
        concurrency: Math.max(4, concurrency),
        ...(signal ? { signal } : {}),
    })) {
        if (shouldStop()) break;

        if (ev.type === 'enter' && ev.node?.type === 'dir') {
            const rel = ev.node.relative;
            const dstDir = path.join(absDst, rel);
            keptDirs.add(path.normalize(dstDir));
            planned.push({ kind: 'mkdir', path: dstDir });
            continue;
        }

        if (ev.type !== 'node' || ev.node?.type !== 'file') continue;

        const node = ev.node;
        const file: FileIn = makeFileIn(absSrc, absDst, node);

        const job = (async () => {
            await acquire();
            try {
                filesProcessed++;
                const decision = await handler(file);

                if (decision === 'skip') {
                    filesSkipped++;
                    planned.push({ kind: 'skip', src: file.srcPath, reason: 'handler: skip' });
                    return;
                }

                if (decision === 'copy') {
                    const dstPath = path.join(absDst, file.relPath);
                    keptFiles.add(path.normalize(dstPath));
                    await ensureDirCached(path.dirname(dstPath));

                    if (dryRun) {
                        planned.push({ kind: 'copy', src: file.srcPath, dst: dstPath, reason: 'planned' });
                        return;
                    }

                    // Overwrite + hashCompare
                    if (!(await needsWrite(file.srcPath, dstPath))) {
                        if (hashCompare) {
                            try {
                                const [hs, hd] = await Promise.all([fileHash(file.srcPath), fileHash(dstPath)]);
                                if (hs === hd) {
                                    filesSkipped++;
                                    planned.push({ kind: 'skip', src: file.srcPath, reason: 'identical hash' });
                                    return;
                                }
                            } catch {
                                // fall through to copy if hashing fails
                            }
                        } else {
                            filesSkipped++;
                            planned.push({ kind: 'skip', src: file.srcPath, reason: 'not newer' });
                            return;
                        }
                    }

                    if (!dryRun) {
                        await fs.copyFile(file.srcPath, dstPath);
                        if (preserveTimes) {
                            try {
                                const st = await fs.stat(file.srcPath);
                                await fs.utimes(dstPath, st.atime, st.mtime);
                            } catch {}
                        }
                    }
                    filesCopied++;
                    planned.push({ kind: 'copy', src: file.srcPath, dst: dstPath, reason: 'copied' });
                    return;
                }

                // Object result -> write content
                const outRel = sanitizeRel(decision.path ?? file.relPath);
                const dstPath = path.join(absDst, outRel);
                keptFiles.add(path.normalize(dstPath));
                await ensureDirCached(path.dirname(dstPath));

                const contentBuf =
                    typeof decision.content === 'string'
                        ? Buffer.from(decision.content, decision.encoding ?? 'utf8')
                        : decision.content ?? Buffer.alloc(0);

                if (dryRun) {
                    planned.push({ kind: 'write', dst: dstPath, bytes: contentBuf.byteLength, reason: 'planned' });
                    return;
                }

                // Overwrite + hashCompare
                let shouldWrite = await needsWrite(file.srcPath, dstPath);
                if (!shouldWrite && hashCompare) {
                    try {
                        const [hNew, hOld] = await Promise.all([bufferHash(contentBuf), fileHash(dstPath)]);
                        if (hNew !== hOld) shouldWrite = true;
                    } catch {
                        shouldWrite = true; // if hashing fails, err on writing
                    }
                }

                if (!shouldWrite) {
                    filesSkipped++;
                    planned.push({
                        kind: 'skip',
                        src: file.srcPath,
                        reason: hashCompare ? 'identical hash' : 'not newer',
                    });
                    return;
                }

                const tmp = dstPath + '.tmp-' + Math.random().toString(36).slice(2);
                await fs.writeFile(tmp, contentBuf);
                await fs.rename(tmp, dstPath);
                if (preserveTimes) {
                    try {
                        const st = await file.stat();
                        await fs.utimes(dstPath, st.atime, st.mtime);
                    } catch {}
                }
                filesWritten++;
                planned.push({ kind: 'write', dst: dstPath, bytes: contentBuf.byteLength, reason: 'written' });
            } catch (e: any) {
                errors++;
                planned.push({ kind: 'error', at: file.srcPath, error: String(e?.message || e) });
                dbg?.(`mirror error: ${file.srcPath}: ${e}`);
            } finally {
                release();
            }
        })();

        tasks.push(job);
    }

    await Promise.all(tasks);

    // --- Deletion sync ---------------------------------------------------------
    if (deleteExtra !== 'none') {
        const toDeleteFiles: string[] = [];
        const toDeleteDirs: string[] = [];

        // Collect existing dst files/dirs that are not in kept sets
        const dstBase = absDst;
        for await (const ev of streamTreeConcurrent(dstBase, {
            includeHidden: true,
            maxDepth: Infinity,
            followSymlinks: false,
            concurrency: Math.max(4, concurrency),
        })) {
            if (ev.type === 'node' && ev.node) {
                const abs = path.normalize(ev.node.path);
                const rel = path.relative(dstBase, abs);
                if (ev.node.type === 'file') {
                    if (!keptFiles.has(abs) && deleteFilter(abs, rel)) {
                        toDeleteFiles.push(abs);
                    }
                }
            }
            if (ev.type === 'exit' && ev.node?.type === 'dir') {
                const abs = path.normalize(ev.node.path);
                const rel = path.relative(dstBase, abs);
                // consider deleting dirs after files are removed
                if (!keptDirs.has(abs) && deleteFilter(abs, rel)) {
                    toDeleteDirs.push(abs);
                }
            }
        }

        // Delete files first
        for (const f of toDeleteFiles) {
            if (dryRun) {
                planned.push({ kind: 'deleteFile', path: f });
                continue;
            }
            try {
                await fs.rm(f, { force: true });
                deletedFiles++;
            } catch (e) {
                errors++;
                planned.push({ kind: 'error', at: f, error: String(e) });
            }
        }

        // Then delete empty dirs (bottom-up)
        if (deleteExtra === 'all' || deleteExtra === 'files') {
            // Sort dirs deepest-first to attempt empty removal
            toDeleteDirs.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
            for (const d of toDeleteDirs) {
                try {
                    const entries = await fs.readdir(d);
                    if (entries.length === 0) {
                        if (dryRun) {
                            planned.push({ kind: 'deleteDir', path: d });
                            continue;
                        }
                        await fs.rmdir(d);
                        deletedDirs++;
                    }
                } catch (e) {
                    // ignore non-empty or permission issues; record as error
                    // (rmdir throws if not empty or missing)
                    if (dryRun) continue;
                    errors++;
                    planned.push({ kind: 'error', at: d, error: String(e) });
                }
            }
        }
    }

    return {
        filesProcessed,
        filesWritten,
        filesCopied,
        filesSkipped,
        dirsEnsured,
        deletedFiles,
        deletedDirs,
        errors,
        ...(dryRun ? { planned } : {}),
    };
}

/** Build a lazy FileIn with cached stat/text/bytes */
function makeFileIn(srcRoot: string, dstRoot: string, node: StreamNode): FileIn {
    const srcPath = node.path;
    const relPath = node.relative;
    const name = path.basename(srcPath);
    const ext = node.ext ?? path.extname(name);
    let _stat: Stats | null = null;
    let _text: string | null = null;
    let _bytes: Buffer | null = null;

    return {
        srcPath,
        relPath,
        name,
        ext,
        srcRoot,
        dstRoot,
        node,
        async stat() {
            if (_stat) return _stat;
            _stat = await fs.stat(srcPath);
            return _stat;
        },
        async text() {
            if (_text != null) return _text;
            _text = await fs.readFile(srcPath, 'utf8');
            return _text;
        },
        async bytes() {
            if (_bytes) return _bytes;
            _bytes = await fs.readFile(srcPath);
            return _bytes;
        },
    };
}

function sanitizeRel(rel: string): string {
    if (!rel) return '';
    const norm = path.normalize(rel);
    if (norm.startsWith('..')) {
        throw new Error(`Refusing to write outside destination: ${rel}`);
    }
    return norm;
}
