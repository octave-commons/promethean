import { Span, S, Sym, List, Nil, num, str, bool, sym, list, nil } from './syntax';

type Tok =
    | { k: 'id'; s: string; sp: Span }
    | { k: 'num'; s: string; sp: Span }
    | { k: 'str'; s: string; sp: Span }
    | { k: 'p'; s: string; sp: Span }
    | { k: 'eof'; sp: Span };

export function read(src: string): S[] {
    const tks = lex(src);
    let i = 0;
    const peek = () => tks[i];
    const next = () => tks[i++];

    function readDatum(): S {
        const t = next();
        if (t.k === 'eof') return nil;
        if (t.k === 'num') return num(parseFloat(t.s), t.sp);
        if (t.k === 'str') return str(t.s, t.sp);
        if (t.k === 'id') {
            if (t.s === 'true') return bool(true, t.sp);
            if (t.s === 'false') return bool(false, t.sp);
            if (t.s === 'nil') return nil;
            return sym(t.s, t.sp);
        }
        if (t.k === 'p') {
            if (t.s === '(') {
                const xs: S[] = [];
                while (true) {
                    const p = peek();
                    if (p.k === 'p' && (p as any).s === ')') break;
                    xs.push(readDatum());
                }
                next(); // )
                return list(xs, t.sp);
            }
            // quote / quasiquote / unquotes
            if (t.s === "'") return list([sym('quote', t.sp), readDatum()], t.sp);
            if (t.s === '`') return list([sym('quasiquote', t.sp), readDatum()], t.sp);
            if (t.s === ',') return list([sym('unquote', t.sp), readDatum()], t.sp);
            if (t.s === ',@') return list([sym('unquote-splicing', t.sp), readDatum()], t.sp);
        }
        throw new Error(`unexpected token ${JSON.stringify(t)}`);
    }

    const out: S[] = [];
    while (peek().k !== 'eof') out.push(readDatum());
    return out;
}

// --- tiny lexer ---
function lex(src: string): Tok[] {
    const out: Tok[] = [];
    let i = 0,
        line = 1,
        col = 1;
    const span = (start: number): Span => ({ start, end: i, line, col });
    const push = (k: any, s: string, st: number) => out.push({ k, s, sp: { start: st, end: i, line, col } });
    const two = () => src.slice(i, i + 2);

    while (i < src.length) {
        const st = i;
        const c = src[i];
        if (c === ' ' || c === '\t' || c === '\r') {
            i++;
            col++;
            continue;
        }
        if (c === '\n') {
            i++;
            line++;
            col = 1;
            continue;
        }
        if (c === ';') {
            while (i < src.length && src[i] !== '\n') {
                i++;
                col++;
            }
            continue;
        }

        if (c === '(' || c === ')') {
            i++;
            col++;
            push('p', c, st);
            continue;
        }
        if (c === "'") {
            i++;
            col++;
            push('p', "'", st);
            continue;
        }
        if (c === '`') {
            i++;
            col++;
            push('p', '`', st);
            continue;
        }
        if (c === ',' && two() === ',@') {
            i += 2;
            col += 2;
            push('p', ',@', st);
            continue;
        }
        if (c === ',') {
            i++;
            col++;
            push('p', ',', st);
            continue;
        }

        if (c === '"' || c === "'") {
            const q = c;
            i++;
            col++;
            let buf = '';
            while (i < src.length && src[i] !== q) {
                if (src[i] === '\\') {
                    buf += src[i + 1];
                    i += 2;
                    col += 2;
                } else {
                    buf += src[i];
                    i++;
                    col++;
                }
            }
            i++;
            col++;
            push('str', buf, st);
            continue;
        }

        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
            let j = i;
            while (/[0-9_]/.test(src[j] || '')) j++;
            if (src[j] === '.') {
                j++;
                while (/[0-9_]/.test(src[j] || '')) j++;
            }
            const s = src.slice(i, j).replace(/_/g, '');
            i = j;
            col += j - st;
            push('num', s, st);
            continue;
        }

        // symbol chars
        if (/[A-Za-z_\-\+\*\!\/\=\<\>\?\$:%]/.test(c)) {
            let j = i + 1;
            while (/[A-Za-z0-9_\-\+\*\!\/\=\<\>\?\$:%\.]/.test(src[j] || '')) j++;
            const s = src.slice(i, j);
            i = j;
            col += j - st;
            push('id', s, st);
            continue;
        }

        throw new Error(`bad char '${c}'`);
    }
    out.push({ k: 'eof', sp: { start: i, end: i, line, col } });
    return out;
}
