import os from 'os';
import { promises as fs } from 'fs';
import { join } from 'path';

import test from 'ava';
import { MarkdownBoard } from '@promethean/markdown/kanban.js';
import { syncBoardStatuses } from '@promethean/markdown/sync.js';

const mkTmpRoot = async () => await fs.mkdtemp(join(os.tmpdir(), 'md-sync-int-'));

test('integration: end-to-end board sync creates/updates task files and persists board', async (t) => {
    const tmpRoot = await mkTmpRoot();
    const tasksDir = join(tmpRoot, 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });

    // Seed an existing linked task that will need status update
    const existing = join(tasksDir, 'existing.md');
    await fs.writeFile(existing, `# Existing Task\n\nDetails.\n\nid: 2222-bbbb\n#ready\n`, 'utf8');

    const boardMd = `---\nkanban-plugin: board\n---\n\n## Todo\n- [ ] Fix login flow <!-- id: 1111-aaaa -->\n- [ ] [[existing.md|Existing Task]] #ready <!-- id: 2222-bbbb -->\n\n## In Progress\n- [ ] Working item #todo <!-- id: 3333-cccc -->\n`;

    const board = await MarkdownBoard.load(boardMd);
    const changed = await syncBoardStatuses(board, { tasksDir, createMissingTasks: true });
    t.true(changed);

    // Verify tags on cards align with columns
    const todo = board.listCards('Todo');
    const ip = board.listCards('In Progress');
    t.true(todo.every((c: any) => c.tags.includes('todo')));
    t.true(ip.every((c: any) => c.tags.includes('in-progress')));

    // Missing task for first Todo should be created and linked
    const createdCard = todo.find((c: any) => c.id === '1111-aaaa')!;
    t.truthy(createdCard.links && createdCard.links.length > 0);
    const createdFile = createdCard.links[0]?.split('|')[0];
    const createdPath = join(tasksDir, createdFile!);
    const createdContent = await fs.readFile(createdPath, 'utf8');
    t.true(createdContent.includes('id: 1111-aaaa'));
    t.true(createdContent.trimEnd().endsWith('#todo'));

    // Existing task should be updated to #todo (since card is under Todo)
    const existingContent = await fs.readFile(existing, 'utf8');
    t.true(existingContent.trimEnd().endsWith('#todo'));

    // Persist board itself to disk and reload to ensure round-trip consistency
    const boardPath = join(tmpRoot, 'board.md');
    const outMd = await board.toMarkdown();
    await fs.writeFile(boardPath, outMd, 'utf8');
    const reloaded = await MarkdownBoard.load(await fs.readFile(boardPath, 'utf8'));
    // State should be preserved after reload
    t.true(reloaded.listCards('Todo').every((c: any) => c.tags.includes('todo')));
});

test('integration: second sync is idempotent with no further content changes', async (t) => {
    const tmpRoot = await mkTmpRoot();
    const tasksDir = join(tmpRoot, 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });

    const boardMd = `\n## Todo\n- [ ] [[x.md|X]] <!-- id: aaaa-1111 -->\n`;
    const board = await MarkdownBoard.load(boardMd);
    await syncBoardStatuses(board, { tasksDir, createMissingTasks: true });
    const firstMd = await board.toMarkdown();

    // Run again
    await syncBoardStatuses(board, { tasksDir, createMissingTasks: true });
    const secondMd = await board.toMarkdown();

    t.is(secondMd, firstMd);
});
