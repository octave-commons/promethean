import type * as EST from 'estree';
import { S, Sym, Num, Str, Bool, Nil, List, sym, num, str, bool, list, nil } from './syntax.js';

export interface Js2LispOptions {
    // When true, try to fold "let v; v = EXPR;" into one (let ((v EXPR)) ...)
    foldLetInits?: boolean;
    // Map certain globals to (js/global "...") instead of identifiers.
    globals?: string[]; // e.g., ["document", "Image", "console"]
}

/** Convert a whole Program AST to a list of Lisp forms. */
export function estreeProgramToLisp(ast: EST.Program, opts: Js2LispOptions = {}): S[] {
    // Peel a top-level IIFE our emitter uses: (function(imports){ ... })(...)
    if (ast.body.length === 1 && ast.body[0].type === 'ExpressionStatement') {
        const ce = ast.body[0].expression;
        if (
            ce.type === 'CallExpression' &&
            (ce.callee.type === 'FunctionExpression' || ce.callee.type === 'ArrowFunctionExpression')
        ) {
            const fn = ce.callee as EST.FunctionExpression | EST.ArrowFunctionExpression;
            // Take function body statements
            const forms = stmtsToForms(asBlockBody(fn.body), opts);
            return forms;
        }
    }
    return stmtsToForms(ast.body as EST.Statement[], opts);
}

/** Turn an array of JS statements into Lisp forms (possibly wrapping lets). */
function stmtsToForms(stmts: EST.Statement[], opts: Js2LispOptions): S[] {
    if (opts.foldLetInits) {
        stmts = foldLetInitializers(stmts);
    }
    const out: S[] = [];
    for (const st of stmts) {
        const f = stmt(st, opts);
        if (f) {
            if (f.t === 'list' && f.xs.length && (f.xs[0] as Sym).name === 'begin') {
                out.push(...f.xs.slice(1)); // flatten begin
            } else {
                out.push(f);
            }
        }
    }
    return out;
}

function stmt(n: EST.Statement, opts: Js2LispOptions): S | null {
    switch (n.type) {
        case 'VariableDeclaration': {
            // (let ((a init?) (b init?)) body...) — we emit as a bare let with nil body for now
            const pairs: S[] = [];
            for (const d of n.declarations) {
                if (d.id.type !== 'Identifier') continue;
                const name = sym(d.id.name);
                const init = d.init ? expr(d.init, opts) : sym('undefined');
                pairs.push(list([name, init]));
            }
            return list([sym('let'), list(pairs), sym('nil')]);
        }
        case 'ExpressionStatement':
            return expr(n.expression as EST.Expression, opts);
        case 'ReturnStatement':
            return n.argument ? expr(n.argument, opts) : sym('nil');
        case 'IfStatement': {
            const c = expr(n.test, opts);
            const t = blockOrSingle(n.consequent, opts);
            const e = n.alternate ? blockOrSingle(n.alternate, opts) : sym('nil');
            return list([sym('if'), c, t, e]);
        }
        case 'BlockStatement': {
            const xs = n.body.map((s) => stmt(s, opts)).filter(Boolean) as S[];
            return list([sym('begin'), ...xs]);
        }
        case 'ForStatement':
        case 'WhileStatement':
        case 'DoWhileStatement':
            return str('/* loop unsupported */');
        default:
            // Not yet: FunctionDeclaration (rare in our output), Try/Catch, Switch, etc.
            // Represent unknown as a comment-ish string literal to keep going.
            return str(`/* unsupported: ${n.type} */`);
    }
}

function blockOrSingle(s: EST.Statement, opts: Js2LispOptions): S {
    return s.type === 'BlockStatement' ? stmt(s, opts)! : stmt({ type: 'BlockStatement', body: [s] } as any, opts)!;
}

