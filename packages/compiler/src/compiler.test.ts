import test from 'ava';
import { compileAndRun } from './driver.js';

test('compiler: compiles and runs basic program', (t) => {
    const src = 'let x = 2 + 3 in if x > 3 then x*10 else 0';
    const result = compileAndRun(src);
    t.is(result.out, 50);
});
