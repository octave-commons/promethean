// GPL-3.0-only
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import fg from 'fast-glob';
import matter from 'gray-matter';

// Types

type Category = {
  id: string;
  label: string;
  globs: string[];
  actors: Array<'semantic' | 'keyword' | 'fuzzy' | 'regex'>;
};

type SearchMode = 'semantic' | 'keyword' | 'fuzzy' | 'regex';

type FileHit = {
  path: string;
  title?: string;
  frontmatter?: Record<string, unknown>;
};

// Default categories; later we can load from config
const categories: Category[] = [
  {
    id: 'docs',
    label: 'Docs',
    globs: ['docs/**/*.md', 'docs/**/*.json'],
    actors: ['semantic', 'keyword', 'fuzzy', 'regex'],
  },
  {
    id: 'packages',
    label: 'Package READMEs',
    globs: ['packages/**/README.md'],
    actors: ['semantic', 'keyword', 'fuzzy', 'regex'],
  },
  {
    id: 'agile',
    label: 'Agile docs',
    globs: ['docs/agile/**/*.md'],
    actors: ['semantic', 'keyword', 'fuzzy', 'regex'],
  },
  {
    id: 'adr',
    label: 'ADRs',
    globs: ['docs/adr/**/*.md'],
    actors: ['semantic', 'keyword', 'fuzzy', 'regex'],
  },
];

const byId = new Map(categories.map((c) => [c.id, c]));

// Helpers

async function collectFiles(opts: { category?: string; pathGlob?: string }): Promise<string[]> {
  if (opts.pathGlob) {
    return fg(opts.pathGlob, { dot: false, onlyFiles: true });
  }
  const cat = opts.category ? byId.get(opts.category) : undefined;
  const fallback = byId.get('docs');
  const globs = cat?.globs ?? fallback?.globs ?? ['docs/**/*.md'];
  return fg(globs, { dot: false, onlyFiles: true });
}

function printTable(headers: string[], rows: Array<Array<string | number>>): void {
  const line = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  console.log(line);
  console.log(sep);
  for (const row of rows) {
    console.log(`| ${row.map((c) => String(c ?? '')).join(' | ')} |`);
  }
}

export async function commandView(file: string): Promise<void> {
  const content = await fs.readFile(file, 'utf8');
  console.log(content);
}

export async function commandSearch(
  mode: SearchMode,
  query: string,
  opts: { category?: string; path?: string; format?: string },
): Promise<void> {
  const category = opts.category;
  const pathGlob = opts.path;
  const format = opts.format ?? 'markdown';

  if (!query) {
    console.error('search requires a query string');
    return;
  }

  const files = await collectFiles({ category, pathGlob });
  const hits: Array<FileHit & { matched?: string }> = [];
  let regex: RegExp | null = null;
  if (mode === 'regex') {
    try {
      regex = new RegExp(query, 'i');
    } catch (err) {
      console.error('Invalid regex:', err);
      return;
    }
  }

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const lower = raw.toLowerCase();
    const parsed = matter(raw);
    const titleFromFm = parsed.data.title as string | undefined;
    const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1];
    const title = titleFromFm || heading;

    switch (mode) {
      case 'keyword': {
        if (!lower.includes(query.toLowerCase())) continue;
        hits.push({ path: file, title, frontmatter: parsed.data });
        break;
      }
      case 'regex': {
        if (!regex) continue;
        if (!regex.test(raw)) continue;
        hits.push({ path: file, title, frontmatter: parsed.data });
        break;
      }
      case 'fuzzy': {
        // placeholder: basic substring until fuzzy lib is wired
        if (!lower.includes(query.toLowerCase())) continue;
        hits.push({ path: file, title, frontmatter: parsed.data, matched: 'fuzzy-substring' });
        break;
      }
      case 'semantic': {
        // placeholder: semantic not implemented yet
        continue;
      }
      default:
        continue;
    }
  }

  if (mode === 'semantic') {
    console.log('Semantic search not wired yet (needs embedding + ES backend).');
    return;
  }

  if (format === 'json') {
    console.log(
      JSON.stringify(
        hits.map((h) => ({ path: h.path, title: h.title ?? '', frontmatter: h.frontmatter ?? {} })),
        null,
        2,
      ),
    );
    return;
  }

  if (!hits.length) {
    console.log('No matches.');
    return;
  }

  printTable(
    ['Path', 'Title', 'Status', 'Priority'],
    hits.map((h) => [
      h.path,
      h.title ?? '',
      (h.frontmatter?.status as string) ?? '',
      (h.frontmatter?.priority as string) ?? '',
    ]),
  );
}

