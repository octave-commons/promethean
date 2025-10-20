import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import test from 'ava';

import { createKanbanUiServer } from '../lib/ui-server.js';
import { makeTask, withTempDir, writeTaskFile } from '../test-utils/helpers.js';

type ServerInstance = ReturnType<typeof createKanbanUiServer>;

type ServerControls = Readonly<
  Pick<ServerInstance, 'listen' | 'once' | 'off' | 'close' | 'address'>
>;

type BoardPayload = Readonly<{
  readonly summary: Readonly<{ readonly totalTasks: number }>;
  readonly board: Readonly<{
    readonly columns: ReadonlyArray<Readonly<{ readonly tasks: ReadonlyArray<unknown> }>>;
  }>;
}>;

const listenOnRandomPort = async (
  server: ServerControls,
): Promise<Readonly<{ readonly baseUrl: string }>> =>
  new Promise((resolve, reject) => {
    const onError = (error: Readonly<Error>) => reject(error);
    server.once('error', onError);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', onError);
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Unable to determine server address'));
        return;
      }
      resolve({ baseUrl: `http://${address.address}:${address.port}` });
    });
  });

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
};

test('kanban ui server exposes board payload and html', async (t) => {
  const dir = await withTempDir(t);
  const tasksDir = path.join(dir, 'tasks');
  const boardFile = path.join(dir, 'board.md');
  await writeFile(boardFile, '', 'utf8');
  await writeTaskFile(
    tasksDir,
    makeTask({
      uuid: 'task-1',
      title: 'Sample task',
      status: 'Todo',
      slug: 'sample-task',
    }),
  );

  const server = createKanbanUiServer({ boardFile, tasksDir });
  const { baseUrl } = await listenOnRandomPort(server);
  t.teardown(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  const payload = await fetchJson<BoardPayload>(`${baseUrl}/api/board`);
  t.is(payload.summary.totalTasks, 1);
  t.is(payload.board.columns[0]?.tasks.length ?? 0, 1);

  const html = await fetch(`${baseUrl}/`).then((res) => res.text());
  t.true(html.includes('kanban-ui.js'));

  const actionsList = await fetchJson<{ commands: ReadonlyArray<string>; ok: boolean }>(
    `${baseUrl}/api/actions`,
  );
  t.true(actionsList.commands.includes('find'));

  const actionResponse = await fetch(`${baseUrl}/api/actions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ command: 'find', args: ['task-1'] }),
  });
  t.true(actionResponse.ok);
  const actionJson = (await actionResponse.json()) as Readonly<{
    ok: boolean;
    result: Readonly<{ uuid?: string }>;
  }>;
  t.true(actionJson.ok);
  t.is(actionJson.result?.uuid, 'task-1');
});
