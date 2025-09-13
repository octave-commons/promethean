import test from 'ava';

import { makeDeterministicEmbedder, assertDim } from './embedder.js';

test('deterministic embedder returns fixed dimension', async (t) => {
    const e = makeDeterministicEmbedder({ modelId: 'det:v1', dim: 12 });
    const v = await e.embedOne('hello');
    t.is(v.length, 12);
    const vs = await e.embedMany(['a', 'b', 'c']);
    t.is(vs.length, 3);
    t.true(vs.every((x) => x.length === 12));
});

test('assertDim throws on mismatch', (t) => {
    t.throws(() => assertDim([1, 2, 3] as unknown as number[], 2));
    t.throws(() =>
        assertDim(
            [
                [1, 2],
                [1, 2, 3],
            ] as unknown as number[][],
            2,
        ),
    );
});
