import test from 'ava';
import { tsToLisp } from './ts2lisp';

test('transpiles TypeScript to Lisp', async (t) => {
    const src = 'const x: number = 1 + 2;';
    const { lisp } = await tsToLisp(src);
    t.true(lisp.includes('(+ 1 2)'));
});
