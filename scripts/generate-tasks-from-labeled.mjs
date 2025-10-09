// Generate simple kanban task files from docs under docs/labeled
// Produces files in docs/agile/tasks/from-labeled
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes, randomUUID as nodeRandomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..');
const LABELED_DIR = path.join(REPO_ROOT, 'docs', 'labeled');
const OUT_DIR = path.join(REPO_ROOT, 'docs', 'agile', 'tasks', 'from-labeled');

function slugify(title) {
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-/,'')
    .replace(/-$/,'');
}

function extractTitle(md, fallback) {
  const lines = md.split(/\r?\n/);
  for (const line of lines) {
    const m = /^\s*#\s+(.+)\s*$/.exec(line);
    if (m) return m[1].trim();
  }
  return fallback;
}

function summarize(md, maxChars = 1200) {
  const clean = md
    .replace(/```[\s\S]*?```/g, '') // drop code fences
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return clean.slice(0, maxChars);
}

const generateUuid = () => {
  if (typeof nodeRandomUUID === 'function') {
    return nodeRandomUUID();
  }

  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const entries = await fs.readdir(LABELED_DIR, { withFileTypes: true });
  let created = 0;
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (!ent.name.toLowerCase().endsWith('.md')) continue;
    const srcPath = path.join(LABELED_DIR, ent.name);
    const md = await fs.readFile(srcPath, 'utf8');
    const base = path.parse(ent.name).name;
    const title = extractTitle(md, base);
    const slug = slugify(title || base) || base.toLowerCase();
    const outPath = path.join(OUT_DIR, `${slug}.md`);
    // Skip if already exists to avoid duplicates
    try {
      await fs.access(outPath);
      continue;
    } catch {}
    const uuid = generateUuid();
    const now = new Date().toISOString();
    const body = [
      '---',
      `uuid: "${uuid}"`,
      `title: "${title}"`,
      `slug: "${slug}"`,
      'status: "todo"',
      'priority: "P3"',
      'labels: ["docops", "labeled"]',
      `created_at: "${now}"`,
      'estimates:',
      '  complexity: ""',
      '  scale: ""',
      '  time_to_completion: ""',
      '---',
      '',
      '## 🗂 Source',
      '',
      `- Path: ${path.relative(REPO_ROOT, srcPath)}`,
      '',
      '## 📝 Context Summary',
      '',
      summarize(md),
      '',
      '## 📋 Tasks',
      '',
      '- [ ] Draft actionable subtasks from the summary',
      '- [ ] Define acceptance criteria',
      '- [ ] Link back to related labeled docs',
      '',
    ].join('\n');
    await fs.writeFile(outPath, body, 'utf8');
    created += 1;
  }
  console.log(`Created ${created} task(s) in ${path.relative(REPO_ROOT, OUT_DIR)}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

