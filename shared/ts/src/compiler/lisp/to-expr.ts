import type { Expr } from '../ast';
import { name as mkName } from '../ast';
import { S, List, Sym, Num, Str, Bool, Nil, isList, isSym, list, sym } from './syntax';

export function toExpr(x: S): Expr {
    switch (x.t) {
        case 'num':
            return { kind: 'Num', value: x.v, span: x.span! };
        case 'str':
            return { kind: 'Str', value: x.v, span: x.span! };
        case 'bool':
            return { kind: 'Bool', value: x.v, span: x.span! };
        case 'nil':
            return { kind: 'Null', span: x.span! };
        case 'sym':
            return {
                kind: 'Var',
                name: mkName(x.gensym ?? x.name, x.span!),
                span: x.span!,
            };
        case 'list':
            return listToExpr(x);
    }
}

function listToExpr(x: List): Expr {
    if (x.xs.length === 0) return { kind: 'Null', span: x.span! };

    const hd = x.xs[0];
    // core forms: (if c t e), (let ((a v) (b w)) body...), (fn (a b) body...), (begin ...), (quote v)
    if (isSym(hd, 'if')) {
        const [, c, t, e] = x.xs;
        return {
            kind: 'If',
            cond: toExpr(c),
            then: toExpr(t),
            else: toExpr(e),
            span: x.span!,
        };
    }
    if (isSym(hd, 'begin')) {
        const exprs = x.xs.slice(1).map(toExpr);
        const span = exprs[0]?.['span'] ?? x.span!;
        return { kind: 'Block', exprs, span };
    }
    if (isSym(hd, 'quote')) {
        // quote datum -> turn into a JS literal via simple conversion (lists to nested arrays)
        const v = datumToJs(x.xs[1]);
        return { kind: 'Str', value: JSON.stringify(v), span: x.span! }; // simplest: embed JSON string (you can upgrade to tagged data)
    }
    if (isSym(hd, 'let')) {
        // (let ((a v) (b w)) body...)
        const bindings = (x.xs[1] as List).xs.map((b) => (b as List).xs);
        let body = x.xs.slice(2).reduceRight((acc, e) => list([sym('begin'), e, acc]), sym('nil') as S);
        // desugar chain into nested lets
        for (let i = bindings.length - 1; i >= 0; i--) {
            const [n, v] = bindings[i];
            body = list([sym('let1'), n, v, body]);
        }
        return toExpr(body);
    }
    if (isSym(hd, 'let1')) {
        const [, n, v, body] = x.xs;
        return {
            kind: 'Let',
            name: mkName((n as Sym).gensym ?? (n as Sym).name, n.span!),
            value: toExpr(v),
            body: toExpr(body),
            span: x.span!,
        };
    }
    if (isSym(hd, 'fn') || isSym(hd, 'lambda')) {
        const params = ((x.xs[1] as List).xs as Sym[]).map((s) => mkName(s.gensym ?? s.name, s.span!));
        const bodyS = x.xs.slice(2);
        const body = bodyS.length === 1 ? toExpr(bodyS[0]) : toExpr(list([sym('begin'), ...bodyS]));
        return { kind: 'Fun', params, body, span: x.span! };
    }

    if (isSym(hd, 'class')) {
        const [, nameS, fieldsList, methodsList] = x.xs;
        const name = mkName((nameS as Sym).name, nameS.span!);
        const fields = ((fieldsList as List).xs as Sym[]).map((s) => mkName(s.name, s.span!));
        const methods = (methodsList as List).xs.map((m) => {
            const [mn, paramsList, ...bodyS] = (m as List).xs;
            const mname = mkName((mn as Sym).name, mn.span!);
            const params = ((paramsList as List).xs as Sym[]).map((s) => mkName(s.name, s.span!));
            const body = bodyS.length === 1 ? toExpr(bodyS[0]) : toExpr(list([sym('begin'), ...bodyS]));
            return { name: mname, params, body };
        });
        return { kind: 'Class', name, fields, methods, span: x.span! };
    }
    if (isSym(hd, 'new')) {
        return {
            kind: 'New',
            ctor: toExpr(x.xs[1]),
            args: x.xs.slice(2).map(toExpr),
            span: x.span!,
        };
    }
    if (isSym(hd, 'get')) {
        const [, obj, prop] = x.xs;
        return {
            kind: 'Get',
            obj: toExpr(obj),
            prop: (prop as Sym).name,
            span: x.span!,
        };
    }
    if (isSym(hd, 'set')) {
        const [, obj, prop, value] = x.xs;
        return {
            kind: 'Set',
            obj: toExpr(obj),
            prop: (prop as Sym).name,
            value: toExpr(value),
            span: x.span!,
        };
    }
    if (isSym(hd, 'call')) {
        const [, obj, method, ...args] = x.xs;
        return {
            kind: 'MethodCall',
            obj: toExpr(obj),
            method: (method as Sym).name,
            args: args.map(toExpr),
            span: x.span!,
        };
    }

    // infix ops map to Bin/Un, else -> Call
    const binOp = new Set(['+', '-', '*', '/', '%', '<', '>', '<=', '>=', '==', '!=']);
    const unOp = new Set(['not', 'neg']);
    if (hd.t === 'sym' && binOp.has(hd.name) && x.xs.length === 3) {
        return {
            kind: 'Bin',
            op: hd.name,
            left: toExpr(x.xs[1]),
            right: toExpr(x.xs[2]),
            span: x.span!,
        } as any;
    }
    if (hd.t === 'sym' && hd.name === '-' && x.xs.length === 2) {
        return { kind: 'Un', op: '-', expr: toExpr(x.xs[1]), span: x.span! } as any;
    }
    if (hd.t === 'sym' && hd.name === 'not' && x.xs.length === 2) {
        return { kind: 'Un', op: '!', expr: toExpr(x.xs[1]), span: x.span! } as any;
    }

    // function call: (f a b c)
    return {
        kind: 'Call',
        callee: toExpr(hd),
        args: x.xs.slice(1).map(toExpr),
        span: x.span!,
    };
}

function datumToJs(x: any): any {
    if (x.t === 'num' || x.t === 'str' || x.t === 'bool') return x.v;
    if (x.t === 'nil') return null;
    if (x.t === 'sym') return x.name;
    if (x.t === 'list') return x.xs.map(datumToJs);
    return null;
}
