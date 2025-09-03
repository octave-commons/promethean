// SPDX-License-Identifier: GPL-3.0-only
import test from 'ava';
import { MarkdownBoard } from '@promethean/markdown/kanban.js';

test('kanban: parses id, text, done, tags, links', async (t) => {
    const md = `\n## Todo\n- [ ] Title #tag [[file.md|Alias]] <!-- id: a-1 -->\n`;
    const board = await MarkdownBoard.load(md);
    const cards = board.listCards('Todo');
    t.is(cards.length, 1);
    const c = cards[0]!;
    t.is(c.id, 'a-1');
    t.is(c.text, 'Title');
    t.false(c.done);
    t.true(c.tags.includes('tag'));
    t.is(c.links[0], 'file.md|Alias');
});

test('kanban: updateCard sets tags and links', async (t) => {
    const md = `\n## Todo\n- [ ] Item <!-- id: z-9 -->\n`;
    const board = await MarkdownBoard.load(md);
    board.updateCard('z-9', { tags: ['todo'], links: ['y.md|Y'] });
    const c = board.listCards('Todo')[0]!;
    t.true(c.tags.includes('todo'));
    t.is(c.links[0], 'y.md|Y');
    const out = await board.toMarkdown();
    t.true(/\[\[y\.md\|Y\]\]/.test(out));
    t.true(/#todo/.test(out));
});

test('kanban: addCard/removeCard works', async (t) => {
    const md = `\n## Todo\n- [ ] A <!-- id: aa-1 -->\n`;
    const board = await MarkdownBoard.load(md);
    const id = board.addCard('Todo', { text: 'B' });
    t.true(board.listCards('Todo').some((c: any) => c.id === id));
    board.removeCard('Todo', id);
    t.false(board.listCards('Todo').some((c: any) => c.id === id));
});
