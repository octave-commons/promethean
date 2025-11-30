import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createDocsProgram } from './cli.js';

async function withTempRepo(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'docs-cli-'));
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

function makeProgramHarness(cwd: string) {
  let out = '';
  let err = '';
  const program = createDocsProgram({
    exitOverride: true,
    stdout: (str: string) => {
      out += str;
    },
    stderr: (str: string) => {
      err += str;
    },
  });
  const run = async (args: string[]) => {
    const origLog = console.log;
    const origErr = console.error;
    console.log = (...args: unknown[]) => {
      out += args.join(' ') + '\n';
    };
    console.error = (...args: unknown[]) => {
      err += args.join(' ') + '\n';
    };
    try {
      await program.parseAsync(['--cwd', cwd, ...args], { from: 'user' });
    } finally {
      console.log = origLog;
      console.error = origErr;
    }
    return { out, err };
  };
  return { run, getOut: () => out, getErr: () => err };
}

describe('search command', () => {
  it('finds keyword matches, supports alias, emits JSON rows', async () => {
    await withTempRepo(async (dir) => {
      await fs.mkdir(path.join(dir, 'docs'), { recursive: true });
      const file = path.join(dir, 'docs', 'sample.md');
      await fs.writeFile(
        file,
        `---\ntitle: Sample\nstatus: ready\npriority: P1\n---\n# Sample\nhello world\n`,
      );

      const { run } = makeProgramHarness(dir);
      const { out } = await run(['s', 'keyword', 'hello', '--format', 'json']);

      const rows = JSON.parse(out.trim()) as Array<{
        path: string;
        title: string;
        frontmatter: Record<string, unknown>;
      }>;
      expect(rows.length).toBe(1);
      expect(rows[0].path).toBe('docs/sample.md');
      expect(rows[0].title).toBe('Sample');
      expect(rows[0].frontmatter.status).toBe('ready');
      expect(rows[0].frontmatter.priority).toBe('P1');
    });
  });

  it('surfaces invalid mode via commander error', async () => {
    await withTempRepo(async (dir) => {
      const harness = makeProgramHarness(dir);
      let thrown: unknown;
      try {
        await harness.run(['search', 'typo', 'hello']);
      } catch (err) {
        thrown = err;
      }
      expect(thrown).toBeInstanceOf(Error);
    });
  });

  it('gracefully falls back when semantic config is missing', async () => {
    await withTempRepo(async (dir) => {
      const harness = makeProgramHarness(dir);
      await harness.run(['search', 'semantic', 'hello']);
      expect(harness.getOut()).toMatch(/(Path \| Title \| Score|No matches)/i);
    });
  });

  it('acknowledges chroma placeholder when provided without ES', async () => {
    await withTempRepo(async (dir) => {
      const harness = makeProgramHarness(dir);
      await harness.run(['search', 'semantic', 'hello', '--chroma-path', '/tmp/chroma']);
      expect(harness.getOut()).toMatch(/chroma backend not wired yet/i);
    });
  });
});

describe('view command', () => {
  it('prints file contents respecting cwd', async () => {
    await withTempRepo(async (dir) => {
      const docsDir = path.join(dir, 'docs');
      await fs.mkdir(docsDir, { recursive: true });
      const file = path.join(docsDir, 'view.md');
      await fs.writeFile(file, '# Hello\n');

      const { run, getOut } = makeProgramHarness(dir);
      await run(['view', 'docs/view.md']);

      expect(getOut().trim()).toBe('# Hello');
    });
  });
});

describe('tasks summary', () => {
  it('counts tasks, filters, and lists P0/P1 with JSON output', async () => {
    await withTempRepo(async (dir) => {
      const taskDir = path.join(dir, 'docs', 'agile', 'tasks');
      await fs.mkdir(taskDir, { recursive: true });
      await fs.writeFile(
        path.join(taskDir, 'task1.md'),
        `---\ntitle: Task One\nstatus: ready\npriority: P0\ncreated_at: 2025-10-10\n---\n# Task One\n`,
      );
      await fs.writeFile(
        path.join(taskDir, 'task2.md'),
        `---\ntitle: Task Two\nstatus: in_progress\npriority: P2\ncreated_at: 2025-10-11\n---\n# Task Two\n`,
      );

      const { run, getOut } = makeProgramHarness(dir);
      await run(['tasks', 'summary', '--format', 'json', '--priority', 'P0']);

      const data = JSON.parse(getOut().trim()) as {
        countsByStatus: Record<string, number>;
        countsByPriority: Record<string, number>;
        p0p1: Array<{ title: string; priority?: string; status?: string }>;
      };

      expect(data.countsByStatus.ready).toBe(1);
      expect(data.countsByPriority.P0).toBe(1);
      expect(data.p0p1.length).toBe(1);
      expect(data.p0p1[0].title).toBe('Task One');
      expect(data.p0p1[0].priority).toBe('P0');
    });
  });
});
