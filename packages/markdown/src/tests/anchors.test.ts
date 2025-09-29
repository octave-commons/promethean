import test from 'ava';

import { anchorId, relMdLink, computeFenceMap, injectAnchors, type AnchorTarget } from '../anchors.js';

test('anchorId uses stable prefix and coordinates', (t) => {
    const id = anchorId('abc123456789', 10, 2);
    t.is(id, 'ref-abc12345-10-2');
    t.is(anchorId('', 1, 1), 'ref--1-1');
});

test('relMdLink resolves relative paths and optional anchors', (t) => {
    const from = '/root/docs/a/b/file.md';
    const to = '/root/docs/a/other.md';
    t.is(relMdLink(from, to), '../other.md');
    t.is(relMdLink(from, to, 'ref'), '../other.md#ref');
});

test('computeFenceMap marks every line inside fenced blocks', (t) => {
    const lines = ['before', '```js', 'code', '```', 'after'] as const;
    t.deepEqual(computeFenceMap(lines), [false, true, true, true, false]);
});

test('injectAnchors avoids fences and remains idempotent', (t) => {
    const md = ['# H', 'text line', '```', 'code line', '```', 'after'].join('\n');
    const anchors: readonly AnchorTarget[] = [
        { line: 4, id: 'ref-block-4-1' },
        { line: 6, id: 'ref-block-6-1' },
    ];
    const once = injectAnchors(md, anchors);
    const lines = once.split('\n');
    const openIdx = lines.indexOf('```');
    const closeIdx = lines.lastIndexOf('```');
    t.true(openIdx >= 0 && closeIdx >= 0);
    const anchorIdx = lines.findIndex((ln) => ln.includes('^ref-block-4-1'));
    t.true(anchorIdx > closeIdx);
    const fenceSection = lines.slice(openIdx, closeIdx + 1).join('\n');
    t.false(fenceSection.includes('^ref-block-6-1'));
    t.true(lines.some((ln) => ln.includes('^ref-block-6-1')));
    t.is(injectAnchors(once, anchors), once);
});
