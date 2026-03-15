// GPL-3.0-only
// ημ docs indexer: lazy markdown parse + backlinks cache.
//
// Run from repo root:
//   node scripts/eta_mu_docs_indexer.mjs

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const PARSER_VERSION = 'eta_mu_docs_indexer.v1';

const DEFAULT_MOUNTS_CONFIG = '.opencode/runtime/eta_mu_mounts.v1.json';
const DEFAULT_RUNTIME_DIR = '.opencode/runtime';

const INDEX_PATH = path.posix.join(DEFAULT_RUNTIME_DIR, 'eta_mu_docs_index.v1.jsonl');
const BACKLINKS_PATH = path.posix.join(
  DEFAULT_RUNTIME_DIR,
  'eta_mu_docs_backlinks.v1.jsonl',
);

/** @typedef {{ id: string, root: string, include?: string[], exclude?: string[] }} Mount */

const sha256Hex = (s) => createHash('sha256').update(s).digest('hex');

const stableId = (prefix, seed, width = 20) => {
  const token = sha256Hex(seed).slice(0, Math.max(8, width));
  return `${prefix}:${token}`;
};

const posixRel = (fromAbs, toAbs) => {
  const rel = path.relative(fromAbs, toAbs);
  return rel.split(path.sep).join('/');
};

const isSubpath = (rootAbs, candidateAbs) => {
  const rel = path.relative(rootAbs, candidateAbs);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
};

const shouldSkipDir = (name) =>
  name === 'node_modules' ||
  name === '.git' ||
  name === 'dist' ||
  name === 'build' ||
  name === 'coverage' ||
  name === '.cache' ||
  name === '.opencode' ||
  name === '.ημ' ||
  name === '.Π';

async function walkMarkdownFiles(rootAbs) {
  /** @type {string[]} */
  const out = [];
  /** @type {string[]} */
  const todo = [rootAbs];

  while (todo.length) {
    const dir = todo.pop();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.#')) continue;
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (shouldSkipDir(e.name)) continue;
        todo.push(abs);
      } else if (e.isFile()) {
        if (e.name.toLowerCase().endsWith('.md')) out.push(abs);
      }
    }
  }
  return out;
}

function stripFencedCodeBlocks(markdown) {
  // Remove ```...``` blocks (keeps line count roughly by replacing with blank lines)
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  const out = [];
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      out.push('');
      continue;
    }
    out.push(inFence ? '' : line);
  }
  return out.join('\n');
}

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { frontmatter: '', body: text };
  const lines = text.split(/\r?\n/);
  if (lines[0].trim() !== '---') return { frontmatter: '', body: text };

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return { frontmatter: '', body: text };

  return {
    frontmatter: lines.slice(1, end).join('\n'),
    body: lines.slice(end + 1).join('\n'),
  };
}

