// SPDX-License-Identifier: GPL-3.0-only
import type { Expr } from './ast';
import { gensym, type Module, type Fun, type Stmt, type Sym, type Rhs, type Val } from './ir';

export function lower(ast: Expr): Module {
    const env: Map<string, Sym> = new Map();
    const stmts: Stmt[] = [];
    const result = lowerExpr(ast, env, stmts);
    stmts.push({ k: 'ret', s: result });
    const main: Fun = { params: [], body: stmts };
    return { funs: [], main };
}

function lowerExpr(e: Expr, env: Map<string, Sym>, out: Stmt[]): Sym {
    switch (e.kind) {
        case 'Num':
            return bindVal(out, { t: 'lit', v: e.value });
        case 'Str':
            return bindVal(out, { t: 'lit', v: e.value });
        case 'Bool':
            return bindVal(out, { t: 'lit', v: e.value });
        case 'Null':
            return bindVal(out, { t: 'lit', v: null });
        case 'Var': {
            const s = env.get(e.name.text);
            if (!s) throw new Error(`unbound ${e.name.text}`);
            return s;
        }
        case 'Def': {
            // Define a named function in the current scope (supports recursion)
            const fname = gensym(e.name.text);
            // Allow the function to reference itself and be visible in this scope
            env.set(e.name.text, fname);

            const params: Sym[] = e.params.map((p) => gensym(p.text));
            const body: Stmt[] = [];
            const child = new Map(env);
            e.params.forEach((p, i) => child.set(p.text, params[i]));
            const ret = lowerExpr(e.body, child, body);
            body.push({ k: 'ret', s: ret });

            out.push({
                k: 'bind',
                s: fname,
                rhs: { r: 'val', v: { t: 'lambda', params, body } },
            });
            return fname;
        }
        case 'Let': {
            const v = lowerExpr(e.value, env, out);
            const s = gensym(e.name.text);
            out.push({ k: 'bind', s, rhs: { r: 'val', v: { t: 'var', s: v } } });
            const child = new Map(env);
            child.set(e.name.text, s);
            return lowerExpr(e.body, child, out);
        }
        case 'If': {
            const cond = lowerExpr(e.cond, env, out);
            const thenS: Stmt[] = [];
            const tRes = lowerExpr(e.then, new Map(env), thenS);
            const elS: Stmt[] = [];
            const eRes = lowerExpr(e.else, new Map(env), elS);
            // Join via let temp and branches assign to it
            const r = gensym('phi');
            thenS.push({
                k: 'bind',
                s: r,
                rhs: { r: 'val', v: { t: 'var', s: tRes } },
            });
            elS.push({
                k: 'bind',
                s: r,
                rhs: { r: 'val', v: { t: 'var', s: eRes } },
            });
            out.push({ k: 'if', cond, then: thenS, else: elS });
            return r;
        }
        case 'Fun': {
            const params: Sym[] = e.params.map((p) => gensym(p.text));
            // Capture environment via closure later; for now naive
            const body: Stmt[] = [];
            const child = new Map(env);
            e.params.forEach((p, i) => child.set(p.text, params[i]));
            const ret = lowerExpr(e.body, child, body);
            body.push({ k: 'ret', s: ret });
            const s = gensym('lam');
            out.push({
                k: 'bind',
                s,
                rhs: { r: 'val', v: { t: 'lambda', params, body } },
            });
            return s;
        }
        case 'Call': {
            const fn = lowerExpr(e.callee, env, out);
            const args = e.args.map((a) => lowerExpr(a, env, out));
            const s = gensym('call');
            out.push({ k: 'bind', s, rhs: { r: 'call', fn, args } });
            return s;
        }
        case 'Bin': {
            const a = lowerExpr(e.left, env, out);
            const b = lowerExpr(e.right, env, out);
            const op = binToPrim(e.op);
            const s = gensym('bin');
            out.push({ k: 'bind', s, rhs: { r: 'prim', op, a, b } });
            return s;
        }
        case 'Un': {
            const a = lowerExpr(e.expr, env, out);
            const op = e.op === '!' ? 'not' : e.op === '-' ? 'sub' : 'add';
            const s = gensym('un');
            out.push({ k: 'bind', s, rhs: { r: 'prim', op: op as any, a } });
            return s;
        }
        case 'Block': {
            let last: Sym = gensym('unit');
            for (const x of e.exprs) last = lowerExpr(x, env, out);
            return last;
        }
        default: {
            throw new Error(`Unhandled Expr kind in lower: ${(e as any).kind}`);
        }
    }
}

function bindVal(out: Stmt[], v: Val): Sym {
    const s = gensym('v');
    out.push({ k: 'bind', s, rhs: { r: 'val', v } });
    return s;
}
function binToPrim(op: string) {
    switch (op) {
        case '+':
            return 'add';
        case '-':
            return 'sub';
        case '*':
            return 'mul';
        case '/':
            return 'div';
        case '%':
            return 'mod';
        case '<':
            return 'lt';
        case '>':
            return 'gt';
        case '<=':
            return 'le';
        case '>=':
            return 'ge';
        case '==':
            return 'eq';
        case '!=':
            return 'ne';
        default:
            throw new Error(`op ${op}`);
    }
}

// Exhaustiveness helper was removed to allow partial lowering while
// the AST grows new forms. Runtime error above preserves visibility.
