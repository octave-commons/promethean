import os from 'os';
import { promises as fs } from 'fs';
import { join } from 'path';

import test from 'ava';
import { MarkdownBoard } from '@promethean/markdown/kanban.js';
import {
    stripHash,
    firstWikiTarget,
    ensureStatusInTags,
    cardNeedsStatusUpdate,
    cardNeedsLink,
    ensureTaskFile,
    ensureCardStatus,
    ensureCardLink,
    ensureTaskStatusForCard,
    detectPendingChanges,
    applyUpdates,
    normalizeBoardInstance,
} from '@promethean/markdown/sync.js';

const mkTmp = async () => await fs.mkdtemp(join(os.tmpdir(), 'md-sync-helpers-'));

test('stripHash removes leading #', (t) => {
    t.is(stripHash('#todo'), 'todo');
    t.is(stripHash('ready'), 'ready');
});

test('firstWikiTarget parses wikilink target and enforces .md', (t) => {
    const card = { id: '1', text: 'X', done: false, tags: [], links: ['y|Y'], attrs: {} };
    t.is(firstWikiTarget(card as any), 'y.md');
    const card2 = { id: '1', text: 'X', done: false, tags: [], links: ['z.md|Z'], attrs: {} };
    t.is(firstWikiTarget(card2 as any), 'z.md');
});

test('ensureStatusInTags normalizes status and removes other status tags', (t) => {
    const card = { id: '1', text: 'X', done: false, tags: ['ready', 'foo'], links: [], attrs: {} };
    const next = ensureStatusInTags(card as any, '#todo');
    t.true(next.tags.includes('todo'));
    t.false(next.tags.includes('ready'));
    t.true(next.tags.includes('foo'));
});

test('cardNeedsStatusUpdate detects missing/incorrect status', (t) => {
    const c1 = { id: '1', text: 'X', done: false, tags: [], links: [], attrs: {} };
    t.true(cardNeedsStatusUpdate(c1 as any, '#todo'));
    const c2 = { ...c1, tags: ['todo'] };
    t.false(cardNeedsStatusUpdate(c2 as any, '#todo'));
    const c3 = { ...c1, tags: ['ready'] };
    t.true(cardNeedsStatusUpdate(c3 as any, '#todo'));
});

test('cardNeedsLink detects missing link when creation allowed', (t) => {
    const c1 = { id: '1', text: 'X', done: false, tags: [], links: [], attrs: {} };
    t.true(cardNeedsLink(c1 as any, true));
    const c2 = { ...c1, links: ['y.md|Y'] };
    t.false(cardNeedsLink(c2 as any, true));
});

test('ensureTaskFile creates a file with id when absent', async (t) => {
    const tmp = await mkTmp();
    const fname = await ensureTaskFile(tmp, 'my task', 'abc');
    t.is(fname, 'my task.md');
    const content = await fs.readFile(join(tmp, fname), 'utf8');
    t.true(/id:\s*abc/.test(content));
});

test('ensureCardStatus updates a card in the board', async (t) => {
    const md = `\n## Todo\n- [ ] X <!-- id: a-1 -->\n`;
    const board = await MarkdownBoard.load(md);
    const card = board.listCards('Todo')[0];
    if (!card) throw new Error('Card not found');
    const changed = await ensureCardStatus(board, 'Todo', card, '#todo');
    t.true(changed);
    const after = board.listCards('Todo')[0];
    if (!after) throw new Error('Card not found after update');
    t.true(after.tags.includes('todo'));
});

test('ensureCardLink adds a link and creates a file', async (t) => {
    const tmp = await mkTmp();
    const md = `\n## Todo\n- [ ] New <!-- id: a-2 -->\n`;
    const board = await MarkdownBoard.load(md);
    const card = board.listCards('Todo')[0];
    if (!card) throw new Error('Card not found');
    const changed = await ensureCardLink(board, card, tmp, true);
    t.true(changed);
    const after = board.listCards('Todo')[0];
    if (!after) throw new Error('Card not found after update');
    t.true(!!after.links && after.links.length > 0);
    const file = after.links[0]?.split('|')[0];
    if (!file) throw new Error('Link file not found');
    const exists = await fs.readFile(join(tmp, file), 'utf8');
    t.true(exists.length > 0);
});

test('ensureTaskStatusForCard writes status to linked task file', async (t) => {
    const tmp = await mkTmp();
    await fs.writeFile(join(tmp, 'y.md'), `# Y\n\nid: id-3\n#ready\n`);
    const md = `\n## Todo\n- [ ] [[y.md|Y]] <!-- id: id-3 -->\n`;
    const board = await MarkdownBoard.load(md);
    const card = board.listCards('Todo')[0];
    if (!card) throw new Error('Card not found');
    const changed = await ensureTaskStatusForCard(board, 'Todo', card, '#todo', tmp, false);
    t.true(changed);
    const content = await fs.readFile(join(tmp, 'y.md'), 'utf8');
    t.true(content.trimEnd().endsWith('#todo'));
});

test('detectPendingChanges finds cards needing updates', async (t) => {
    const md = `\n## Todo\n- [ ] [[x.md|X]] #ready <!-- id: id-4 -->\n`;
    const board = await MarkdownBoard.load(md);
    t.true(detectPendingChanges(board, { tasksDir: '/tmp', createMissingTasks: false }));
});

test('applyUpdates retags and writes task files', async (t) => {
    const tmp = await mkTmp();
    await fs.writeFile(join(tmp, 'z.md'), `# Z\n\nid: id-5\n#ready\n`);
    const md = `\n## Todo\n- [ ] [[z.md|Z]] #ready <!-- id: id-5 -->\n`;
    const board = await MarkdownBoard.load(md);
    const changed = await applyUpdates(board, { tasksDir: tmp, createMissingTasks: false });
    t.true(changed);
    const card = board.listCards('Todo')[0];
    if (!card) throw new Error('Card not found');
    t.true(card.tags.includes('todo'));
    const content = await fs.readFile(join(tmp, 'z.md'), 'utf8');
    t.true(content.trimEnd().endsWith('#todo'));
});

test('normalizeBoardInstance refreshes the in-memory AST', async (t) => {
    const md = `\n## Todo\n- [ ] A <!-- id: id-6 -->\n`;
    const board = await MarkdownBoard.load(md);
    // Manually mutate via updateCard and then normalize with an equivalent markdown
    const card = board.listCards('Todo')[0];
    if (!card) throw new Error('Card not found');
    await ensureCardStatus(board, 'Todo', card, '#todo');
    const before = board.listCards('Todo')[0];
    if (!before) throw new Error('Card not found before update');
    t.true(before.tags.includes('todo'));
    const roundTrip = await board.toMarkdown();
    await normalizeBoardInstance(board, roundTrip);
    const after = board.listCards('Todo')[0];
    if (!after) throw new Error('Card not found after update');
    t.true(after.tags.includes('todo'));
});
