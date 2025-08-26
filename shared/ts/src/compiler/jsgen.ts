import type { Expr } from './ast';

interface Options {
    iife: boolean;
    importNames: string[];
    pretty: boolean;
}

export function emitJS(expr: Expr, opts: Options): string {
    const body = emitExpr(expr);
    const imports = opts.importNames;
    const header = imports.length ? `const { ${imports.join(', ')} } = args;` : '';
    return `(function(args){${header}return ${body};})`;
}

function emitExpr(e: Expr): string {
    switch (e.kind) {
        case 'Num':
            return String(e.value);
        case 'Str':
            return JSON.stringify(e.value);
        case 'Bool':
            return e.value ? 'true' : 'false';
        case 'Null':
            return 'null';
        case 'Var':
            return e.name.text;
        case 'If':
            return `(${emitExpr(e.cond)}?${emitExpr(e.then)}:${emitExpr(e.else)})`;
        case 'Block': {
            const exprs = e.exprs.map(emitExpr);
            const last = exprs.pop() ?? 'null';
            return `(function(){${exprs.map((x) => `${x};`).join('')}return ${last};})()`;
        }
        case 'Let':
            return `(function(){const ${e.name.text}=${emitExpr(e.value)};return ${emitExpr(e.body)};})()`;
        case 'Fun':
            return `(${e.params.map((p) => p.text).join(',')}=>${emitExpr(e.body)})`;
        case 'Def':
            return `function ${e.name.text}(${e.params.map((p) => p.text).join(',')}){return ${emitExpr(e.body)};}`;
        case 'Bin':
            return `(${emitExpr(e.left)}${e.op}${emitExpr(e.right)})`;
        case 'Un':
            return `(${e.op}${emitExpr(e.expr)})`;
        case 'Call':
            return `${emitExpr(e.callee)}(${e.args.map(emitExpr).join(',')})`;
        case 'Class': {
            const ctorParams = e.fields.map((f) => f.text).join(',');
            const fieldAssign = e.fields.map((f) => `this.${f.text}=${f.text};`).join('');
            const methods = e.methods
                .map((m) => `${m.name.text}(${m.params.map((p) => p.text).join(',')}){return ${emitExpr(m.body)};}`)
                .join('');
            return `(class ${e.name.text}{constructor(${ctorParams}){${fieldAssign}}${methods}})`;
        }
        case 'New':
            return `(new ${emitExpr(e.ctor)}(${e.args.map(emitExpr).join(',')}))`;
        case 'Get':
            return `(${emitExpr(e.obj)}.${e.prop})`;
        case 'Set':
            return `(${emitExpr(e.obj)}.${e.prop}=${emitExpr(e.value)})`;
        case 'MethodCall':
            return `${emitExpr(e.obj)}.${e.method}(${e.args.map(emitExpr).join(',')})`;
    }
}
