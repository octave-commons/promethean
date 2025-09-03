// SPDX-License-Identifier: GPL-3.0-only
import { S, List, Sym, list, sym, isList, isSym, gensym } from './syntax';
import { qq } from './qq';

export type MacroFn = (form: List, expand: (x: S) => S) => S;
export class MacroEnv {
    private m = new Map<string, MacroFn>();
    define(name: string, fn: MacroFn) {
        this.m.set(name, fn);
    }
    get(name: string) {
        return this.m.get(name);
    }
    has(name: string) {
        return this.m.has(name);
    }
}

// (defmacro name (a b . rest) `(... ,a ,@rest ...))
export function installCoreMacros(M: MacroEnv) {
    // defmacro
    M.define('defmacro', (form, expand) => {
        // (defmacro name (params...) body)
        const [_tag, nameS, paramsList, body] = form.xs;
        const name = (nameS as Sym).name;
        const { params, rest } = parseParams(paramsList as List);

        const fn: MacroFn = (call, expand2) => {
            const args = call.xs.slice(1);
            const env: Record<string, S> = {};
            params.forEach((p, i) => (env[p] = args[i]));
            if (rest) env[rest] = list(args.slice(params.length));
            // body is typically a quasiquote; run qq with env
            const expanded = isList(body, 'quasiquote') ? qq(body, env) : body;
            return expand(expanded); // allow nested macros inside result
        };
        M.define(name, fn);
        return sym('nil');
    });

    // when
    M.define('when', (form, expand) => {
        // (when test a b c) => (if test (begin a b c) nil)
        const [_tag, test, ...body] = form.xs;
        const begin = list([sym('begin'), ...body]);
        return list([sym('if'), test, begin, sym('nil')]);
    });

    // unless
    M.define('unless', (form, expand) => {
        const [_tag, test, ...body] = form.xs;
        const begin = list([sym('begin'), ...body]);
        return list([sym('if'), list([sym('not'), test]), begin, sym('nil')]);
    });

    // -> (thread-first)
    M.define('->', (form, expand) => {
        // (-> x (f 1) (g 2)) => (g (f x 1) 2)
        const [_tag, x, ...steps] = form.xs;
        let acc = x;
        for (const s of steps) {
            if (s.t !== 'list' || s.xs.length === 0) continue;
            const [f, ...args] = s.xs;
            acc = list([f, acc, ...args], s.span);
        }
        return acc;
    });

    // let* sugar -> nested lets
    M.define('let*', (form) => {
        // (let* ((a 1)(b 2)) body) => (let ((a 1)) (let ((b 2)) body))
        const [_tag, bindings, body] = form.xs;
        const pairs = (bindings as List).xs.map((b) => (b as List).xs);
        let acc = body;
        for (let i = pairs.length - 1; i >= 0; i--) {
            const [n, v] = pairs[i];
            acc = list([sym('let'), list([list([n, v])]), acc]);
        }
        return acc;
    });

    // cond -> nested ifs
    M.define('cond', (form) => {
        const [_tag, ...clauses] = form.xs;
        const expandClause = (i: number): S => {
            if (i >= clauses.length) return sym('nil');
            const clause = clauses[i] as List;
            const [test, ...body] = clause.xs;
            if (isSym(test, 'else')) return list([sym('begin'), ...body]);
            return list([sym('if'), test, list([sym('begin'), ...body]), expandClause(i + 1)]);
        };
        return expandClause(0);
    });

    // defclass
    M.define('defclass', (form) => {
        const [_tag, nameS, fields, methods] = form.xs;
        return list([sym('let1'), nameS, list([sym('class'), nameS, fields, methods]), nameS]);
    });
}

function parseParams(p: List): { params: string[]; rest?: string } {
    // (a b c) or (a b . rest)
    const xs = p.xs;
    const params: string[] = [];
    let rest: string | undefined;
    for (let i = 0; i < xs.length; i++) {
        const a = xs[i];
        if (a.t === 'sym' && a.name === '.') {
            rest = (xs[i + 1] as Sym).name;
            break;
        }
        params.push((a as Sym).name);
    }
    return { params, rest };
}
