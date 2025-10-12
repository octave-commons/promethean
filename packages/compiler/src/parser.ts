import { Diag, assert } from './common.js';
import type { Tok } from './lexer.js';
import { lex } from './lexer.js';
import type { Expr, Name } from './ast.js';
import { name as mkName } from './ast.js';

type Nud = () => Expr;
type Led = (left: Expr) => Expr;

type Op = { lbp: number; led?: Led; nud?: Nud };

export class Parser {
    private i = 0;
    constructor(private tokens: Tok[]) {}

    peek() {
        return this.tokens[this.i];
    }
    next() {
        return this.tokens[this.i++];
    }
    match(kind: Tok['kind'], text?: string) {
        const t = this.peek();
        if (t.kind === kind && (text === undefined || t.text === text)) {
            this.i++;
            return true;
        }
        return false;
    }
    expect(kind: Tok['kind'], text?: string) {
        const t = this.peek();
        if (t.kind !== kind || (text !== undefined && t.text !== text))
            throw new Diag(`expected ${text ?? kind} but got ${t.text}`, t.span);
        this.i++;
        return t;
    }

    parseProgram(): Expr {
        const exprs: Expr[] = [];
        while (this.peek().kind !== 'eof') {
            exprs.push(this.parseExpr(0));
            this.match('punct', ';'); // optional semis
        }
        const first = exprs[0]?.['span'] ?? this.peek().span;
        return {
            kind: 'Block',
            exprs,
            span: { ...first, end: this.peek().span.end },
        };
    }

    // Pratt machinery
    private ops = new Map<string, Op>();

    registerInfix(op: string, lbp: number) {
        const prev = this.ops.get(op) || { lbp };
        this.ops.set(op, {
            lbp,
            nud: prev.nud,
            led: (left) => {
                const right = this.parseExpr(lbp);
                return {
                    kind: 'Bin',
                    op,
                    left,
                    right,
                    span: { ...left.span, end: right.span.end },
                };
            },
        });
    }
    registerPrefix(op: string, lbp: number) {
        const prev = this.ops.get(op) || { lbp };
        this.ops.set(op, {
            lbp: Math.max(prev.lbp ?? 0, lbp),
            led: prev.led,
            nud: () => {
                const t = this.tokens[this.i - 1];
                const expr = this.parseExpr(lbp);
                return {
                    kind: 'Un',
                    op,
                    expr,
                    span: { ...t.span, end: expr.span.end },
                };
            },
        });
    }

    constructorOpsInit() {
        // precedence (lowest→highest): ||, &&, == !=, < > <= >=, + -, * / %, unary, call, primary
        for (const op of ['||']) this.registerInfix(op, 10);
        for (const op of ['&&']) this.registerInfix(op, 20);
        for (const op of ['==', '!=']) this.registerInfix(op, 30);
        for (const op of ['<', '>', '<=', '>=']) this.registerInfix(op, 40);
        for (const op of ['+', '-']) this.registerInfix(op, 50);
        for (const op of ['*', '/', '%']) this.registerInfix(op, 60);
        for (const op of ['!', '-', '+']) this.registerPrefix(op, 70);
    }

    parseExpr(rbp: number): Expr {
        const t = this.next();
        let left = this.nud(t);
        // postfix/call
        while (true) {
            const p = this.peek();
            // call: f(args)
            if (p.kind === 'punct' && p.text === '(' && 80 > rbp) {
                this.next();
                const args: Expr[] = [];
                if (!this.match('punct', ')')) {
                    do {
                        args.push(this.parseExpr(0));
                    } while (this.match('punct', ','));
                    this.expect('punct', ')');
                }
                left = {
                    kind: 'Call',
                    callee: left,
                    args,
                    span: { ...left.span, end: this.peek().span.end },
                };
                continue;
            }
            const op = p.kind === 'op' ? this.ops.get(p.text) : undefined;
            if (!op || !op.lbp || op.lbp <= rbp) break;
            this.next();
            left = assert(op.led)(left);
        }
        return left;
    }

    private nud(t: Tok): Expr {
        if (t.kind === 'num') return { kind: 'Num', value: Number(t.text), span: t.span };
        if (t.kind === 'str') return { kind: 'Str', value: t.text, span: t.span };
        if (t.kind === 'kw' && (t.text === 'true' || t.text === 'false'))
            return { kind: 'Bool', value: t.text === 'true', span: t.span };
        if (t.kind === 'kw' && t.text === 'null') return { kind: 'Null', span: t.span };

        // (expr)
        if (t.kind === 'punct' && t.text === '(') {
            const e = this.parseExpr(0);
            this.expect('punct', ')');
            return e;
        }

        // let name = value in body
        if (t.kind === 'kw' && t.text === 'let') {
            const id = this.expect('id');
            const nm = mkName(id.text, id.span);
            this.expect('op', '=');
            const value = this.parseExpr(0);
            this.expect('kw', 'in');
            const body = this.parseExpr(0);
            return {
                kind: 'Let',
                name: nm,
                value,
                body,
                span: { ...t.span, end: body.span.end },
            };
        }

        // if cond then a else b
        if (t.kind === 'kw' && t.text === 'if') {
            const cond = this.parseExpr(0);
            this.expect('kw', 'then');
            const th = this.parseExpr(0);
            this.expect('kw', 'else');
            const el = this.parseExpr(0);
            return {
                kind: 'If',
                cond,
                then: th,
                else: el,
                span: { ...t.span, end: el.span.end },
            };
        }

        // fun (a,b) => body
        if (t.kind === 'kw' && t.text === 'fun') {
            this.expect('punct', '(');
            const params: Name[] = [];
            if (!this.match('punct', ')')) {
                do {
                    const id = this.expect('id');
                    params.push(mkName(id.text, id.span));
                } while (this.match('punct', ','));
                this.expect('punct', ')');
            }
            this.expect('op', '=>');
            const body = this.parseExpr(0);
            return {
                kind: 'Fun',
                params,
                body,
                span: { ...t.span, end: body.span.end },
            };
        }

        // identifier
        if (t.kind === 'id') return { kind: 'Var', name: mkName(t.text, t.span), span: t.span };

        // prefix operator?
        if (t.kind === 'op') {
            const op = this.ops.get(t.text);
            if (op?.nud) return op.nud();
        }

        throw new Diag(`unexpected token ${t.text}`, t.span);
    }
}

export function parse(src: string): Expr {
    const p = new Parser(lex(src));
    p.constructorOpsInit();
    return p.parseProgram();
}
