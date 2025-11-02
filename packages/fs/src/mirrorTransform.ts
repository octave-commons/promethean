// @shared/ts/dist/fsMirror.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import { Readable, Transform, Writable } from 'stream';
import { pipeline as _pipeline } from 'stream/promises';

import { ensureDir } from './ensureDir.js';
import { streamTreeConcurrent, StreamEvent, StreamNode } from './streamTreeGeneratorsConcurrent.js';

type OverwriteMode = 'always' | 'if-newer' | 'never';

export type MirrorOptions = {
    includeHidden?: boolean;
    maxDepth?: number;
    followSymlinks?: boolean;

    /** How many FS ops in flight */
    concurrency?: number;

    /** Called to decide if a node should be processed */
    predicate?: (absPath: string, node: { isDirectory: boolean; name: string }) => boolean;

    /** Transform pipeline to apply to file contents (stream.Transforms composed left→right). */
    transforms?: Transform[] | ((info: FileInfo) => Transform[] | Promise<Transform[]>);

    /** Optionally remap output path (e.g., change extension) */
    mapPath?: (info: FileInfo) => string | Promise<string>;

    /** Skip/create/overwrite rules for files */
    overwrite?: OverwriteMode;

    /** Preserve mtime/atime from source */
    preserveTimes?: boolean;

    /** Copy symlinks instead of following (default: true) */
    preserveSymlinks?: boolean;

    /** Dry‑run: don’t write, just return plan */
    dryRun?: boolean;

    /** Emit debug logs */
    log?: (msg: string) => void;

    /** Abort mid‑run */
    signal?: AbortSignal;
};

export type FileInfo = {
    srcRoot: string;
    dstRoot: string;
    node: StreamNode;
    srcPath: string; // absolute
    dstPath: string; // absolute (after mapPath)
    relPath: string; // relative to srcRoot (before mapPath)
};

export type MirrorStats = {
    dirsCreated: number;
    filesWritten: number;
    filesSkipped: number;
    symlinksCreated: number;
    errors: number;
    planned?: PlannedOp[]; // when dryRun === true
};

export type PlannedOp =
    | { kind: 'mkdir'; path: string }
    | { kind: 'write'; src: string; dst: string }
    | { kind: 'skip'; src: string; dst: string; reason: string }
    | { kind: 'symlink'; src: string; dst: string; target: string }
    | { kind: 'error'; at: string; error: string };

const defaultMapPath = (info: FileInfo) => path.join(info.dstRoot, info.relPath);

