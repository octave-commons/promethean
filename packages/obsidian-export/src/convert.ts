// GPL-3.0-only
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

type Opts = { srcDir: string; outDir: string };
type FileIndex = Map<string, string>; // key: normalized note id → absolute md path

export async function convertVault(opts: Opts): Promise<void> {
  const { srcDir, outDir } = opts;
  const src = path.resolve(srcDir);
  const out = path.resolve(outDir);

  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });

  // index all markdown files so [[wikilinks]] can resolve robustly
  const files = await walk(src);
  const mdFiles = files.filter((f) => f.toLowerCase().endsWith('.md'));
  const index: FileIndex = new Map(
    mdFiles.map((full) => {
      const id = normalizeId(path.basename(full, path.extname(full)));
      return [id, full];
    }),
  );

  // copy non-md assets 1:1
  await Promise.all(
    files
      .filter((f) => !f.toLowerCase().endsWith('.md'))
      .map(async (full) => {
        const rel = path.relative(src, full);
        const dest = path.join(out, rel);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(full, dest);
      }),
  );

  // convert md files
  for (const full of mdFiles) {
    const rel = path.relative(src, full);
    const dest = path.join(out, rel);
    const text = await fs.readFile(full, 'utf8');
    const converted = convertMarkdown(text, path.dirname(full), src, index);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, converted, 'utf8');
  }
}

// ---- core transforms ----

export function convertMarkdown(
  input: string,
  fileDirAbs: string,
  vaultRootAbs: string,
  index: FileIndex,
): string {
  let s = input;

  // 1) Callouts: > [!TYPE] Optional title
  // GitHub doesn't have native admonitions; render as blockquote + bold label
  s = s.replace(/^>\s*\[!([A-Z]+)\]\s*(.*)$/gm, (_m, t: string, title: string) => {
    const label = mapCallout(t);
    const head = title?.trim() ? `**${label}:** ${title.trim()}` : `**${label}**`;
    return `> ${head}`;
  });

  // 2) Embeds ![[...]] → images or links
  s = s.replace(/!\[\[([^\]]+)\]\]/g, (_m, inner: string) => {
    const { href, text, isImage } = resolveWiki(inner, fileDirAbs, vaultRootAbs, index);
    return isImage ? `![${text}](${href})` : `![${text}](${href})`; // if non-image embed, render as image alt to make it obvious it was an embed
  });

  // 3) Wikilinks [[target|alias]] / [[target#heading|alias]]
  s = s.replace(/\[\[([^\]]+)\]\]/g, (_m, inner: string) => {
    const { href, text } = resolveWiki(inner, fileDirAbs, vaultRootAbs, index);
    return `[${text}](${href})`;
  });

  return s;
}

// ---- helpers ----

const mapCallout = (t: string): string => {
  const m: Record<string, string> = {
    NOTE: 'Note',
    INFO: 'Info',
    TIP: 'Tip',
    WARNING: 'Warning',
    DANGER: 'Danger',
    SUCCESS: 'Success',
    QUESTION: 'Question',
    TODO: 'Todo',
    ABSTRACT: 'Abstract',
    EXAMPLE: 'Example',
  };
  return m[t] ?? t.charAt(0) + t.slice(1).toLowerCase();
};

function normalizeId(id: string): string {
  return id.trim().replace(/\s+/g, ' ').toLowerCase();
}

function slugifyHeading(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

function mdRelHref(fromAbs: string, toAbs: string): string {
  const rel = path.relative(path.dirname(fromAbs), toAbs);
  return rel.split(path.sep).join('/');
}

function resolveWiki(
  raw: string,
  fileDirAbs: string,
  vaultRootAbs: string,
  index: FileIndex,
): { href: string; text: string; isImage: boolean } {
  // parse [[target#heading|alias]]
  let target = raw,
    alias = '';
  const pipe = raw.indexOf('|');
  if (pipe >= 0) {
    alias = raw.slice(pipe + 1).trim();
    target = raw.slice(0, pipe).trim();
  }
  let heading = '';
  const hash = target.indexOf('#');
  if (hash >= 0) {
    heading = target.slice(hash + 1).trim();
    target = target.slice(0, hash).trim();
  }

  // detect images by extension hint or if target looks like an asset
  const isAsset = /\.[a-z0-9]{2,5}$/i.test(target);
  const isImage = isAsset && /\.(png|jpe?g|gif|webp|svg)$/i.test(target);

  // resolve to file:
  let targetAbs: string | null = null;

  if (isAsset) {
    // asset path relative to vault root or current file dir
    const tryAbs = [path.resolve(fileDirAbs, target), path.resolve(vaultRootAbs, target)];
    for (const a of tryAbs) {
      targetAbs = a; // we don't verify existence here; assets were copied 1:1
      break;
    }
  } else if (target.length) {
    // note name → find by case-insensitive basename in index
    const id = normalizeId(path.basename(target));
    const found = index.get(id);
    if (found) targetAbs = found;
  }

  // fallback: keep literal
  const display = alias || target || raw;
  if (!targetAbs) {
    // unresolved: link to original text to avoid breaking rendering
    return { href: encodeURI(display + '.md'), text: display, isImage: false };
  }

  // build href
  let href = mdRelHref(path.resolve(fileDirAbs, '_.md'), targetAbs); // trick to compute dir
  href = href.replace(/\/_.md$/, ''); // remove fake file
  if (!href.toLowerCase().endsWith('.md') && !isAsset) href += '.md';
  if (heading) href += '#' + slugifyHeading(heading);

  return {
    href: encodeURI(href),
    text: alias || path.basename(targetAbs, path.extname(targetAbs)),
    isImage,
  };
}

async function walk(root: string): Promise<string[]> {
  const out: string[] = [];
  const todo: string[] = [root];
  while (todo.length) {
    const dir = todo.pop()!;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.git')) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) todo.push(p);
      else out.push(p);
    }
  }
  return out;
}
