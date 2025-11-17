import { emitJS } from '../jsgen.js';

import { read } from './reader.js';
import { macroexpandAll } from './expand.js';
import { toExpr } from './to-expr.js';
import { sym, isList } from './syntax.js';

export function compileLispToJS(src: string, { pretty = false, importNames = [] as string[] } = {}) {
    const forms = read(src);
    const expanded = macroexpandAll(forms);
    if (expanded.length && isList(expanded[expanded.length - 1], 'defun')) {
        expanded.push(sym('nil'));
    }
    const program = {
        t: 'list',
        xs: [{ t: 'sym', name: 'begin' }, ...expanded],
    } as any;
    const ast = toExpr(program);
    const js = emitJS(ast, { iife: false, importNames, pretty });
    return { forms, expanded, ast, js };
}

export function runLisp(src: string, imports: Record<string, unknown> = {}) {
    const { js } = compileLispToJS(src);
    const fn = (0, eval)(js) as (imports: Record<string, unknown>) => unknown;
    return fn(imports);
}
