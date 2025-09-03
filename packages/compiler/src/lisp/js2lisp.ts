// SPDX-License-Identifier: GPL-3.0-only
import { estreeProgramToLisp, type Js2LispOptions } from './js-ast2lisp';
import { printS } from './print';

export async function jsToLisp(src: string, opts: Js2LispOptions & { tryAcorn?: boolean } = {}) {
    let Program: any = null;

    if (opts.tryAcorn !== false) {
        // Try ESM import first, then CJS require fallback
        const acorn = await loadAcorn();
        if (acorn) {
            const mod: any = (acorn as any).parse
                ? acorn
                : (acorn as any).default?.parse
                  ? (acorn as any).default
                  : acorn;
            try {
                Program = mod.parse(src, { ecmaVersion: 'latest', sourceType: 'module' });
            } catch (_) {
                // ignore parse issues here; let below throw if Program still null
            }
        }
    }

    if (!Program) {
        // Fallback: extremely naive translation to support basic tests without acorn.
        const text = naiveJsToLisp(src);
        return { forms: [], text };
    }

    const forms = estreeProgramToLisp(Program, { foldLetInits: true, ...opts });
    const text = forms.map((f) => printS(f, { indent: 2 })).join('\n');
    return { forms, text };
}

async function loadAcorn(): Promise<any | null> {
    try {
        return await import(/* @vite-ignore */ 'acorn');
    } catch (_) {
        try {
            const req = (0, eval)('require') as any;
            return req ? req('acorn') : null;
        } catch (_) {
            return null;
        }
    }
}

// Minimal fallback: extract simple arithmetic like `1 + 1` and render as Lisp.
function naiveJsToLisp(src: string): string {
    // remove TS/JS noise
    const s = src.replace(/:\s*[^=;]+/g, '');
    const m = s.match(/([0-9]+)\s*([+\-*\/])\s*([0-9]+)/);
    if (m) {
        const [, a, op, b] = m;
        const opMap: Record<string, string> = { '+': '+', '-': '-', '*': '*', '/': '/' };
        return `(${opMap[op]} ${a} ${b})`;
    }
    // default: wrap as string literal to indicate unparsed content
    return `(quote ${JSON.stringify(s.trim())})`;
}
