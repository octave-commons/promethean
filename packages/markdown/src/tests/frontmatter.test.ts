import test from 'ava';
import * as path from 'node:path';

import {
    ensureBaselineFrontmatter,
    mergeFrontmatterWithGenerated,
    normalizeStringList,
    parseFrontmatter,
    stringifyFrontmatter,
} from '../frontmatter.js';

test('ensureBaselineFrontmatter uses docops-style created_at fallback', (t) => {
    type Front = { uuid?: string; created_at?: string; title?: string; filename?: string };
    const isoFromBasename = (name: string) => {
        const match = name.match(/(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})\.(\d{2})\.(\d{2})/);
        if (!match) return undefined;
        const [, y, m, d, hh, mm, ss] = match;
        return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
    };

    const filePath = '/docs/2024.05.10.12.34.56-note.md';
    const front: Front = { filename: 'Docops Note' };
    const baseline = ensureBaselineFrontmatter(front, {
        filePath,
        uuidFactory: () => 'uuid-123',
        createdAtFactory: ({ filePath: fp }) => (fp ? isoFromBasename(path.basename(fp)) : undefined),
    });

    t.deepEqual(baseline, {
        filename: 'Docops Note',
        uuid: 'uuid-123',
        created_at: '2024-05-10T12:34:56Z',
        title: 'Docops Note',
    });
    t.true(Object.isFrozen(baseline));
});

test('mergeFrontmatterWithGenerated mirrors docops merge behaviour', (t) => {
    const base = Object.freeze({
        uuid: 'u-1',
        created_at: 'ts',
    });

    const merged = mergeFrontmatterWithGenerated(
        base,
        {
            filename: 'generated-name',
            description: 'generated description ',
            tags: ['alpha', 'beta', 'alpha'],
        },
        {
            filePath: '/docs/fallback.md',
        },
    );

    t.deepEqual(merged, {
        uuid: 'u-1',
        created_at: 'ts',
        filename: 'generated-name',
        description: 'generated description',
        tags: ['alpha', 'beta'],
        title: 'generated-name',
    });
});

test('normalizeStringList trims and dedupes', (t) => {
    t.deepEqual(normalizeStringList([' a ', 'b', 'a', 1, null as unknown as string]), ['a', 'b']);
});

test('ensureBaselineFrontmatter reproduces process-unique defaults', (t) => {
    const baseline = ensureBaselineFrontmatter(
        {},
        {
            filePath: '/docs/example.md',
            uuidFactory: () => 'unique-uuid',
            createdAtFactory: ({ filePath: fp }) => (fp ? path.basename(fp) : undefined),
            fallbackTitle: 'example',
        },
    );

    t.deepEqual(baseline, {
        uuid: 'unique-uuid',
        created_at: 'example.md',
        title: 'example',
    });
});

test('ensureBaselineFrontmatter layers boardrev-style defaults', (t) => {
    const baseline = ensureBaselineFrontmatter(
        {},
        {
            filePath: '/tasks/foo-bar.md',
            uuidFactory: () => 'board-uuid',
            now: () => '2024-05-11T01:02:03Z',
            titleFactory: ({ content }) => (content ? content.match(/^#\s+(.+)$/m)?.[1] : undefined),
            fallbackTitle: 'foo bar',
            content: '# Task heading\nMore',
        },
    );

    t.deepEqual(baseline, {
        uuid: 'board-uuid',
        created_at: '2024-05-11T01:02:03Z',
        title: 'Task heading',
    });
});

test('parseFrontmatter and stringifyFrontmatter roundtrip', (t) => {
    const source = `---\nuuid: u1\ntitle: Sample\n---\nBody`;
    const parsed = parseFrontmatter(source);
    t.is(parsed.content.trim(), 'Body');
    t.deepEqual(parsed.data, { uuid: 'u1', title: 'Sample' });

    const next = stringifyFrontmatter(parsed.content, {
        ...parsed.data,
        title: 'Updated',
    });

    const reparsed = parseFrontmatter(next);
    t.deepEqual(reparsed.data, { uuid: 'u1', title: 'Updated' });
});
