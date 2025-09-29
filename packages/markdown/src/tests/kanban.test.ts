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