function parseFrontmatterScalar(frontmatter, key) {
  const re = new RegExp(`^${key}:\\s*(.+)\\s*$`, 'm');
  const m = frontmatter.match(re);
  if (!m) return '';
  return String(m[1] ?? '').trim().replace(/^['"]|['"]$/g, '');
}

function parseFrontmatterTags(frontmatter) {
  // Supports:
  // tags: [a, b]
  // tags: ['a', "b"]
  // tags:\n  - a\n  - b
  const lines = frontmatter.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^tags:\s*(.*)\s*$/);
    if (!m) continue;
    const rest = (m[1] ?? '').trim();
    if (rest.startsWith('[') && rest.endsWith(']')) {
      const inner = rest.slice(1, -1);
      for (const item of inner.split(',')) {
        const t = item.trim().replace(/^['"]|['"]$/g, '');
        if (t) out.push(t);
      }
      return out;
    }
    // multiline list
    for (let j = i + 1; j < lines.length; j++) {
      const li = lines[j];
      const mm = li.match(/^\s*-\s*(.+)\s*$/);
      if (!mm) break;
      const t = String(mm[1] ?? '').trim().replace(/^['"]|['"]$/g, '');
      if (t) out.push(t);
      i = j;
    }
    return out;
  }
  return out;
}

function normalizeTag(t) {
  return String(t)
    .trim()
    .replace(/^#/, '')
    .replace(/^\[|\]$/g, '')
    .replace(/^['"]|['"]$/g, '')
    .trim()
    .toLowerCase();
}

function extractInlineTags(text) {
  const tags = [];
  const re = /(^|\s)#([a-zA-Z0-9_-]{1,64})\b/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const t = normalizeTag(m[2] ?? '');
    if (t) tags.push(t);
  }
  return tags;
}

function extractHashtagsLines(text) {
  // `#hashtags: #a #b`
  const tags = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^#hashtags:\s*(.*)$/i);
    if (!m) continue;
    const rest = String(m[1] ?? '');
    for (const raw of rest.split(/\s+/g)) {
      if (!raw.startsWith('#')) continue;
      const t = normalizeTag(raw);
      if (t) tags.push(t);
    }
  }
  return tags;
}

function extractHeadings(text) {
  const headings = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length;
    const title = String(m[2] ?? '').trim();
    headings.push({ level, title });
  }
  return headings;
}

function extractWikilinks(text) {
  /** @type {{ target: string, alias: string, raw: string, index: number }[]} */
  const out = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const rawInner = String(m[1] ?? '').trim();
    if (!rawInner) continue;
    const [left, right] = rawInner.split('|');
    const target = String(left ?? rawInner).trim();
    const alias = String(right ?? '').trim();
    out.push({ target, alias, raw: rawInner, index: m.index });
  }
  return out;
}

function extractMarkdownLinks(text) {
  /** @type {{ url: string, text: string, index: number }[]} */
  const out = [];
  // naive: [text](url) but not images
  const re = /(^|[^!])\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const label = String(m[2] ?? '').trim();
    const url = String(m[3] ?? '').trim();
    if (!url) continue;
    out.push({ url, text: label, index: m.index });
  }
  return out;
}

function lineNumberAt(text, index) {
  // 1-indexed
  let line = 1;
  for (let i = 0; i < Math.min(index, text.length); i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}

function normalizeWikilinkKey(target) {
  // Obsidian-ish normalization for lookup:
  // - drop alias (already removed)
  // - keep heading part but normalize whitespace/case
  return String(target)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

async function loadExistingIndex(repoRootAbs) {
  const indexAbs = path.join(repoRootAbs, INDEX_PATH);
  /** @type {any[]} */
  const rows = [];
  try {
    const raw = await fs.readFile(indexAbs, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const s = line.trim();
      if (!s) continue;
      try {
        const row = JSON.parse(s);
        if (row && typeof row === 'object') rows.push(row);
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  /** @type {Map<string, any>} */
  const byPath = new Map();
  /** @type {Map<string, any>} */
  const byContent = new Map();
  for (const row of rows) {
    const mountId = String(row.mount_id ?? '');
    const rel = String(row.source_rel_path ?? '');
    const content = String(row.content_sha256 ?? '');
    if (mountId && rel) byPath.set(`${mountId}:${rel}`, row);
    if (content) byContent.set(content, row);
  }

  return { rows, byPath, byContent };
}

async function main() {
  const repoRootAbs = process.cwd();
  const mountsAbs = path.join(repoRootAbs, DEFAULT_MOUNTS_CONFIG);
  const runtimeAbs = path.join(repoRootAbs, DEFAULT_RUNTIME_DIR);

  await fs.mkdir(runtimeAbs, { recursive: true });

  /** @type {{ mounts: Mount[] }} */
  const mountsDoc = JSON.parse(await fs.readFile(mountsAbs, 'utf8'));
  const mounts = Array.isArray(mountsDoc.mounts) ? mountsDoc.mounts : [];

  const existing = await loadExistingIndex(repoRootAbs);

  /** @type {any[]} */
  const nextRows = [];
  /** @type {Array<{ target_key: string, edge: any }>} */
  const backlinks = [];

  for (const mount of mounts) {
    const mountId = String(mount.id ?? '').trim();
    const mountRoot = String(mount.root ?? '').trim();
    if (!mountId || !mountRoot) continue;

    const mountRootAbs = path.resolve(repoRootAbs, mountRoot);
    if (!isSubpath(repoRootAbs, mountRootAbs) && mountRootAbs !== repoRootAbs) {
      continue;
    }

    const files = await walkMarkdownFiles(mountRootAbs);
    for (const absPath of files) {
      const rel = posixRel(repoRootAbs, absPath);
      const st = await fs.stat(absPath);
      const bytes = Number(st.size);
      const mtimeNs = Number(st.mtimeNs);
      const mtimeUtc = new Date(st.mtimeMs).toISOString();

      const cacheKey = `${mountId}:${rel}`;
      const prevByPath = existing.byPath.get(cacheKey);

      // Fast path: reuse cached parse without reading file.
      const cachedOk =
        prevByPath &&
        String(prevByPath.parser_version ?? '') === PARSER_VERSION &&
        Number(prevByPath.mtime_ns ?? -1) === mtimeNs &&
        Number(prevByPath.bytes ?? -1) === bytes;

      if (cachedOk) {
        const entityId = String(prevByPath.entity_id ?? stableId('doc', cacheKey, 20));
        nextRows.push({ ...prevByPath, entity_id: entityId, mtime_utc: mtimeUtc });

        const links = Array.isArray(prevByPath.links) ? prevByPath.links : [];
        for (const link of links) {
          if (link?.kind !== 'wikilink') continue;
          const targetKey = String(link.target_key ?? '');
          if (!targetKey) continue;
          backlinks.push({
            target_key: targetKey,
            edge: {
              kind: 'wikilink',
              src_entity_id: entityId,
              src_rel_path: rel,
              target: String(link.target ?? ''),
              target_key: targetKey,
              line: Number(link.line ?? 0),
            },
          });
        }
        continue;
      }

      // Slow path: read + hash + parse.
      const text = await fs.readFile(absPath, 'utf8');
      const contentSha = sha256Hex(text);
      const prevByContent = existing.byContent.get(contentSha);

      const { frontmatter, body } = parseFrontmatter(text);
      const uuid = parseFrontmatterScalar(frontmatter, 'uuid');

      let entityId = '';
      if (uuid) entityId = `doc:${uuid}`;
      else if (prevByPath?.entity_id) entityId = String(prevByPath.entity_id);
      else if (prevByContent?.entity_id) entityId = String(prevByContent.entity_id);
      else entityId = stableId('doc', `${mountId}:${rel}`, 20);

      const bodyNoCode = stripFencedCodeBlocks(body);
      const headings = extractHeadings(bodyNoCode);
      const title =
        headings.find((h) => h.level === 1)?.title || path.posix.basename(rel);
      const frontmatterTags = parseFrontmatterTags(frontmatter).map(normalizeTag);
      const inlineTags = extractInlineTags(bodyNoCode);
      const hashtagTags = extractHashtagsLines(text);

      const tags = Array.from(
        new Set([...frontmatterTags, ...inlineTags, ...hashtagTags].filter(Boolean)),
      );

      const wikilinks = extractWikilinks(bodyNoCode);
      const mdLinks = extractMarkdownLinks(bodyNoCode);

      /** @type {any[]} */
      const links = [];
      for (const w of wikilinks) {
        const line = lineNumberAt(bodyNoCode, w.index);
        const targetKey = normalizeWikilinkKey(w.target);
        links.push({
          kind: 'wikilink',
          target: w.target,
          target_key: targetKey,
          alias: w.alias,
          line,
        });
        backlinks.push({
          target_key: targetKey,
          edge: {
            kind: 'wikilink',
            src_entity_id: entityId,
            src_rel_path: rel,
            target: w.target,
            target_key: targetKey,
            line,
          },
        });
      }
      for (const l of mdLinks) {
        const line = lineNumberAt(bodyNoCode, l.index);
        links.push({ kind: 'markdown', url: l.url, text: l.text, line });
      }

      nextRows.push({
        record: 'ημ.docs-index.v1',
        parser_version: PARSER_VERSION,
        extracted_at: new Date().toISOString(),
        entity_id: entityId,
        mount_id: mountId,
        source_rel_path: rel,
        bytes,
        mtime_ns: mtimeNs,
        mtime_utc: mtimeUtc,
        content_sha256: contentSha,
        title,
        headings,
        tags,
        links,
      });
    }
  }

  // Write index (sorted for stability).
  nextRows.sort((a, b) =>
    String(a.source_rel_path ?? '').localeCompare(String(b.source_rel_path ?? '')),
  );
  const indexAbs = path.join(repoRootAbs, INDEX_PATH);
  await fs.writeFile(
    indexAbs,
    nextRows.map((r) => JSON.stringify(r)).join('\n') + '\n',
    'utf8',
  );

  // Build backlinks aggregation.
  /** @type {Map<string, any>} */
  const byTarget = new Map();
  for (const { target_key, edge } of backlinks) {
    if (!byTarget.has(target_key)) byTarget.set(target_key, []);
    byTarget.get(target_key).push(edge);
  }

  const backlinkRows = [];
  const keys = Array.from(byTarget.keys()).sort();
  for (const key of keys) {
    const edges = byTarget.get(key) ?? [];
    backlinkRows.push({
      record: 'ημ.docs-backlinks.v1',
      generated_at: new Date().toISOString(),
      target_key: key,
      sources: edges,
    });
  }

  const backlinksAbs = path.join(repoRootAbs, BACKLINKS_PATH);
  await fs.writeFile(
    backlinksAbs,
    backlinkRows.map((r) => JSON.stringify(r)).join('\n') + '\n',
    'utf8',
  );

  process.stdout.write(
    `ok docs_index=${INDEX_PATH} backlinks=${BACKLINKS_PATH} files=${nextRows.length}\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
