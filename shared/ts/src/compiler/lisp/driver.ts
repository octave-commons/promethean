// @ts-nocheck
import { read } from './reader';
import { macroexpandAll } from './expand';
import { toExpr } from './to-expr';
import { lower } from '../lower';
import { emitJS } from '../jsgen';

export function compileLispToJS(src: string, { pretty = false, importNames = [] as string[] } = {}) {
    const forms = read(src);
    const expanded = macroexpandAll(forms);
    // stitch multiple top-level forms into (begin ...)
    const program =
        expanded.length === 1 ? expanded[0] : ({ t: 'list', xs: [{ t: 'sym', name: 'begin' }, ...expanded] } as any);
    const ast = toExpr(program as any);
    // Generate JS directly from AST (IR is for bytecode backend)
    const js = emitJS(ast, { iife: false, importNames, pretty });
    return { forms, expanded, ast, js };
}

export function runLisp(src: string, imports: Record<string, any> = {}) {
    const { js } = compileLispToJS(src);
    const fn = (0, eval)(js);
    return fn(imports);
}
