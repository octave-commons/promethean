import test from 'ava';
import esmock from 'esmock';
import { fileURLToPath } from 'node:url';

type ExecScenario = {
  match: RegExp;
  output?: string;
  error?: Error;
  reuse?: boolean;
};

const modulePath = fileURLToPath(new URL('../lib/validation/git-integration.js', import.meta.url));

const createExecMock = (scenarios: ExecScenario[]) => {
  return (command: string) => {
    const index = scenarios.findIndex((scenario) => scenario.match.test(command));
    if (index === -1) {
      throw new Error(`Unexpected command: ${command}`);
    }
    const scenario = scenarios[index]!;
    if (!scenario.reuse) {
      scenarios.splice(index, 1);
    }
    if (scenario.error) {
      throw scenario.error;
    }
    return scenario.output ?? '';
  };
};

test('GitValidator filters commits by task hints and reports code changes', async (t) => {
  const gitLogOutput = [
    "1111111|Fix security bug TASK-123|Alice|2025-11-11T10:00:00Z",
    'src/lib/security.ts',
    'docs/readme.md',
    '',
    "2222222|Misc cleanup|Bob|2025-11-10T12:00:00Z",
    'docs/changelog.md',
    '',
  ].join('\n');

  const execMock = createExecMock([
    { match: /git log/, output: gitLogOutput },
    { match: /git log/, output: gitLogOutput },
  ]);

  const { GitValidator, hasTaskCodeChanges } = await esmock<
    typeof import('../lib/validation/git-integration.js')
  >(modulePath, {
    'node:child_process': {
      execSync: execMock,
    },
  });
  t.teardown(() => esmock.purge(modulePath));

  const validator = new GitValidator('/repo');
  const commits = await validator.getTaskCommits({
    repoRoot: '/repo',
    taskUuid: 'TASK-123',
    taskTitle: 'Security patch auth flow',
    sinceDate: '2025-10-01',
  });

  t.is(commits.length, 1);
  t.deepEqual(commits[0]?.files, ['src/lib/security.ts', 'docs/readme.md']);

  const hasChanges = await hasTaskCodeChanges({
    repoRoot: '/repo',
    taskTitle: 'Security patch auth flow',
  });
  t.true(hasChanges);
});

test('getRepoInfo and validateRepoState surface warnings for dirty branch', async (t) => {
  const execMock = createExecMock([
    { match: /git rev-parse --abbrev-ref/, output: 'feature/branch\n', reuse: true },
    { match: /git config --get remote\.origin\.url/, error: new Error('no remote'), reuse: true },
    { match: /git rev-parse HEAD/, output: 'abc123\n', reuse: true },
    { match: /git status --porcelain/, output: ' M src/file.ts\n', reuse: true },
    { match: /git rev-parse --git-dir/, output: '.git\n', reuse: true },
  ]);

  const { GitValidator } = await esmock<typeof import('../lib/validation/git-integration.js')>(
    modulePath,
    {
      'node:child_process': {
        execSync: execMock,
      },
    },
  );
  t.teardown(() => esmock.purge(modulePath));

  const validator = new GitValidator('/repo');
  const info = await validator.getRepoInfo();
  t.is(info.branch, 'feature/branch');
  t.is(info.remote, undefined);
  t.false(info.isClean);

  const state = await validator.validateRepoState();
  t.true(state.valid);
  t.deepEqual(state.errors, []);
  t.true(state.warnings.some((msg) => msg.includes('uncommitted')));
  t.true(state.warnings.some((msg) => msg.includes('feature/branch')));
  t.true(state.warnings.some((msg) => msg.includes('No remote')));
});

test('validateRepoState fails when not inside a git repository', async (t) => {
  const execMock = createExecMock([
    { match: /git rev-parse --abbrev-ref/, output: 'main\n', reuse: true },
    { match: /git config --get remote\.origin\.url/, output: 'git@example.com:repo.git\n', reuse: true },
    { match: /git rev-parse HEAD/, output: 'deadbeef\n', reuse: true },
    { match: /git status --porcelain/, output: '', reuse: true },
    { match: /git rev-parse --git-dir/, error: new Error('fatal: not a git repository'), reuse: true },
  ]);

  const { GitValidator } = await esmock<typeof import('../lib/validation/git-integration.js')>(
    modulePath,
    {
      'node:child_process': {
        execSync: execMock,
      },
    },
  );
  t.teardown(() => esmock.purge(modulePath));

  const validator = new GitValidator('/repo');
  const state = await validator.validateRepoState();
  t.false(state.valid);
  t.true(state.errors.some((msg) => msg.includes('git repository')));
});

test('getCommitFiles returns files and hasSecurityFileChanges detects secure paths', async (t) => {
  const execMock = createExecMock([
    { match: /git show --name-only/, output: 'security/auth.ts\nREADME.md\n' },
  ]);

  const { GitValidator } = await esmock<typeof import('../lib/validation/git-integration.js')>(
    modulePath,
    {
      'node:child_process': {
        execSync: execMock,
      },
    },
  );
  t.teardown(() => esmock.purge(modulePath));

  const validator = new GitValidator('/repo');
  const files = await validator.getCommitFiles('abc123');
  t.deepEqual(files, ['security/auth.ts', 'README.md']);

  const hasSecurityFiles = await validator.hasSecurityFileChanges([
    {
      hash: 'abc123',
      message: 'Improve auth filter',
      author: 'Alice',
      date: '2025-11-01',
      files,
    },
  ]);
  t.true(hasSecurityFiles);
});

test('hasTaskCodeChanges degrades gracefully when git log fails', async (t) => {
  const execMock = createExecMock([
    { match: /git log/, error: new Error('git failure') },
  ]);

  const { hasTaskCodeChanges } = await esmock<
    typeof import('../lib/validation/git-integration.js')
  >(modulePath, {
    'node:child_process': {
      execSync: execMock,
    },
  });
  t.teardown(() => esmock.purge(modulePath));

  const result = await hasTaskCodeChanges({ repoRoot: '/repo', taskUuid: 'TASK-999' });
  t.false(result);
});
