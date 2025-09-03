// SPDX-License-Identifier: GPL-3.0-only
import { Span } from './common';

export type TokKind = 'id' | 'num' | 'str' | 'op' | 'punct' | 'kw' | 'eof';

export type Tok = { kind: TokKind; text: string; span: Span };

const KEYWORDS = new Set(['let', 'in', 'if', 'then', 'else', 'fun', 'return', 'true', 'false', 'null']);

export function lex(src: string): Tok[] {
    const out: Tok[] = [];
    let i = 0,
        line = 1,
        col = 1;

    const startSpan = () => ({ start: i, end: i, line, col });

    const push = (kind: TokKind, text: string, s: Span) => {
        s.end = i;
        out.push({ kind, text, span: s });
    };

    while (i < src.length) {
        const s = startSpan();
        const c = src[i];

        // whitespace / newline
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

        // line comment //
        if (c === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') {
                i++;
                col++;
            }
            continue;
        }

        // string
        if (c === '"' || c === "'") {
            const quote = c;
            i++;
            col++;
            let buf = '';
            while (i < src.length && src[i] !== quote) {
                if (src[i] === '\\' && i + 1 < src.length) {
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
            push('str', buf, s);
            continue;
        }

        // number
        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
            let j = i;
            while (/[0-9_]/.test(src[j] || '')) j++;
            if (src[j] === '.') {
                j++;
                while (/[0-9_]/.test(src[j] || '')) j++;
            }
            const t = src.slice(i, j).replace(/_/g, '');
            i = j;
            col += j - s.start;
            push('num', t, s);
            continue;
        }

        // id / kw
        if (/[A-Za-z_\$]/.test(c)) {
            let j = i + 1;
            while (/[A-Za-z0-9_\$]/.test(src[j] || '')) j++;
            const t = src.slice(i, j);
            i = j;
            col += j - s.start;
            push(KEYWORDS.has(t) ? 'kw' : 'id', t, s);
            continue;
        }

        // operators (multi-char first)
        const two = src.slice(i, i + 2);
        if (['=>', '==', '!=', '>=', '<=', '&&', '||', '::', '->'].includes(two)) {
            i += 2;
            col += 2;
            push('op', two, s);
            continue;
        }
        if ('+-*/%=!<>'.includes(c)) {
            i++;
            col++;
            push('op', c, s);
            continue;
        }

        // punctuation
        if ('(){}[],.;:'.includes(c)) {
            i++;
            col++;
            push('punct', c, s);
            continue;
        }

        // unknown
        i++;
        col++;
        push('op', c, s);
    }
    const s = { start: i, end: i, line, col };
    out.push({ kind: 'eof', text: '<eof>', span: s });
    return out;
}