function expr(n: EST.Expression, opts: Js2LispOptions): S {
    switch (n.type) {
        case 'Identifier': {
            // Optional: turn globals into (js/global "name") if configured and unshadowed
            if (opts.globals?.includes(n.name)) {
                return list([sym('js/global'), str(n.name)]);
            }
            return sym(n.name);
        }
        case 'Literal': {
            const v = (n as EST.Literal).value;
            if (v === null) return sym('nil');
            if (typeof v === 'number') return num(v);
            if (typeof v === 'string') return str(v);
            if (typeof v === 'boolean') return bool(v);
            return str(String(v));
        }
        case 'UnaryExpression': {
            const a = expr(n.argument, opts);
            if (n.operator === '!') return list([sym('not'), a]);
            if (n.operator === '-') return list([sym('-'), a]);
            if (n.operator === '+') return a;
            return list([sym('/*unary*/'), str(n.operator), a]);
        }
        case 'BinaryExpression': {
            const a = expr(n.left as EST.Expression, opts),
                b = expr(n.right as EST.Expression, opts);
            return list([sym(n.operator as any), a, b]);
        }
        case 'LogicalExpression': {
            const a = expr(n.left, opts),
                b = expr(n.right, opts);
            return list([sym(n.operator === '&&' ? 'and' : 'or'), a, b]);
        }
        case 'ConditionalExpression': {
            return list([sym('if'), expr(n.test, opts), expr(n.consequent, opts), expr(n.alternate, opts)]);
        }
        case 'AssignmentExpression': {
            // If target is member -> (js/set!)
            if (n.left.type === 'MemberExpression') {
                const { obj, key } = member(n.left, opts);
                return list([sym('js/set!'), obj, key, expr(n.right, opts)]);
            }
            if (n.left.type === 'Identifier') {
                // Fallback: (set! x rhs)
                return list([sym('set!'), sym(n.left.name), expr(n.right, opts)]);
            }
            return str('/* complex assignment unsupported */');
        }
        case 'MemberExpression': {
            const { obj, key } = member(n, opts);
            return list([sym('js/get'), obj, key]);
        }
        case 'CallExpression': {
            // Method vs free call
            if (n.callee.type === 'MemberExpression') {
                const { obj, key } = member(n.callee, opts);
                const args = n.arguments.map((a) => expr(a as EST.Expression, opts));
                return list([sym('js/call'), obj, key, ...args]);
            }
            const cal = expr(n.callee as EST.Expression, opts);
            const args = n.arguments.map((a) => expr(a as EST.Expression, opts));
            return list([cal, ...args]);
        }
        case 'NewExpression': {
            const ctor = expr(n.callee as EST.Expression, opts);
            const args = (n.arguments ?? []).map((a) => expr(a as EST.Expression, opts));
            return list([sym('js/new'), ctor, ...args]);
        }
        case 'ArrowFunctionExpression':
        case 'FunctionExpression': {
            const params = n.params.map((p) => sym((p as EST.Identifier).name));
            const body = asBlockBody((n as any).body)
                .map((s) => stmt(s, opts)!)
                .filter(Boolean) as S[];
            return list([sym('fn'), list(params), ...(body.length ? body : [sym('nil')])]);
        }
        case 'SequenceExpression': {
            // (a, b, c) => (begin a b c)
            const xs = n.expressions.map((e) => expr(e, opts));
            return list([sym('begin'), ...xs]);
        }
        case 'TemplateLiteral':
            if (n.expressions.length === 0) return str(n.quasis[0]?.value.cooked ?? '');
            // naive: turn into (+ "a" x "b" y "c")
            const parts: S[] = [];
            for (let i = 0; i < n.quasis.length; i++) {
                const q = n.quasis[i];
                if (q.value.cooked) parts.push(str(q.value.cooked));
                if (i < n.expressions.length) parts.push(expr(n.expressions[i] as EST.Expression, opts));
            }
            return list([sym('+'), ...parts]);
        default:
            return str(`/* expr unsupported: ${n.type} */`);
    }
}

function member(n: EST.MemberExpression, opts: Js2LispOptions): { obj: S; key: S; callStyle: 'dot' | 'bracket' } {
    const obj = expr(n.object as EST.Expression, opts);
    if (n.computed) {
        return {
            obj,
            key: expr(n.property as EST.Expression, opts),
            callStyle: 'bracket',
        };
    }
    const id = (n.property as EST.Identifier).name;
    return { obj, key: str(id), callStyle: 'dot' };
}

function asBlockBody(b: EST.BlockStatement | EST.Expression): EST.Statement[] {
    if (b.type === 'BlockStatement') return b.body;
    // Arrow single expression: synthesize return
    return [{ type: 'ReturnStatement', argument: b } as EST.ReturnStatement];
}

/** Fold patterns like: let x; x = EXPR;  → let x = EXPR; */
function foldLetInitializers(stmts: EST.Statement[]): EST.Statement[] {
    const out: EST.Statement[] = [];
    const pending = new Map<string, EST.VariableDeclarator>();

    function flushPending() {
        if (!pending.size) return;
        out.push({
            type: 'VariableDeclaration',
            kind: 'let',
            declarations: Array.from(pending.values()),
        } as any);
        pending.clear();
    }

    for (let i = 0; i < stmts.length; i++) {
        const s = stmts[i];
        if (s.type === 'VariableDeclaration' && s.kind === 'let') {
            // capture decls into pending
            for (const d of s.declarations) {
                if (d.id.type === 'Identifier' && !d.init) {
                    pending.set(d.id.name, { ...d });
                } else {
                    flushPending();
                    out.push(s);
                }
            }
            continue;
        }
        if (
            s.type === 'ExpressionStatement' &&
            s.expression.type === 'AssignmentExpression' &&
            s.expression.operator === '=' &&
            s.expression.left.type === 'Identifier' &&
            pending.has(s.expression.left.name)
        ) {
            // upgrade pending initializer
            const decl = pending.get(s.expression.left.name)!;
            decl.init = s.expression.right;
            continue; // don't emit assignment
        }
        // anything else breaks the folding window
        flushPending();
        out.push(s);
    }
    flushPending();
    return out;
}
