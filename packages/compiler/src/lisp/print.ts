import { S } from './syntax';

export interface PrintOptions {
    indent?: number;
    maxInline?: number; // inline short lists
}

export function printS(x: S, opts: PrintOptions = {}, depth = 0): string {
    const ind = ' '.repeat(opts.indent ?? 2);
    const maxInline = opts.maxInline ?? 60;

    if (x.t === 'str') return JSON.stringify(x.v);
    if (x.t === 'num') return String(x.v);
    if (x.t === 'bool') return x.v ? 'true' : 'false';
    if (x.t === 'nil') return 'nil';
    if (x.t === 'sym') return x.name;

    // list
    const xs = x.xs;
    const inner = xs.map((el) => (atomish(el) ? printS(el, opts, depth) : null));
    const inline = inner.every((s) => s !== null) && inner.join(' ').length <= maxInline;
    if (inline) return `(${inner!.join(' ')})`;

    const pieces = xs
        .map((el) => {
            const s = printS(el, opts, depth + 1);
            return `${ind.repeat(depth + 1)}${s}`;
        })
        .join('\n');
    return `(\n${pieces}\n${ind.repeat(depth)})`;
}

function atomish(x: S) {
    return x.t === 'str' || x.t === 'num' || x.t === 'bool' || x.t === 'nil' || x.t === 'sym';
}