export async function commandTasksSummary(opts: { format?: string }): Promise<void> {
  const format = opts.format ?? 'markdown';
  const files = await fg('docs/agile/tasks/**/*.md', { dot: false, onlyFiles: true });
  const tasks: Array<{
    path: string;
    title: string;
    status?: string;
    priority?: string;
    created_at?: string;
  }> = [];

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = matter(raw);
    const titleFromFm = parsed.data.title as string | undefined;
    const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1];
    tasks.push({
      path: file,
      title: titleFromFm || heading || path.basename(file),
      status: parsed.data.status as string | undefined,
      priority: parsed.data.priority as string | undefined,
      created_at: parsed.data.created_at as string | undefined,
    });
  }

  const byStatus = new Map<string, number>();
  for (const t of tasks) {
    if (!t.status) continue;
    byStatus.set(t.status, (byStatus.get(t.status) ?? 0) + 1);
  }

  const byPriority = new Map<string, number>();
  for (const t of tasks) {
    if (!t.priority) continue;
    byPriority.set(t.priority, (byPriority.get(t.priority) ?? 0) + 1);
  }

  const p0p1 = tasks
    .filter((t) => t.priority && /^(p0|p1)$/i.test(t.priority))
    .sort((a, b) => {
      const pr = (a.priority ?? '').localeCompare(b.priority ?? '');
      if (pr !== 0) return pr;
      return (b.created_at ?? '').localeCompare(a.created_at ?? '');
    });

  if (format === 'json') {
    console.log(
      JSON.stringify(
        {
          countsByStatus: Object.fromEntries(byStatus),
          countsByPriority: Object.fromEntries(byPriority),
          p0p1,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log('## Tasks by status');
  printTable(
    ['Status', 'Count'],
    Array.from(byStatus.entries()).map(([k, v]) => [k, v]),
  );
  console.log('\n## Tasks by priority');
  printTable(
    ['Priority', 'Count'],
    Array.from(byPriority.entries()).map(([k, v]) => [k, v]),
  );
  console.log('\n## P0/P1 tasks');
  printTable(
    ['Task', 'Priority', 'Status', 'Created', 'Path'],
    p0p1.map((t) => [t.title, t.priority ?? '', t.status ?? '', t.created_at ?? '', t.path]),
  );
}

// Commander wiring
const program = new Command();
program
  .name('promethean docs')
  .description('Docs search/view CLI (semantic stubbed)')
  .version('0.1.0');

program
  .command('view')
  .argument('<path>', 'path to markdown/json file')
  .action(async (file: string) => {
    await commandView(file);
  });

program
  .command('search')
  .argument('<mode>', 'semantic|keyword|fuzzy|regex')
  .argument('<query>', 'search query')
  .option('-c, --category <id>', 'category id')
  .option('-p, --path <glob>', 'override glob')
  .option('-f, --format <format>', 'markdown|json', 'markdown')
  .action(
    async (
      mode: SearchMode,
      query: string,
      opts: { category?: string; path?: string; format?: string },
    ) => {
      await commandSearch(mode, query, opts);
    },
  );

program
  .command('tasks')
  .description('Tasks utilities')
  .command('summary')
  .option('-f, --format <format>', 'markdown|json', 'markdown')
  .action(async (opts: { format?: string }) => {
    await commandTasksSummary(opts);
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

export { categories };
