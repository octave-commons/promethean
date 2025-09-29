import test, { type ExecutionContext } from 'ava';
import type { ReadonlyDeep } from 'type-fest';
import { headerToStatus, STATUS_ORDER, STATUS_SET } from '@promethean/markdown/statuses.js';

type TestAssertions = ReadonlyDeep<Pick<ExecutionContext<unknown>, 'is' | 'true' | 'false'>>;

const assertStatus = (t: TestAssertions, input: string, expected: string) => {
    t.is(headerToStatus(input), expected);
};

test('headerToStatus normalizes headers to status hashtag', (t: TestAssertions) => {
    t.is(headerToStatus('Todo'), '#todo');
    t.is(headerToStatus('In Progress'), '#in-progress');
    t.is(headerToStatus('  Ice Box  (12) '), '#ice-box');
    t.is(headerToStatus('🔥 Ready'), '#ready');
    t.is(headerToStatus(''), '');
});

test('headerToStatus safely removes trailing parentheticals', (t: TestAssertions) => {
    assertStatus(t, 'Focus (phase (alpha))', '#focus');
    assertStatus(t, 'Research (alpha (beta))   ', '#research');
    assertStatus(t, 'Status (notes) more details', '#status-(notes)-more-details');
    assertStatus(t, 'Edge (case', '#edge-(case');
});

test('headerToStatus handles large nested parentheticals', (t: TestAssertions) => {
    const nested = `Goal ${'('.repeat(10)}details${')'.repeat(10)}`;
    assertStatus(t, nested, '#goal');
});

test('status set contains known statuses and is stable', (t: TestAssertions) => {
    STATUS_ORDER.forEach((status) => {
        t.true(STATUS_SET.has(status));
    });
    t.true(STATUS_SET.has('#todo'));
    t.true(STATUS_SET.has('#in-progress'));
    t.false(STATUS_SET.has('#unknown'));
});
