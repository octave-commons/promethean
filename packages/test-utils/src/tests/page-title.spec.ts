import test from 'ava';

import { withPage } from '../page.js';

test('withPage macro exposes default title', (t) => {
    t.is(withPage.title?.('', { baseUrl: '' }, async () => {}), 'withPage');
});

test('withPage macro title uses provided', (t) => {
    t.is(withPage.title?.('Custom', { baseUrl: '' }, async () => {}), 'Custom');
});
