import { S, List, Sym, Nil, isList, isSym, list, sym, nil } from './syntax';

export function qq(expr: S, env: Record<string, S>): S {
    // (quasiquote x) expands with , and ,@ substitutions from env
    if (!isList(expr, 'quasiquote')) return expr;
    return expand((expr as List).xs[1], env);
}

function expand(x: S, env: Record<string, S>): S {
    if (isList(x, 'unquote')) {
        const v = (x as List).xs[1];
        if (v.t !== 'sym') throw new Error('unquote expects symbol');
        return env[v.name] ?? env[(v as any).gensym ?? ''] ?? v;
    }
    if (isList(x, 'unquote-splicing')) {
        throw new Error(',@ only valid inside list contexts');
    }
    if (x.t !== 'list') return x;
    // build list, handling splices
    const out: S[] = [];
    for (const el of x.xs) {
        if (isList(el, 'unquote-splicing')) {
            const v = (el as List).xs[1];
            if (v.t !== 'sym') throw new Error(',@ expects symbol');
            const xs = env[v.name] ?? env[(v as any).gensym ?? ''];
            if (!xs || xs.t !== 'list') throw new Error(',@ needs a list');
            out.push(...xs.xs);
        } else {
            out.push(expand(el, env));
        }
    }
    return list(out, x.span);
}
