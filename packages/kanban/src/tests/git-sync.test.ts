import test from 'ava';
import esmock from 'esmock';
import { fileURLToPath } from 'node:url';

type StatusState = {
  files: string[];
  current: string;
  ahead: number;
  behind: number;
  conflicted: string[];
};

const createStatus = (): StatusState => ({
  files: [],
  current: 'main',
  ahead: 0,
  behind: 0,
  conflicted: [],
});

test('KanbanGitSync handles push, pull, and status flows', async (t) => {
  const statusState = createStatus();
  let stashPushed = false;
  let stashPopped = false;
  const modulePath = fileURLToPath(new URL('../lib/git-sync.js', import.meta.url));

  const { KanbanGitSync } = await esmock<typeof import('../lib/git-sync.js')>(modulePath, {
    'simple-git': {
      simpleGit: () => ({
        checkIsRepo: async () => true,
        status: async () => ({
          files: [...statusState.files],
          current: statusState.current,
          ahead: statusState.ahead,
          behind: statusState.behind,
          conflicted: [...statusState.conflicted],
          isClean: () => statusState.files.length === 0,
        }),
        listRemote: async () => {},
        add: async () => {
          // simulate staging by clearing files but keeping ahead
          statusState.files = statusState.files.filter((file) => file.endsWith('.md'));
        },
        commit: async () => {
          statusState.files = [];
          statusState.ahead = 1;
        },
        push: async () => {
          statusState.ahead = 0;
        },
        fetch: async () => {
          // simulate remote fetch with no side effects
        },
        stash: async (args: string[]) => {
          if (args[0] === 'push') {
            stashPushed = true;
            statusState.files = [];
          } else if (args[0] === 'list') {
            return stashPushed ? ['stash@{0}: auto'] : [];
          } else if (args[0] === 'pop') {
            stashPopped = true;
            statusState.files = ['restored.md'];
          }
          return undefined;
        },
        pull: async () => {
          statusState.behind = 0;
        },
        checkout: async () => {
          statusState.conflicted = [];
        },
      }),
    },
  });

  const starts: string[] = [];
  const completes: string[] = [];
  const sync = new KanbanGitSync(
    { workingDir: '/repo', autoPush: true, autoPull: true },
    {
      onSyncStart: (op) => starts.push(op),
      onSyncComplete: (op) => completes.push(op),
    },
  );

  await sync.initialize();
  t.false(sync.isSyncInProgress());
  t.truthy(sync.getStatus());

  statusState.files = ['task.md'];
  await sync.autoPush('Test push');
  t.deepEqual(starts.includes('push'), true);
  t.deepEqual(completes.includes('push'), true);
  t.is(statusState.ahead, 0);

  statusState.behind = 1;
  statusState.files = ['local-change.md'];
  await sync.autoPull();
  t.true(stashPushed);
  t.true(stashPopped);
  t.is(statusState.behind, 0);

  statusState.files = ['local-change.md'];
  statusState.behind = 1;
  await sync.syncWithRemote();
  t.is(statusState.behind, 0);

  statusState.behind = 2;
  const hasRemote = await sync.checkForRemoteChanges();
  t.true(hasRemote);

  statusState.conflicted = ['conflict.md'];
  const resolved = await sync.resolveConflicts('theirs');
  t.true(resolved);

  await esmock.purge(modulePath);
});
