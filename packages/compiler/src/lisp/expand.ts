// SPDX-License-Identifier: GPL-3.0-only
import { S, List, Sym, isList, isSym, list, sym } from './syntax';
import { MacroEnv, installCoreMacros } from './macros';

export function macroexpandAll(forms: S[], user?: (m: MacroEnv) => void): S[] {
    const M = new MacroEnv();
    installCoreMacros(M);
    user?.(M); // allow host to preinstall macros

    // one pass that registers top-level defmacros, then expand everything
    const expanded: S[] = [];
    for (const f of forms) {
        if (isList(f, 'defmacro')) {
            expand(f, M);
            continue;
        }
        const e = expand(f, M);
        expanded.push(e);
    }
    return expanded;
}

function expand(x: S, M: MacroEnv): S {
    // atoms unchanged
    if (x.t !== 'list' || x.xs.length === 0) return x;

    // handle defmacro at top or nested (register and return nil)
    if (isList(x, 'defmacro')) {
        const head = (x as List).xs[0] as Sym;
        const fn = M.get('defmacro')!;
        return fn(x as List, (y) => expand(y, M));
    }

    // macro call?
    const head = (x as List).xs[0];
    if (head.t === 'sym' && M.has(head.name)) {
        const fn = M.get(head.name)!;
        const out = fn(x as List, (y) => expand(y, M));
        return expand(out, M);
    }

    // special forms that must not expand their operands eagerly can be handled here if needed.

    // otherwise recursively expand elements
    return list(
        x.xs.map((e) => expand(e, M)),
        x.span,
    );
}
