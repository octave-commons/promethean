import test from 'ava';
import { promises as fs } from 'fs';
import { join } from 'path';
import { MarkdownBoard } from '../markdown/kanban';
import { syncBoardStatuses } from '../markdown/sync';

const BOARD_MD = `---\nkanban-plugin: board\n---\n\n## Todo\n- [ ] Fix login flow <!-- id: 1111-aaaa -->\n- [ ] [[existing.md|Existing Task]] #ready <!-- id: 2222-bbbb -->\n\n## In Progress\n- [ ] Working item #todo <!-- id: 3333-cccc -->\n`;

test('syncBoardStatuses tags cards with column status and updates/creates tasks', async (t) => {
    // Prepare a temp tasks dir under repo tree
    const tasksDir = join(process.cwd(), 'shared', 'ts', 'tmp-tests', 'tasks-sync');
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
    t.true(todo.every((c) => c.tags.includes('todo')));
    t.true(ip.every((c) => c.tags.includes('in-progress')));

    // Missing task for "Fix login flow" should be created and linked
    const createdCard = todo.find((c) => c.id === '1111-aaaa')!;
    t.truthy(createdCard.links && createdCard.links.length > 0);
    const createdFile = createdCard.links![0]!.split('|')[0]!;
    const createdPath = join(tasksDir, createdFile);
    const createdContent = await fs.readFile(createdPath, 'utf8');
    t.true(createdContent.includes('id: 1111-aaaa'));
    t.true(createdContent.trimEnd().endsWith('#todo'));

    // Existing task should be updated to #todo (since card is under Todo)
    const existingContent = await fs.readFile(existing, 'utf8');
    t.true(existingContent.trimEnd().endsWith('#todo'));
});
