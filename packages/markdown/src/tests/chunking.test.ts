import test from 'ava';

import { parseMarkdownChunks } from '../chunking.js';

test('parseMarkdownChunks extracts text and code with headings', (t) => {
    const md = [
        '# Title',
        '',
        'Paragraph one. Another sentence.',
        '',
        '- list item 1',
        '- list item 2',
        '',
        '```js',
        "console.log('x')",
        '```',
    ].join('\n');
    const chunks = parseMarkdownChunks(md);
    t.true(chunks.length >= 3);
    t.true(chunks.some((c) => c.kind === 'code'));
    t.true(chunks.some((c) => c.kind === 'text'));
    const titled = chunks.filter((c) => c.title === 'Title');
    t.true(titled.length > 0, 'chunks after heading should carry title');
    t.true(chunks.every((c) => c.startLine >= 1 && c.endLine >= c.startLine));
});
