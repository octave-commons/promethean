// SPDX-License-Identifier: GPL-3.0-only
import test from 'ava';
import { normalizeChat, normalizeEmbed, normalizeError, normalizeStream } from '@promethean/parity/normalizers.js';

test('normalizeChat strips extras', (t) => {
    const input = {
        text: 'hi',
        usage: { tokens: 1 },
        finish_reason: 'done',
        extra: true,
    };
    t.deepEqual(normalizeChat(input), {
        text: 'hi',
        usage: { tokens: 1 },
        finish_reason: 'done',
    });
});

test('normalizeEmbed rounds numbers', (t) => {
    const input = { embedding: [0.123456789] };
    t.deepEqual(normalizeEmbed(input), { embedding: [0.123457] });
});

test('normalizeError returns code and message', (t) => {
    const err = { code: 400, message: 'bad', details: 'x' };
    t.deepEqual(normalizeError(err), { code: 400, message: 'bad' });
});

test('normalizeStream strips ids', (t) => {
    const chunks = [
        { id: 'a', text: 'one' },
        { id: 'b', text: 'two' },
    ];
    t.deepEqual(normalizeStream(chunks), [{ text: 'one' }, { text: 'two' }]);
});
