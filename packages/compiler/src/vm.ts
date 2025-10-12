import type { Module, Stmt, Rhs } from './ir.js';

export type OpCode =
    | ['LIT', number | string | boolean | null]
    | ['MOV', number] // move local
    | ['PRIM', string, number, number?]
    | ['CALL', number, number] // fn local, argc
    | ['JZ', number] // jump if zero
    | ['JMP', number]
    | ['RET'];

export type Bytecode = { code: OpCode[]; locals: number };

export function compileToBytecode(mod: Module): Bytecode {
    // super naive linearization of main only; full closure/func index later
    const code: OpCode[] = [];
    let locals = 0;
    const env = new Map<string, number>(); // Sym -> slot

    const slot = (s: string) => {
        if (!env.has(s)) env.set(s, locals++);
        return env.get(s)!;
    };

    const emitStmt = (s: Stmt) => {
        if (s.k === 'bind') emitRhs(s.s, s.rhs);
        else if (s.k === 'ret') code.push(['MOV', slot(s.s)], ['RET']);
        else if (s.k === 'if') {
            // cond in slot, JZ else, … then …, JMP end, else …
            slot(s.cond);
            code.push(['JZ', 0]);
            const jzIdx = code.length - 1;
            s.then.forEach(emitStmt);
            code.push(['JMP', 0]);
            const jmpIdx = code.length - 1;
            (code[jzIdx] as any)[1] = code.length;
            s.else.forEach(emitStmt);
            (code[jmpIdx] as any)[1] = code.length;
        }
    };
    const emitRhs = (dst: string, rhs: Rhs) => {
        const d = slot(dst);
        if (rhs.r === 'val') {
            if (rhs.v.t === 'lit') code.push(['LIT', rhs.v.v], ['MOV', d]);
            else if (rhs.v.t === 'var') {
                const s = slot(rhs.v.s);
                code.push(['MOV', s], ['MOV', d]);
            } else if (rhs.v.t === 'lambda') {
                /* closures later */ code.push(['LIT', null], ['MOV', d]);
            }
        } else if (rhs.r === 'prim') {
            const a = slot(rhs.a);
            if (rhs.b != null) {
                const b = slot(rhs.b);
                code.push(['PRIM', rhs.op, a, b], ['MOV', d]);
            } else {
                code.push(['PRIM', rhs.op, a], ['MOV', d]);
            }
        } else if (rhs.r === 'call') {
            const fn = slot(rhs.fn);
            code.push(['CALL', fn, rhs.args.length], ['MOV', d]);
        }
    };

    mod.main.body.forEach(emitStmt);
    return { code, locals };
}

export function runBytecode(bc: Bytecode): any {
    const mem: any[] = new Array(bc.locals).fill(undefined);
    const code = bc.code;
    let ip = 0,
        acc: any = undefined;
    while (ip < code.length) {
        const ins = code[ip++];
        const [op] = ins;
        if (op === 'LIT') acc = ins[1];
        else if (op === 'MOV') acc = mem[ins[1]] = acc ?? mem[ins[1]];
        else if (op === 'PRIM') {
            const o = ins[1],
                a = mem[ins[2]],
                b = ins[3] != null ? mem[ins[3]] : undefined;
            acc = prim(o, a, b);
        } else if (op === 'JZ') {
            const target = ins[1];
            if (!acc) ip = target;
        } else if (op === 'JMP') {
            ip = ins[1];
        } else if (op === 'CALL') {
            /* stub */ acc = null;
        } else if (op === 'RET') return acc;
    }
    return acc;
}

function prim(op: string, a: unknown, b?: unknown): unknown {
    switch (op) {
        case 'add':
            return (a as number) + (b as number);
        case 'sub':
            return b == null ? -(a as number) : (a as number) - (b as number);
        case 'mul':
            return (a as number) * (b as number);
        case 'div':
            return (a as number) / (b as number);
        case 'mod':
            return (a as number) % (b as number);
        case 'lt':
            return (a as number) < (b as number);
        case 'gt':
            return (a as number) > (b as number);
        case 'le':
            return (a as number) <= (b as number);
        case 'ge':
            return (a as number) >= (b as number);
        case 'eq':
            return a === b;
        case 'ne':
            return a !== b;
        case 'not':
            return !a;
        default:
            throw new Error('prim ' + op);
    }
}
