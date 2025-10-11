import test from 'ava';
import { MarkdownBoard } from '@promethean/markdown/kanban.js';

const sampleMarkdown = `---
title: Test Board
---

## Todo
- [ ] First task #urgent [[Note1]] {priority:high} <!-- id: 1234-aaaa -->
- [x] Done task #done <!-- id: 5678-bbbb -->

## Doing
- [ ] In progress <!-- id: 9999-cccc -->
`;

test('loads board and parses columns', async (t) => {
    const board = await MarkdownBoard.load(sampleMarkdown);
    const columns = board.listColumns();
    t.deepEqual(
        columns.map((c: any) => c.name),
        ['Todo', 'Doing'],
    );
});

test('parses cards with tags, links, attrs, and done state', async (t) => {
    const board = await MarkdownBoard.load(sampleMarkdown);
    const todoCards = board.listCards('Todo');
    t.is(todoCards.length, 2);
    t.like(todoCards[0], {
        id: '1234-aaaa',
        text: 'First task',
        done: false,
        tags: ['urgent'],
        links: ['Note1'],
        attrs: { priority: 'high' },
    });
    t.like(todoCards[1], {
        id: '5678-bbbb',
        done: true,
        tags: ['done'],
    });
});

test('adds and removes columns', async (t) => {
    const board = await MarkdownBoard.load(sampleMarkdown);
    board.addColumn('Review');
    t.true(
        board
            .listColumns()
            .map((c: any) => c.name)
            .includes('Review'),
    );
    board.removeColumn('Todo');
    t.false(
        board
            .listColumns()
            .map((c: any) => c.name)
            .includes('Todo'),
    );
});

test('adds, removes, moves, and updates cards', async (t) => {
    const board = await MarkdownBoard.load(sampleMarkdown);
    const newId = board.addCard('Todo', { text: 'New card', tags: ['new'] });
    let todoCards = board.listCards('Todo');
    t.true(todoCards.some((c: any) => c.id === newId));

    board.removeCard('Todo', newId);
    todoCards = board.listCards('Todo');
    t.false(todoCards.some((c: any) => c.id === newId));

    // Move card
    board.moveCard('9999-cccc', 'Doing', 'Todo');
    t.true(board.listCards('Todo').some((c: any) => c.id === '9999-cccc'));
    t.false(board.listCards('Doing').some((c: any) => c.id === '9999-cccc'));

    // Update card
    board.updateCard('1234-aaaa', { text: 'Updated', done: true, tags: ['updated'] });
    const updated = board.listCards('Todo').find((c: any) => c.id === '1234-aaaa');
    t.is(updated?.text, 'Updated');
    t.true(updated?.done);
    t.true(updated?.tags.includes('updated'));
});

test('finds cards by query', async (t) => {
    const board = await MarkdownBoard.load(sampleMarkdown);
    const found = board.findCards({ tag: 'urgent' });
    t.is(found.length, 1);
    t.is(found[0]?.card.id, '1234-aaaa');
    const doneCards = board.findCards({ done: true });
    t.is(doneCards.length, 1);
    t.is(doneCards[0]?.card.id, '5678-bbbb');
});

test('serializes back to markdown', async (t) => {
    const board = await MarkdownBoard.load(sampleMarkdown);
    const md = await board.toMarkdown();
    t.is(typeof md, 'string');
    t.true(md.includes('## Todo'));
    t.true(md.includes('First task'));
});
