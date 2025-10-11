import { promises as fs } from 'fs';
import { join } from 'path';
import os from 'os';

import test from 'ava';
import { MarkdownBoard } from '@promethean/markdown/kanban.js';
import { syncBoardStatuses } from '@promethean/markdown/sync.js';

const BOARD_MD = `---\nkanban-plugin: board\n---\n\n## Todo\n- [ ] Fix login flow <!-- id: 1111-aaaa -->\n- [ ] [[existing.md|Existing Task]] #ready <!-- id: 2222-bbbb -->\n\n## In Progress\n- [ ] Working item #todo <!-- id: 3333-cccc -->\n`;

test('syncBoardStatuses tags cards with column status and updates/creates tasks', async (t) => {
    // Prepare a temp tasks dir under repo tree
    const tmpRoot = await fs.mkdtemp(join(os.tmpdir(), 'md-sync-'));
    const tasksDir = join(tmpRoot, 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });

    // Seed an existing linked task
    const existing = join(tasksDir, 'existing.md');
    await fs.writeFile(existing, `# Existing Task\n\nDetails.\n\nid: 2222-bbbb\n#ready\n`, 'utf8');

    const board = await MarkdownBoard.load(BOARD_MD);
    const changed = await syncBoardStatuses(board, { tasksDir, createMissingTasks: true });
    t.true(changed);

    // After sync, cards in Todo have #todo, In Progress have #in-progress
    const todo = board.listCards('Todo');
    const ip = board.listCards('In Progress');
    t.true(todo.every((c: any) => c.tags.includes('todo')));
    t.true(ip.every((c: any) => c.tags.includes('in-progress')));

    // Missing task for "Fix login flow" should be created and linked
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
});

test('retags conflicting status on cards under their column', async (t) => {
    const tmpRoot = await fs.mkdtemp(join(os.tmpdir(), 'md-sync-'));
    const tasksDir = join(tmpRoot, 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });

    const boardMd = `\n## Todo\n- [ ] [[x.md|X]] #ready <!-- id: aaaa-1111 -->\n`;
    const board = await MarkdownBoard.load(boardMd);
    await syncBoardStatuses(board, { tasksDir, createMissingTasks: true });
    const todo = board.listCards('Todo');
    t.is(todo.length, 1);
    t.true(todo[0]?.tags.includes('todo'));
    t.false(todo[0]?.tags.includes('ready'));
});

test('creates missing link for unlinked card and sets status', async (t) => {
    const tmpRoot = await fs.mkdtemp(join(os.tmpdir(), 'md-sync-'));
    const tasksDir = join(tmpRoot, 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });

    const boardMd = `\n## Todo\n- [ ] New item <!-- id: bbbb-2222 -->\n`;
    const board = await MarkdownBoard.load(boardMd);
    await syncBoardStatuses(board, { tasksDir, createMissingTasks: true });
    const todo = board.listCards('Todo');
    t.is(todo.length, 1);
    t.true(todo[0]?.tags.includes('todo'));
    t.truthy(todo[0]?.links && todo[0].links.length > 0);
});

test('updates existing task file status to match column', async (t) => {
    const tmpRoot = await fs.mkdtemp(join(os.tmpdir(), 'md-sync-'));
    const tasksDir = join(tmpRoot, 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });

    await fs.writeFile(join(tasksDir, 'y.md'), `# Y\n\nid: cccc-3333\n#ready\n`, 'utf8');
    const boardMd = `\n## Todo\n- [ ] [[y.md|Y]] <!-- id: cccc-3333 -->\n`;
    const board = await MarkdownBoard.load(boardMd);
    await syncBoardStatuses(board, { tasksDir, createMissingTasks: false });
    const content = await fs.readFile(join(tasksDir, 'y.md'), 'utf8');
    t.true(content.trimEnd().endsWith('#todo'));
});
