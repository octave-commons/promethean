import test from 'ava';
import { canonicalUrl, isUrlAllowed, urlHash } from '../web/url.js';

test('canonicalUrl normalizes urls', (t) => {
    const normalized = canonicalUrl('HTTP://Example.com:80/a//b/../?b=2&a=1#frag');
    t.is(normalized, 'http://example.com/a?a=1&b=2');
});

test('canonicalUrl strips tracking params', (t) => {
    const normalized = canonicalUrl('https://example.com/?b=2&utm_source=newsletter&a=1&fbclid=123');
    t.is(normalized, 'https://example.com/?a=1&b=2');
});

test('urlHash hashes canonical url', (t) => {
    const h1 = urlHash('http://example.com');
    const h2 = urlHash('HTTP://example.com:80/');
    t.is(h1, h2);
});

test('isUrlAllowed blocks dangerous schemes', (t) => {
    t.false(isUrlAllowed('mailto:test@example.com'));
    t.false(isUrlAllowed('javascript:alert(1)'));
    t.true(isUrlAllowed('https://example.com'));
});
