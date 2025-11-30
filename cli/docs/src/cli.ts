// GPL-3.0-only
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { Argument, Command, InvalidArgumentError, Option, OptionValues } from 'commander';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { pathToFileURL } from 'node:url';
import { openLmdbCache, type Cache } from '@promethean-os/lmdb-cache';
import { makeDeterministicEmbedder } from '@promethean-os/embedding';
import { semanticSearchElastic, ElasticSearchConfig } from './elastic.js';
import { loadDocsForEmbedding, embedWithOllama } from './semantic.js';

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

type Format = 'markdown' | 'json';

type IoConfig = {
  stdout?: (str: string) => void;
  stderr?: (str: string) => void;
  exitOverride?: boolean;
};

const programVersion = '0.1.0';

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
const searchModes: SearchMode[] = ['semantic', 'keyword', 'fuzzy', 'regex'];
const formats: Format[] = ['markdown', 'json'];

// Helpers

const EMBED_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_TRUNCATE_CHARS = 4000;
const DEFAULT_LOCAL_DIM = 384;

function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function normalizeDir(input: string): string {
  const resolved = path.resolve(input);
  if (!resolved) throw new InvalidArgumentError('cwd must resolve to a path');
  return resolved;
}

function passthroughPath(file: string): string {
  if (!file) {
    throw new InvalidArgumentError('path is required');
  }
  return file;
}

function parseMode(input: string): SearchMode {
  const mode = input.toLowerCase() as SearchMode;
  if (!searchModes.includes(mode)) {
    throw new InvalidArgumentError(`mode must be one of: ${searchModes.join(', ')}`);
  }
  return mode;
}

function parseFormat(input: string): Format {
  const fmt = input.toLowerCase() as Format;
  if (!formats.includes(fmt)) {
    throw new InvalidArgumentError(`format must be one of: ${formats.join(', ')}`);
  }
  return fmt;
}

