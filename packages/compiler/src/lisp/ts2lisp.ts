import { jsToLisp } from './js2lisp.js';

export type TsToLispOptions = {
    // Names treated as globals -> (js/global "Name"), e.g., ["document","window","Image"]
    globals?: string[];
    // Try to use the 'typescript' package (Node). If not present and in browser, try 'sucrase'.
    trySucrase?: boolean;
    // Control TypeScript compiler options
    tsCompilerOptions?: Record<string, any>;
    // If true, also return the intermediary JS and TS source map text (from TS transpile)
    includeIntermediate?: boolean;
};

/** Transpile TypeScript to Lisp text. */
export async function tsToLisp(tsSource: string, opts: TsToLispOptions = {}) {
    const { js, tsMap, notes } = await transpileTS(tsSource, opts);
    const { text, forms } = await jsToLisp(js, {
        globals: opts.globals ?? [],
        tryAcorn: true,
    });
    if (opts.includeIntermediate) return { lisp: text, js, tsMap, notes, forms };
    return { lisp: text, notes };
}

/** Prefer 'typescript' (keeps modern syntax, erases types). Browser fallback: 'sucrase'. */
async function transpileTS(tsSource: string, opts: TsToLispOptions) {
    const notes: string[] = [];
    // Try official TS compiler first
    try {
        const tsMod = await dynamicImportTS();
        if (tsMod) {
            // Support both ESM dynamic import and CJS require shapes
            const ts = tsMod.transpileModule ? tsMod : tsMod.default?.transpileModule ? tsMod.default : tsMod;
            const compilerOptions = {
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.ESNext,
                jsx: ts.JsxEmit.Preserve, // keep JSX if present; JS→Lisp will show it as calls/strings
                removeComments: false,
                isolatedModules: true,
                useDefineForClassFields: false,
                esModuleInterop: false,
                preserveConstEnums: true,
                sourceMap: true,
                ...opts.tsCompilerOptions,
            };
            const res = ts.transpileModule(tsSource, {
                compilerOptions,
                reportDiagnostics: true,
                fileName: 'input.ts',
            });
            if (res.diagnostics?.length) {
                notes.push(
                    ...res.diagnostics.map(
                        (d: any) =>
                            'TS' + (d.code ?? '') + ': ' + (d.messageText?.toString?.() ?? String(d.messageText)),
                    ),
                );
            }
            return {
                js: res.outputText as string,
                tsMap: res.sourceMapText as string | undefined,
                notes,
            };
        }
        notes.push('typescript module not found');
    } catch (e: any) {
        notes.push('typescript transpile failed: ' + (e?.message ?? String(e)));
    }

    // Fallback: sucrase (browser-friendly, no types)
    if (opts.trySucrase !== false) {
        try {
            const sucrase: any = await dynamicImportAny('sucrase');
            const mod: any = sucrase?.transform ? sucrase : sucrase?.default?.transform ? sucrase.default : sucrase;
            const out = mod.transform(tsSource, {
                transforms: ['typescript'],
                production: true,
            });
            return {
                js: out.code as string,
                tsMap: out.sourceMap as string | undefined,
                notes,
            };
        } catch (e: any) {
            notes.push('sucrase fallback failed: ' + (e?.message ?? String(e)));
        }
    }

    throw new Error("No TS transpiler available. Install 'typescript' (or 'sucrase' in the browser).");
}

async function dynamicImportTS(): Promise<unknown> {
    return dynamicImportAny('typescript');
}

async function dynamicImportAny(name: string): Promise<unknown> {
    try {
        return await import(/* @vite-ignore */ name);
    } catch {
        try {
            const req = (0, eval)('require') as (name: string) => unknown;
            return req ? req(name) : null;
        } catch {
            return null;
        }
    }
}
