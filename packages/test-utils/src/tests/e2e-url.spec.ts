import test from 'ava';

import { mkUrlBuilder } from '../e2e.js';

test('mkUrlBuilder builds absolute URLs when base provided', (t) => {
    const url = mkUrlBuilder('http://localhost:1234/');
    t.is(url('/a'), 'http://localhost:1234/a');
    t.is(url('b'), 'http://localhost:1234/b');
});

test('mkUrlBuilder returns input when base missing', (t) => {
    const url = mkUrlBuilder();
    t.is(url('/a'), '/a');
    t.is(url('http://example.com/x'), 'http://example.com/x');
});
