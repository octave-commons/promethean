import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import { embedTexts, cosine } from './embed.js';

export async function* iterMarkdownChunks(file, minChars, fileEx) {
    const raw = await fs.readFile(file, 'utf8');
    // naive paragraph chunking; can be swapped for heading-aware later
    const parts = raw
        .split(/\n{2,}/g)
        .map((s) => s.trim())
        .filter(Boolean);
    let idx = 0;
    for (const p of parts) {
        const txt = p.trim();
        if (!txt) continue;
        if (txt.length >= minChars && !shouldExcludeFileByName(file, fileEx)) {
            yield { offset: idx, text: txt };
        }
        idx++;
    }
}

function shouldExcludeFileByName(absPath, fileEx) {
    if (!fileEx || !fileEx.length) return false;
    const base = path.basename(absPath);
    return fileEx.some((needle) => needle && base.includes(needle));
}

export async function rebuildIndex(env) {
    const idxDir = env.index.dir;
    await fs.mkdir(idxDir, { recursive: true });
    // wipe old shards
    for (const f of await fs.readdir(idxDir)) {
        if (f.endsWith('.json')) await fs.rm(path.join(idxDir, f));
    }

    const files = await fg(env.sources.include_glob, {
        cwd: env.sources.vault_path,
        ignore: env.sources.exclude_glob,
        dot: false,
        onlyFiles: true,
        unique: true,
    });

    let shard = [];
    let shardNo = 0;
    const shardSize = env.index.shard_size;

    for (const rel of files) {
        const abs = path.join(env.sources.vault_path, rel);
        let chunkIdx = 0;
        for await (const c of iterMarkdownChunks(
            abs,
            env.sources.min_chars,
            env.sources.file_exclusions,
        )) {
            const [vec] = await embedTexts([c.text], env.embedding);
            shard.push({ id: `${rel}#${c.offset}`, path: rel, chunk: c.text, embedding: vec });
            if (shard.length >= shardSize) {
                shardNo = await flushShard(idxDir, shardNo, shard);
                shard = [];
            }
            chunkIdx++;
        }
    }
    if (shard.length) {
        shardNo = await flushShard(idxDir, shardNo, shard);
    }
    return shardNo;
}

async function flushShard(idxDir, shardNo, shard) {
    const outPath = path.join(idxDir, `shard-${String(shardNo + 1).padStart(4, '0')}.json`);
    await fs.writeFile(outPath, JSON.stringify(shard), 'utf8');
    return shardNo + 1;
}

export async function searchIndex(env, q, k = 8) {
    const idxDir = env.index.dir;
    let shards = [];
    try {
        shards = (await fs.readdir(idxDir)).filter((f) => f.endsWith('.json'));
    } catch {
        return [];
    }
    const [qv] = await embedTexts([q], env.embedding);
    const results = [];
    for (const f of shards) {
        const arr = JSON.parse(await fs.readFile(path.join(idxDir, f), 'utf8'));
        for (const it of arr) {
            const score = cosine(qv, it.embedding);
            results.push({ score, path: it.path, chunk: it.chunk });
        }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
}
