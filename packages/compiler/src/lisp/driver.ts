// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import { read } from './reader';
import { macroexpandAll } from './expand';
import { toExpr } from './to-expr';
import { sym, isList } from './syntax';
import { emitJS } from '../jsgen';

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
    const ast = toExpr(program as any);
    const js = emitJS(ast, { iife: false, importNames, pretty });
    return { forms, expanded, ast, js };
}

export function runLisp(src: string, imports: Record<string, any> = {}) {
    const { js } = compileLispToJS(src);
    const fn = (0, eval)(js);
    return fn(imports);
}
