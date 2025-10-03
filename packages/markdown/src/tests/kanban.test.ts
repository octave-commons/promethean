import test from 'ava';

import { MarkdownBoard } from '../kanban.js';

test('card attribute serialization escapes quotes and backslashes', async (t) => {
    const board = await MarkdownBoard.load('');
    board.addColumn('Todo');
    const attrs = {
        path: 'C:\\Temp\\File "name"',
        note: 'needs space',
    } as const;
    board.addCard('Todo', {
        text: 'Example task',
        attrs: { ...attrs },
    });

    const md = await board.toMarkdown();
    const reloaded = await MarkdownBoard.load(md);
    const cards = reloaded.listCards('Todo');
    t.deepEqual(cards[0].attrs, attrs);
});

test('parsing cards keeps inline comments before id comment', async (t) => {
    const markdown = ['## Todo', '- [ ] Example <!-- note --> details <!-- id: card-1 -->'].join('\n');
    const board = await MarkdownBoard.load(markdown);
    const cards = board.listCards('Todo');
    t.is(cards.length, 1);
    const card = cards[0]!;
    t.is(card.id, 'card-1');
    t.is(card.text, 'Example <!-- note --> details');
    const roundTrip = await board.toMarkdown();
    t.true(roundTrip.includes('Example <!-- note --> details <!-- id: card-1 -->'));
});
