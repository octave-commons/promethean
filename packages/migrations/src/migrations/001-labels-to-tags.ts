import fs from 'node:fs/promises';
import path from 'node:path';
import { globby } from 'globby';
import type { Ctx } from '../index';

export const id = 1;
export const name = 'labels-to-tags';

function toArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') return val.split(/[\n,]/g).flatMap(s => s.split(/[\s]+/g));
  return [];
}

const norm = (s: string) => s.trim().replace(/^#/, '').toLowerCase();

export async function up(ctx: Ctx): Promise<void> {
  const files = await globby(['docs/agile/tasks/**/*.md', 'docs/inbox/**/*.md'], { absolute: true, gitignore: true });
  let updated = 0;
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    let parsed;
    try {
      parsed = ctx.parseFrontmatter<Record<string, unknown>>(raw);
    } catch {
      // Best-effort: skip unparseable files; we want the migration infra, not data loss.
      console.warn('skip (unparseable frontmatter):', path.relative(process.cwd(), file));
      continue;
    }
    const fm = { ...(parsed.data as Record<string, unknown>) };
    const merged = Array.from(new Set([...toArray(fm.tags), ...toArray((fm as any).labels)].map(norm).filter(Boolean)));
    if ((fm as any).labels || JSON.stringify(merged) !== JSON.stringify(toArray(fm.tags))) {
      delete (fm as any).labels;
      (fm as any).tags = merged;
      const next = ctx.stringifyFrontmatter(parsed.content, fm);
      await fs.writeFile(file, next, 'utf8');
      updated++;
    }
  }
  console.log(`001 labels-to-tags: updated ${updated} files`);
}
