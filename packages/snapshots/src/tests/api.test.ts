import test from 'ava';
import { sha1 } from '@promethean/utils';

import { etagOf } from '../etag.js';

test('sha1 hashes text to hex digest', (t) => {
    t.is(sha1('test'), 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3');
});

test('etagOf sorts object keys before hashing', (t) => {
    const shuffledDoc = { b: 2, a: 1 };
    const orderedDoc = { a: 1, b: 2 };
    const expected = '"' + sha1('{"a":1,"b":2}') + '"';

    t.is(etagOf(shuffledDoc), expected);
    t.is(etagOf(orderedDoc), expected);
});

test('etagOf canonicalizes nested structures', (t) => {
    const doc = {
        meta: { id: 'abc', created: '2024-01-01' },
        items: [
            { z: 1, y: 2 },
            { b: 3, a: 4 },
        ],
    };

    const expectedCanonical = '{"items":[{"y":2,"z":1},{"a":4,"b":3}],"meta":{"created":"2024-01-01","id":"abc"}}';
    const expected = '"' + sha1(expectedCanonical) + '"';

    t.is(etagOf(doc), expected);
});

test('etagOf matches JSON.stringify for primitives', (t) => {
    const text = 'hello';
    const number = 42;
    const bool = true;

    t.is(etagOf(text), '"' + sha1('"hello"') + '"');
    t.is(etagOf(number), '"' + sha1('42') + '"');
    t.is(etagOf(bool), '"' + sha1('true') + '"');
});