export async function mirrorTree(srcRoot: string, dstRoot: string, opts: MirrorOptions = {}): Promise<MirrorStats> {
    const {
        includeHidden = false,
        maxDepth = Infinity,
        followSymlinks = false,
        concurrency = 16,
        predicate,
        transforms = [],
        mapPath = defaultMapPath,
        overwrite = 'if-newer',
        preserveTimes = true,
        preserveSymlinks = true,
        dryRun = false,
        log,
        signal,
    } = opts;

    const absSrc = path.resolve(srcRoot);
    const absDst = path.resolve(dstRoot);

    let dirsCreated = 0;
    let filesWritten = 0;
    let filesSkipped = 0;
    let symlinksCreated = 0;
    let errors = 0;
    const planned: PlannedOp[] = [];

    const dbg = (s: string) => log?.(s);

    const shouldStop = () => !!signal?.aborted;

    // Small helper: compose transforms into a single pipeline
    const getTransforms = async (info: FileInfo): Promise<Transform[]> => {
        if (typeof transforms === 'function') return await transforms(info);
        return transforms;
    };

    // Decide if we need to write dst based on overwrite policy
    async function needsWrite(src: string, dst: string): Promise<{ write: boolean; reason?: string }> {
        try {
            const dstStat = await fs.stat(dst);
            if (overwrite === 'always') return { write: true };
            if (overwrite === 'never') return { write: false, reason: 'exists' };
            // if-newer
            const srcStat = await fs.stat(src);
            return { write: srcStat.mtimeMs > dstStat.mtimeMs, reason: 'not newer' };
        } catch {
            // dst does not exist → write
            return { write: true };
        }
    }

    async function handleEnterDir(ev: StreamEvent) {
        if (!ev.node) return;
        const rel = ev.node.relative;
        const dstDir = path.join(absDst, rel);
        if (dryRun) {
            planned.push({ kind: 'mkdir', path: dstDir });
            return;
        }
        await ensureDir(dstDir);
        dirsCreated++;
    }

    async function handleSymlink(info: FileInfo) {
        if (!preserveSymlinks) return handleFile(info); // treat as file copy (follow already handled by walker)
        // replicate link if possible
        try {
            const target = await fs.readlink(info.srcPath);
            if (dryRun) {
                planned.push({ kind: 'symlink', src: info.srcPath, dst: info.dstPath, target });
                return;
            }
            await ensureDir(path.dirname(info.dstPath));
            try {
                await fs.lstat(info.dstPath);
                await fs.rm(info.dstPath, { force: true });
            } catch {}
            await fs.symlink(target, info.dstPath);
            symlinksCreated++;
            if (preserveTimes) {
                try {
                    const s = await fs.lstat(info.srcPath);
                    await fs.utimes(info.dstPath, s.atime, s.mtime);
                } catch {}
            }
        } catch (e: any) {
            errors++;
            planned.push({ kind: 'error', at: info.srcPath, error: String(e?.message || e) });
            dbg?.(`symlink error ${info.srcPath} -> ${info.dstPath}: ${e}`);
        }
    }

    async function handleFile(info: FileInfo) {
        const decision = await needsWrite(info.srcPath, info.dstPath);
        if (!decision.write) {
            filesSkipped++;
            planned.push({ kind: 'skip', src: info.srcPath, dst: info.dstPath, reason: decision.reason || 'exists' });
            return;
        }

        if (dryRun) {
            planned.push({ kind: 'write', src: info.srcPath, dst: info.dstPath });
            return;
        }

        await ensureDir(path.dirname(info.dstPath));

        const rs = fs.open(info.srcPath, 'r').then((fh) => {
            const s = fh.createReadStream();
            s.on('close', () => fh.close().catch(() => {}));
            return s;
        });

        const ts = await getTransforms(info);
        let srcStream: Readable = await rs;
        // Apply transforms in order
        for (const t of ts) {
            srcStream = srcStream.pipe(t);
        }

        // Write to temp then rename (atomic-ish)
        const tmp = info.dstPath + '.tmp-' + Math.random().toString(36).slice(2);
        const ws: Writable = (await fs.open(tmp, 'w')).createWriteStream();

        try {
            await _pipeline(srcStream, ws);
            await fs.rename(tmp, info.dstPath);
            filesWritten++;
            if (preserveTimes) {
                try {
                    const s = await fs.stat(info.srcPath);
                    await fs.utimes(info.dstPath, s.atime, s.mtime);
                } catch {}
            }
        } catch (e) {
            errors++;
            planned.push({ kind: 'error', at: info.srcPath, error: String(e) });
            dbg?.(`write error ${info.srcPath} -> ${info.dstPath}: ${e}`);
            try {
                await fs.rm(tmp, { force: true });
            } catch {}
        }
    }

    // Walk & act
    for await (const ev of streamTreeConcurrent(absSrc, {
        includeHidden,
        maxDepth,
        followSymlinks,
        predicate: (abs, d) => {
            if (shouldStop()) return false;
            if (predicate) return predicate(abs, { isDirectory: d.isDirectory(), name: d.name });
            return true;
        },
        concurrency,
        ...(signal ? { signal } : {}),
    })) {
        if (shouldStop()) break;
        if (!ev.node) continue;

        const rel = ev.node.relative;
        const infoBase: Omit<FileInfo, 'dstPath'> = {
            srcRoot: absSrc,
            dstRoot: absDst,
            node: ev.node,
            srcPath: ev.node.path,
            relPath: rel,
        };

        if (ev.type === 'enter' && ev.node.type === 'dir') {
            await handleEnterDir(ev);
        } else if (ev.type === 'node') {
            const draft: FileInfo = { ...infoBase, dstPath: await mapPath({ ...infoBase, dstPath: '' } as any) };
            if (ev.node.type === 'symlink') {
                await handleSymlink(draft);
            } else if (ev.node.type === 'file') {
                await handleFile(draft);
            }
        }
    }

    return {
        dirsCreated,
        filesWritten,
        filesSkipped,
        symlinksCreated,
        errors,
        ...(dryRun ? { planned } : {}),
    };
}

/** Helper to quickly make a line‑based text transform */
export function mapLines(mapper: (line: string) => string): Transform {
    let leftover = '';
    return new Transform({
        transform(chunk, _enc, cb) {
            const data = (leftover + chunk.toString('utf8')).split('\n');
            leftover = data.pop() ?? '';
            for (const line of data) this.push(mapper(line) + '\n');
            cb();
        },
        flush(cb) {
            if (leftover) this.push(mapper(leftover) + '\n');
            cb();
        },
    });
}
