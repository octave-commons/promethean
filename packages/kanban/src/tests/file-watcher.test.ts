import test from 'ava';
import esmock from 'esmock';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type RegisteredHandlers = {
  ready?: () => void;
  error?: (error: unknown) => void;
  all?: (event: string, filePath: string) => void;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('KanbanFileWatcher listens for board and task changes', async (t) => {
  const handlers: RegisteredHandlers = {};
  let closed = false;
  let watchedPaths: string[] = [];

  const boardFile = path.resolve('/repo/docs/agile/boards/generated.md');
  const tasksDir = path.resolve('/repo/docs/agile/tasks');

  const modulePath = fileURLToPath(new URL('../lib/file-watcher.js', import.meta.url));
  const { KanbanFileWatcher } = await esmock<typeof import('../lib/file-watcher.js')>(
    modulePath,
    {
      chokidar: {
        watch: (paths: ReadonlyArray<string>) => {
          watchedPaths = [...paths];
          const fakeWatcher = {
            on: (event: string, handler: (...args: any[]) => void) => {
              handlers[event as keyof RegisteredHandlers] = handler as any;
              return fakeWatcher;
            },
            close: () => {
              closed = true;
            },
            getWatched: () => ({
              [tasksDir]: ['task-one.md'],
            }),
          };
          return fakeWatcher;
        },
      },
    },
  );

  const events: Array<{ type: string; path: string; event: string }> = [];
  const watcher = new KanbanFileWatcher(
    {
      boardFile,
      tasksDir,
      debounceMs: 10,
      ignored: [],
    },
    {
      onFileChange: (event) => {
        events.push({ type: event.type, path: event.filePath, event: event.event });
      },
      onReady: () => {
        events.push({ type: 'ready', path: '', event: '' });
      },
      onError: (error) => {
        events.push({ type: 'error', path: String(error), event: '' });
      },
    },
  );

  watcher.start();
  t.true(watcher.isWatching());
  t.true(
    watchedPaths.some((p) => p.includes('promethean.kanban.json')),
    'watches config files',
  );

  handlers.ready?.();
  handlers.all?.('change', boardFile);
  handlers.all?.('add', path.join(tasksDir, 'task-one.md'));
  handlers.all?.('change', path.join(tasksDir, 'task-two.md'));
  handlers.error?.(new Error('test error'));

  await delay(25);

  t.true(events.some((e) => e.type === 'ready'));
  t.true(events.some((e) => e.type === 'board'));
  t.true(events.filter((e) => e.type === 'task').length >= 2);
  t.true(events.some((e) => e.type === 'error'));

  const watched = watcher.getWatchedPaths();
  t.true(watched.includes(tasksDir));

  watcher.stop();
  t.true(closed);
  t.false(watcher.isWatching());

  await esmock.purge(modulePath);
});
