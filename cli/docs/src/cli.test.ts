import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { commandSearch, commandTasksSummary } from './cli.js';

async function withTempRepo(fn: (dir: string) => Promise<void>): Promise<void> {
  const orig = process.cwd();
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'docs-cli-'));
  try {
    process.chdir(dir);
    await fn(dir);
  } finally {
    process.chdir(orig);
    await fs.rm(dir, { recursive: true, force: true });
  }
}

describe('commandSearch', () => {
  it('finds keyword matches and emits JSON rows', async () => {
    await withTempRepo(async (dir) => {
      await fs.mkdir(path.join(dir, 'docs'), { recursive: true });
      const file = path.join(dir, 'docs', 'sample.md');
      await fs.writeFile(
        file,
        `---\ntitle: Sample\nstatus: ready\npriority: P1\n---\n# Sample\nhello world\n`,
      );

      let out = '';
      const origLog = console.log;
      console.log = (...args: unknown[]) => {
        out += args.join(' ') + '\n';
      };
      try {
        await commandSearch('keyword', 'hello', { format: 'json' });
      } finally {
        console.log = origLog;
      }

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
});

describe('commandTasksSummary', () => {
  it('counts tasks and lists P0/P1', async () => {
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

      let out = '';
      const origLog = console.log;
      console.log = (...args: unknown[]) => {
        out += args.join(' ') + '\n';
      };
      try {
        await commandTasksSummary({ format: 'json' });
      } finally {
        console.log = origLog;
      }

      const data = JSON.parse(out.trim()) as {
        countsByStatus: Record<string, number>;
        countsByPriority: Record<string, number>;
        p0p1: Array<{ title: string; priority?: string; status?: string }>;
      };

      expect(data.countsByStatus.ready).toBe(1);
      expect(data.countsByStatus.in_progress).toBe(1);
      expect(data.countsByPriority.P0).toBe(1);
      expect(data.countsByPriority.P2).toBe(1);
      expect(data.p0p1.length).toBe(1);
      expect(data.p0p1[0].title).toBe('Task One');
      expect(data.p0p1[0].priority).toBe('P0');
    });
  });
});