async function collectFiles(opts: {
  category?: string;
  pathGlob?: string;
  cwd?: string;
  absolute?: boolean;
}): Promise<string[]> {
  const { cwd, absolute } = opts;
  if (opts.pathGlob) {
    return fg(opts.pathGlob, { dot: false, onlyFiles: true, cwd, absolute });
  }
  const cat = opts.category ? byId.get(opts.category) : undefined;
  const fallback = byId.get('docs');
  const globs = cat?.globs ?? fallback?.globs ?? ['docs/**/*.md'];
  return fg(globs, { dot: false, onlyFiles: true, cwd, absolute });
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

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function resolveCache(cwd: string, customPath?: string): Cache<number[]> {
  const cachePath =
    customPath ?? process.env.DOCS_CACHE_PATH ?? path.join(cwd, '.cache', 'docs-cli');
  return openLmdbCache<number[]>({
    path: cachePath,
    namespace: 'semantic',
    defaultTtlMs: EMBED_CACHE_TTL,
  });
}

async function embedWithCache(
  cache: Cache<number[]> | undefined,
  key: string,
  embedFn: () => Promise<number[]>,
): Promise<number[]> {
  if (!cache) return embedFn();
  const cached = await cache.get(key);
  if (cached) return cached;
  const value = await embedFn();
  await cache.set(key, value, { ttlMs: EMBED_CACHE_TTL });
  return value;
}

export async function commandView(
  file: string,
  opts: { encoding?: BufferEncoding; cwd?: string },
): Promise<void> {
  const cwd = opts.cwd ?? process.cwd();
  const target = path.isAbsolute(file) ? file : path.join(cwd, file);
  const content = await fs.readFile(target, opts.encoding ?? 'utf8');
  console.log(content);
}

export async function commandSearch(
  mode: SearchMode,
  query: string,
  opts: {
    category?: string;
    path?: string;
    format?: Format;
    cwd?: string;
    absolute?: boolean;
    limit?: number;
    esUrl?: string;
    esIndex?: string;
    esApiKey?: string;
    esUser?: string;
    esPassword?: string;
    esCa?: string;
    esField?: string[];
    chromaPath?: string;
    chromaCollection?: string;
    ollamaUrl?: string;
    ollamaModel?: string;
    lmdbPath?: string;
    localEmbedDim?: number;
    localEmbedModel?: string;
    transformersModel?: string;
    transformersCache?: string;
    transformersDevice?: string;
  },
): Promise<void> {
  const category = opts.category;
  const pathGlob = opts.path;
  const format = opts.format ?? 'markdown';
  const cwd = opts.cwd ?? process.cwd();

  if (!query) {
    throw new InvalidArgumentError('search requires a query string');
  }

  if (mode === 'semantic') {
    const esUrl = opts.esUrl ?? process.env.DOCS_ES_URL;
    const chromaPath = opts.chromaPath ?? process.env.DOCS_CHROMA_PATH;
    const chromaCollection = opts.chromaCollection ?? process.env.DOCS_CHROMA_COLLECTION;
    const ollamaUrl = opts.ollamaUrl ?? process.env.DOCS_OLLAMA_URL;
    const ollamaModel = opts.ollamaModel ?? process.env.DOCS_OLLAMA_MODEL;
    const localEmbedModel =
      opts.localEmbedModel ?? process.env.DOCS_LOCAL_EMBED_MODEL ?? 'local-hash';
    const localEmbedDim =
      opts.localEmbedDim ?? (Number(process.env.DOCS_LOCAL_EMBED_DIM ?? '') || DEFAULT_LOCAL_DIM);

    if (esUrl) {
      const esFieldsEnv = process.env.DOCS_ES_FIELDS
        ? process.env.DOCS_ES_FIELDS.split(',')
            .map((f) => f.trim())
            .filter(Boolean)
        : undefined;
      const esConfig: ElasticSearchConfig = {
        url: esUrl,
        index: opts.esIndex ?? process.env.DOCS_ES_INDEX ?? 'docs',
        apiKey: opts.esApiKey ?? process.env.DOCS_ES_API_KEY,
        username: opts.esUser ?? process.env.DOCS_ES_USER,
        password: opts.esPassword ?? process.env.DOCS_ES_PASSWORD,
        caPath: opts.esCa ?? process.env.DOCS_ES_CA,
        fields: opts.esField && opts.esField.length ? opts.esField : esFieldsEnv,
        size: opts.limit,
        sourceFields: ['path', 'title', 'frontmatter'],
      };

      try {
        const semanticHits = await semanticSearchElastic(query, esConfig);
        if (format === 'json') {
          console.log(
            JSON.stringify(
              semanticHits.map((h) => ({
                path: h.path,
                title: h.title ?? '',
                frontmatter: h.frontmatter ?? {},
                score: h.score ?? undefined,
                highlights: h.highlights ?? [],
              })),
              null,
              2,
            ),
          );
          return;
        }
        if (!semanticHits.length) {
          console.log('No matches.');
          return;
        }

        printTable(
          ['Path', 'Title', 'Score', 'Highlight'],
          semanticHits.map((h) => [h.path, h.title ?? '', h.score ?? '', h.highlights?.[0] ?? '']),
        );
        return;
      } catch (err) {
        console.error('Semantic search failed:', err instanceof Error ? err.message : String(err));
        throw err instanceof Error ? err : new Error(String(err));
      }
    }

    const files = await collectFiles({ category, pathGlob, cwd, absolute: true });
    const docs = await loadDocsForEmbedding(files, cwd, DEFAULT_TRUNCATE_CHARS);
    const cache = resolveCache(cwd, opts.lmdbPath);

    const computeAndEmit = async (
      backendId: string,
      embedFn: (text: string) => Promise<number[]>,
    ): Promise<void> => {
      const queryKey = `query:${backendId}:${hashText(query)}`;
      const queryEmbedding = await embedWithCache(cache, queryKey, () => embedFn(query));

      const hits = await Promise.all(
        docs.map(async (doc) => {
          const docText = `${doc.title ?? ''}\n\n${doc.content}`.trim();
          const docKey = `doc:${backendId}:${doc.hash}`;
          const embedding = await embedWithCache(cache, docKey, () => embedFn(docText));
          const score = cosine(queryEmbedding, embedding);
          return { path: doc.path, title: doc.title, frontmatter: doc.frontmatter, score };
        }),
      );

      hits.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      if (opts.limit && hits.length > opts.limit) {
        hits.splice(opts.limit);
      }

      if (format === 'json') {
        console.log(
          JSON.stringify(
            hits.map((h) => ({
              path: h.path,
              title: h.title ?? '',
              frontmatter: h.frontmatter ?? {},
              score: h.score ?? undefined,
            })),
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
        ['Path', 'Title', 'Score'],
        hits.map((hit) => [hit.path, hit.title ?? '', hit.score ?? '']),
      );
    };

    if (ollamaUrl) {
      const ollamaBackendId = `ollama:${ollamaModel ?? 'nomic-embed-text'}`;
      await computeAndEmit(ollamaBackendId, (text) =>
        embedWithOllama(text, { url: ollamaUrl, model: ollamaModel }),
      );
      return;
    }

    if (chromaPath || chromaCollection) {
      console.log(
        'Chroma backend not wired yet (needs embeddings + collection); set DOCS_ES_URL or DOCS_OLLAMA_URL for now.',
      );
      return;
    }

    const embedder = makeDeterministicEmbedder({ modelId: localEmbedModel, dim: localEmbedDim });
    const localBackendId = `local:${localEmbedModel}:${localEmbedDim}`;
    await computeAndEmit(localBackendId, (text) => embedder.embedOne(text));
    return;
  }

  const files = await collectFiles({ category, pathGlob, cwd, absolute: true });
  const hits: Array<FileHit & { matched?: string; rel?: string }> = [];
  let regex: RegExp | null = null;
  if (mode === 'regex') {
    try {
      regex = new RegExp(query, 'i');
    } catch (err) {
      throw new InvalidArgumentError(`Invalid regex: ${String(err)}`);
    }
  }

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const lower = raw.toLowerCase();
    const parsed = matter(raw);
    const titleFromFm = parsed.data.title as string | undefined;
    const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1];
    const title = titleFromFm || heading;

    const rel = opts.absolute ? file : path.relative(cwd, file);

    switch (mode) {
      case 'keyword': {
        if (!lower.includes(query.toLowerCase())) continue;
        hits.push({ path: rel, title, frontmatter: parsed.data });
        break;
      }
      case 'regex': {
        if (!regex) continue;
        if (!regex.test(raw)) continue;
        hits.push({ path: rel, title, frontmatter: parsed.data });
        break;
      }
      case 'fuzzy': {
        if (!lower.includes(query.toLowerCase())) continue;
        hits.push({ path: rel, title, frontmatter: parsed.data, matched: 'fuzzy-substring' });
        break;
      }
      default:
        throw new InvalidArgumentError(`Unsupported search mode: ${mode}`);
    }
  }

  if (opts.limit && hits.length > opts.limit) {
    hits.splice(opts.limit);
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

export async function commandTasksSummary(opts: {
  format?: Format;
  cwd?: string;
  status?: string[];
  priority?: string[];
}): Promise<void> {
  const format = opts.format ?? 'markdown';
  const cwd = opts.cwd ?? process.cwd();
  const files = await fg('docs/agile/tasks/**/*.md', {
    dot: false,
    onlyFiles: true,
    cwd,
    absolute: true,
  });
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
    const rel = path.relative(cwd, file);
    const status = parsed.data.status as string | undefined;
    const priority = parsed.data.priority as string | undefined;
    const createdAt = parsed.data.created_at as string | undefined;
    if (opts.status && status && !opts.status.includes(status)) continue;
    if (opts.priority && priority && !opts.priority.includes(priority)) continue;
    tasks.push({
      path: rel,
      title: titleFromFm || heading || path.basename(file),
      status,
      priority,
      created_at: createdAt,
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

function buildOutput(io?: IoConfig) {
  return {
    writeOut: io?.stdout ?? ((str: string) => process.stdout.write(str)),
    writeErr: io?.stderr ?? ((str: string) => process.stderr.write(str)),
    outputError: (str: string, write: (data: string) => void) => write(str),
  };
}

export function createDocsProgram(io?: IoConfig): Command {
  const program = new Command();
  if (io?.exitOverride) {
    program.exitOverride();
  }

  program
    .name('promethean-docs')
    .summary('Docs search/view CLI (semantic via Elasticsearch when configured)')
    .description(
      'Search, view, and summarize agile tasks with Commander-forward UX and Elastic-backed semantic mode.',
    )
    .usage('<command> [options]')
    .version(programVersion, '-V, --version', 'show CLI version')
    .showHelpAfterError('(add --help for additional information)')
    .configureHelp({ sortOptions: true, sortSubcommands: true, showGlobalOptions: true })
    .helpOption('-h, --help', 'display help for command')
    .helpCommand('help [command]', 'display help for command')
    .configureOutput(buildOutput(io));

  program
    .addHelpText('beforeAll', 'Promethean Docs CLI — search, view, summarize')
    .addHelpText(
      'afterAll',
      `Examples:\n  $ promethean-docs search keyword kanban -c docs\n  $ promethean-docs view docs/HOME.md\n  $ promethean-docs tasks summary --format json`,
    );

  program
    .option('-C, --cwd <dir>', 'working directory (env:DOCS_CWD)', normalizeDir, process.cwd())
    .option('-t, --trace', 'display trace statements for commands');

  program.hook('preAction', (_thisCommand, actionCommand) => {
    const opts = actionCommand.optsWithGlobals() as OptionValues & { trace?: boolean };
    if (opts.trace) {
      console.log(
        `About to execute ${actionCommand.name()} with args=${JSON.stringify(
          actionCommand.args,
        )} opts=${JSON.stringify(actionCommand.optsWithGlobals())}`,
      );
    }
  });

  program.hook('postAction', (_thisCommand, actionCommand) => {
    const opts = actionCommand.optsWithGlobals() as OptionValues & { trace?: boolean };
    if (opts.trace) {
      console.log(`Completed ${actionCommand.name()}`);
    }
  });

  const searchCommand = new Command('search')
    .alias('s')
    .summary('Search docs')
    .description('Run semantic (Elasticsearch), keyword, fuzzy, or regex searches')
    .addArgument(new Argument('<mode>', 'semantic|keyword|fuzzy|regex').argParser(parseMode))
    .addArgument(new Argument('<query>', 'search query string'))
    .addOption(
      new Option('-c, --category <id>', 'category id')
        .choices(categories.map((c) => c.id))
        .env('DOCS_CATEGORY'),
    )
    .addOption(new Option('-p, --path <glob>', 'override glob').env('DOCS_PATH'))
    .addOption(
      new Option('-f, --format <format>', 'markdown|json')
        .choices(formats)
        .default('markdown')
        .env('DOCS_FORMAT')
        .argParser(parseFormat),
    )
    .addOption(new Option('--absolute', 'emit absolute paths instead of relative'))
    .addOption(
      new Option('--limit <count>', 'limit returned rows').argParser((val) => {
        const num = Number(val);
        if (Number.isNaN(num) || num <= 0) {
          throw new InvalidArgumentError('limit must be a positive number');
        }
        return num;
      }),
    )
    .addOption(
      new Option('--es-url <url>', 'Elasticsearch endpoint for semantic mode').env('DOCS_ES_URL'),
    )
    .addOption(
      new Option('--es-index <name>', 'Elasticsearch index for semantic mode')
        .env('DOCS_ES_INDEX')
        .default('docs'),
    )
    .addOption(new Option('--es-api-key <key>', 'Elasticsearch API key').env('DOCS_ES_API_KEY'))
    .addOption(
      new Option('--es-user <user>', 'Elasticsearch basic auth username').env('DOCS_ES_USER'),
    )
    .addOption(
      new Option('--es-password <password>', 'Elasticsearch basic auth password').env(
        'DOCS_ES_PASSWORD',
      ),
    )
    .addOption(new Option('--es-ca <path>', 'CA certificate for HTTPS clusters').env('DOCS_ES_CA'))
    .addOption(
      new Option('--es-field <field...>', 'Fields to search (variadic)')
        .env('DOCS_ES_FIELDS')
        .argParser((val, prev: string[] = []) => {
          const parts = val
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          return [...prev, ...parts];
        }),
    )
    .addOption(
      new Option('--ollama-url <url>', 'Ollama endpoint for local embeddings').env(
        'DOCS_OLLAMA_URL',
      ),
    )
    .addOption(
      new Option('--ollama-model <model>', 'Ollama embedding model').env('DOCS_OLLAMA_MODEL'),
    )
    .addOption(
      new Option('--lmdb-path <path>', 'LMDB cache path for embeddings').env('DOCS_CACHE_PATH'),
    )
    .addOption(
      new Option('--local-embed-dim <dim>', 'Local deterministic embed dimension')
        .env('DOCS_LOCAL_EMBED_DIM')
        .argParser((val) => {
          const num = Number(val);
          if (Number.isNaN(num) || num <= 0) {
            throw new InvalidArgumentError('local embed dim must be a positive number');
          }
          return num;
        }),
    )
    .addOption(
      new Option('--local-embed-model <id>', 'Local deterministic embed model id').env(
        'DOCS_LOCAL_EMBED_MODEL',
      ),
    )
    .addOption(
      new Option('--chroma-path <path>', 'Chroma persistence path (semantic placeholder)').env(
        'DOCS_CHROMA_PATH',
      ),
    )
    .addOption(
      new Option('--chroma-collection <name>', 'Chroma collection name (semantic placeholder)').env(
        'DOCS_CHROMA_COLLECTION',
      ),
    )
    .action(async (mode: SearchMode, query: string, options: OptionValues, command: Command) => {
      const globals = command.optsWithGlobals() as { cwd?: string };
      await commandSearch(mode, query, {
        category: options.category as string | undefined,
        path: options.path as string | undefined,
        format: options.format as Format,
        cwd: globals.cwd,
        absolute: options.absolute as boolean | undefined,
        limit: options.limit as number | undefined,
        esUrl: options.esUrl as string | undefined,
        esIndex: options.esIndex as string | undefined,
        esApiKey: options.esApiKey as string | undefined,
        esUser: options.esUser as string | undefined,
        esPassword: options.esPassword as string | undefined,
        esCa: options.esCa as string | undefined,
        esField: options.esField as string[] | undefined,
        chromaPath: options.chromaPath as string | undefined,
        chromaCollection: options.chromaCollection as string | undefined,
        ollamaUrl: options.ollamaUrl as string | undefined,
        ollamaModel: options.ollamaModel as string | undefined,
        lmdbPath: options.lmdbPath as string | undefined,
        localEmbedDim: options.localEmbedDim as number | undefined,
        localEmbedModel: options.localEmbedModel as string | undefined,
      });
    });

  const viewCommand = new Command('view')
    .alias('cat')
    .summary('View a file preserving dataview blocks')
    .argument('<path>', 'path to markdown/json file', passthroughPath)
    .addOption(new Option('-e, --encoding <encoding>', 'file encoding').default('utf8'))
    .description('Print file contents without altering Dataview blocks')
    .action(async (file: string, options: OptionValues, command: Command) => {
      const globals = command.optsWithGlobals() as { cwd?: string };
      await commandView(file, { encoding: options.encoding, cwd: globals.cwd });
    });

  const tasksSummaryCommand = new Command('summary')
    .alias('sum')
    .summary('Summarize agile tasks')
    .description('Emit task counts by status/priority and list P0/P1 tasks')
    .addOption(
      new Option('-f, --format <format>', 'markdown|json')
        .choices(formats)
        .default('markdown')
        .argParser(parseFormat),
    )
    .addOption(new Option('--status <status...>', 'filter by status (variadic)'))
    .addOption(new Option('--priority <priority...>', 'filter by priority (variadic)'))
    .action(async (options: OptionValues, command: Command) => {
      const globals = command.optsWithGlobals() as { cwd?: string };
      await commandTasksSummary({
        format: options.format as Format,
        cwd: globals.cwd,
        status: options.status as string[] | undefined,
        priority: options.priority as string[] | undefined,
      });
    });

  const tasksCommand = new Command('tasks')
    .alias('t')
    .description('Tasks utilities')
    .addCommand(tasksSummaryCommand)
    .addHelpText('after', 'Use summary to emit tables or JSON for agile tasks.');

  program.addCommand(searchCommand);
  program.addCommand(viewCommand);
  program.addCommand(tasksCommand);

  return program;
}

const isCliEntry = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;

if (isCliEntry) {
  createDocsProgram()
    .parseAsync(process.argv)
    .catch((err: unknown) => {
      console.error(err);
      process.exit(1);
    });
}

export { categories, programVersion as version };
