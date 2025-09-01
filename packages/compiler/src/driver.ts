import { parse } from './parser';
import { lower } from './lower';
import { compileToBytecode, runBytecode } from './vm';

export function compileAndRun(src: string) {
    const ast = parse(src);
    const ir = lower(ast);
    const bc = compileToBytecode(ir);
    const out = runBytecode(bc);
    return { ast, ir, bc, out };
}

// quick demo:
// const r = compileAndRun(`let x = 2 + 3 in if x > 3 then x*10 else 0`);
// console.log(r.out); // 50
