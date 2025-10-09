import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'node:url';

import matter from 'gray-matter';
import { scanFiles } from '@promethean/file-indexer';
import type { IndexedFile } from '@promethean/file-indexer';

import { parseArgs, slugify, extnamePrefer } from "./utils.js";
import type { Front } from "./types.js";
import type { DBs } from "./db.js";
// CLI

export type RenameOptions = { dir: string; dryRun?: boolean; files?: string[] };
export type RenameProgress = {
  step: "rename";
  done: number;
  total?: number;
};
export type RenameResult = {
  renamed: Array<{ from: string; to: string; uuid?: string }>;
};
let ROOT = path.resolve("docs/unique");
let DRY = false;

async function exists(p: string) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

const updateDocPath = async (
  db: DBs | undefined,
  fm: Front,
  target: string,
) => {
  if (!db?.docs || !fm.uuid) return;
  const uuid = fm.uuid;
  try {
    const prev = await db.docs.get(uuid);
    const title = prev?.title ?? fm.title ?? fm.filename ?? path.basename(target);
    await db.docs.put(uuid, {
      path: target,
      title,
    });
  } catch {
    const title = fm.title ?? fm.filename ?? path.basename(target);
    await db.docs.put(uuid, {
      path: target,
      title,
    });
  }
};

function isNotFoundError(error: unknown): boolean {
  const err = error as { notFound?: boolean; code?: string } | null | undefined;
  return Boolean(err?.notFound || err?.code === 'LEVEL_NOT_FOUND');
}

/**
 * Update persisted DocOps state after a rename so LevelDB metadata reflects the
 * new document path. Keeps the docs index and chunk references in sync with the
 * file system so subsequent pipeline stages work with the renamed file.
 */
async function updateDocState(
  db: Pick<DBs, 'docs' | 'chunks'> | undefined,
  uuid: string | undefined,
  target: string,
  front: Front,
): Promise<void> {
  if (!db || !uuid) return;

  if (db.docs) {
    let existingTitle: string | undefined;
    try {
      const record = await db.docs.get(uuid);
      existingTitle = record?.title;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }

    const derivedTitle = existingTitle ?? front.title ?? front.filename ?? path.parse(target).name;

    await db.docs.put(uuid, {
      path: target,
      title: derivedTitle,
    });
  }

  if (db.chunks) {
    try {
      const current = await db.chunks.get(uuid);
      if (Array.isArray(current)) {
        const updated = current.map((chunk) =>
          typeof chunk === 'object' && chunk !== null ? { ...chunk, docPath: target } : chunk,
        ) as typeof current;
        await db.chunks.put(uuid, updated);
      }
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  }
}

export async function runRename(
  opts: RenameOptions,
  db?: Pick<DBs, 'docs' | 'chunks'>,
  onProgress?: (info: { step: 'rename'; done: number; total: number }) => void,
) {
  ROOT = path.resolve(opts.dir);
  DRY = Boolean(opts.dryRun);
  const exts = new Set(['.md', '.mdx', '.txt']);
  const wanted =
    opts.files && opts.files.length
      ? new Set(opts.files.map((p) => path.resolve(p)))
      : null;
  const renamed: RenameResult["renamed"] = [];
  let processed = 0;
  await scanFiles({
    root: ROOT,
    exts,
    readContent: true,
    onFile: async (file: IndexedFile, progress) => {
      const report = () => {
        processed += 1;
        if (progress) {
          onProgress?.({
            step: 'rename',
            done: processed,
            total: progress.total,
          });
        }
      };
      const abs = path.isAbsolute(file.path)
        ? path.resolve(file.path)
        : path.resolve(ROOT, file.path);
      if (wanted && !wanted.has(abs)) return;
      const raw = file.content ?? (await fs.readFile(abs, 'utf-8'));
      const fm = (matter(raw).data || {}) as Front;
      if (!fm.filename) {
        report();
        return;
      }
      const uuid = typeof fm.uuid === 'string' ? fm.uuid : undefined;

      const want = slugify(fm.filename) + extnamePrefer(abs);
      const dir = path.dirname(abs);
      const currentBase = path.basename(abs);
      processed++;
      if (currentBase === want) {
        await updateDocPath(db, fm, abs);
        onProgress?.({ step: "rename", done: processed });
        return;
      }

      let target = path.join(dir, want);
      let i = 1;
      while (await exists(target)) {
        const base = slugify(fm.filename) + (i > 1 ? `-${i}` : '');
        target = path.join(dir, base + extnamePrefer(abs));
        i++;
      }
      if (DRY) console.log(`Would rename: ${abs} -> ${target}`);
      else {
        await fs.rename(abs, target);
        await updateDocPath(db, fm, target);
      }
      renamed.push({ from: abs, to: target, uuid: fm.uuid });
      onProgress?.({ step: "rename", done: processed });
    },
  });
  console.log("06-rename: done.");
  return { renamed };
}
const isDirect = !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({ '--dir': 'docs/unique', '--dry-run': 'false' });
  const dir = args['--dir'] ?? 'docs/unique';
  const dryRun = (args['--dry-run'] ?? 'false') === 'true';
  const { openDB } = await import('./db.js');
  const db = await openDB();
  try {
    await runRename({ dir, dryRun }, db);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await db.root.close();
  }
}
