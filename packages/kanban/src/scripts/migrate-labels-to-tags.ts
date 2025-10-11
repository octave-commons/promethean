// @promethean/kanban — one-shot repo hygiene script
// Deprecate `labels` and canonicalize to YAML frontmatter `tags` (lowercase).
// - Merge frontmatter `labels` + inline `Tags:`/`tags:` body header into `tags`
// - Remove the inline `Tags:` header line from body (keep #hashtags untouched)
// - Sort/uniq tags; write only when changed (idempotent)

import fs from 'node:fs';
import path from 'node:path';

type Frontmatter = Record<string, any> & { tags?: string[]; labels?: string[] };

const ROOT = process.cwd();
const TASKS_DIR = path.join(ROOT, 'docs/agile/tasks');

function splitFrontmatter(src: string): { fm: string; body: string } {
  if (!src.startsWith('---\n')) return { fm: '', body: src };
  const end = src.indexOf('\n---\n', 4);
  if (end === -1) return { fm: '', body: src };
  const fm = src.slice(4, end);
  const body = src.slice(end + 5);
  return { fm, body };
}

function parseYamlLike(fm: string): Frontmatter {
  const out: any = {};
  const lines = fm.split(/\r?\n/);
  for (const line of lines) {
    const mArr = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!mArr) continue;
    const key = mArr[1];
    const val = mArr[2].trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      const items = val.slice(1, -1).split(/\s*,\s*/).filter(Boolean);
      out[key] = items.map((s) => s.replace(/^\"|\"$/g, ''));
    } else if (/^[\"'].*[\"']$/.test(val)) {
      out[key] = val.replace(/^\"|\"$/g, '');
    } else if (val === '' || val === 'null') {
      out[key] = '';
    } else {
      out[key] = val;
    }
  }
  return out;
}

function stringifyYamlLike(fm: Frontmatter): string {
  const order = ['uuid', 'title', 'status', 'priority', 'tags'];
  const keys = Array.from(new Set([...order, ...Object.keys(fm).filter((k) => k !== 'labels')])).filter(Boolean);
  return keys
    .map((k) => {
      const v = (fm as any)[k];
      if (v == null || v === '') return `${k}:`;
      if (Array.isArray(v)) {
        const arr = v.map((x) => (x.includes(',') ? `\"${x}\"` : x)).join(', ');
        return `${k}: [${arr}]`;
      }
      if (typeof v === 'string') return `${k}: ${v.includes(':') ? `\"${v}\"` : v}`;
      return `${k}: ${String(v)}`;
    })
    .join('\n');
}

function extractInlineTags(body: string): { tags: string[]; body: string } {
  const lines = body.split(/\r?\n/);
  const tags: string[] = [];
  const keep: string[] = [];
  const re = /^\s*(tags|Tags)\s*:\s*(.+)\s*$/;
  for (const ln of lines) {
    const m = ln.match(re);
    if (m) {
      const raw = m[2]
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('#') ? t.slice(1) : t));
      tags.push(...raw);
    } else {
      keep.push(ln);
    }
  }
  return { tags, body: keep.join('\n') };
}

function normalize() {
  if (!fs.existsSync(TASKS_DIR)) {
    console.error('tasks dir missing:', TASKS_DIR);
    process.exit(1);
  }
  const entries = fs.readdirSync(TASKS_DIR);
  let changed = 0;
  for (const name of entries) {
    if (!name.endsWith('.md')) continue;
    const file = path.join(TASKS_DIR, name);
    const src = fs.readFileSync(file, 'utf-8');
    const { fm, body } = splitFrontmatter(src);
    if (!fm) continue;
    const data = parseYamlLike(fm);
    const before = JSON.stringify({ tags: data.tags, labels: data.labels });
    const { tags: inlineTags, body: newBody } = extractInlineTags(body);
    const labels = Array.isArray(data.labels) ? data.labels : [];
    const fmTags = Array.isArray(data.tags) ? data.tags : [];
    const merged = Array.from(new Set([...fmTags, ...labels, ...inlineTags]))
      .map((t) => t.toLowerCase())
      .filter(Boolean)
      .sort();
    (data as any).tags = merged;
    delete (data as any).labels;
    const fmOut = stringifyYamlLike(data);
    const out = `---\n${fmOut}\n---\n${newBody}`;
    if (before !== JSON.stringify({ tags: data.tags, labels: undefined }) || body !== newBody) {
      fs.writeFileSync(file, out);
      changed++;
    }
  }
  console.log(`migrate-labels-to-tags: updated ${changed} files`);
}

normalize();
