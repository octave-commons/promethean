// SPDX-License-Identifier: GPL-3.0-only
import test from 'ava';
import { headerToStatus, STATUS_ORDER, STATUS_SET } from '@promethean/markdown/statuses.js';

test('headerToStatus normalizes headers to status hashtag', (t) => {
    t.is(headerToStatus('Todo'), '#todo');
    t.is(headerToStatus('In Progress'), '#in-progress');
    t.is(headerToStatus('  Ice Box  (12) '), '#ice-box');
    t.is(headerToStatus('🔥 Ready'), '#ready');
    t.is(headerToStatus(''), '');
});

test('status set contains known statuses and is stable', (t) => {
    for (const s of STATUS_ORDER) t.true(STATUS_SET.has(s));
    t.true(STATUS_SET.has('#todo'));
    t.true(STATUS_SET.has('#in-progress'));
    t.false(STATUS_SET.has('#unknown'));
});
