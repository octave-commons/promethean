#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compileLispToJS, runLisp } from '@promethean/compiler/lisp/driver.js';
import { jsToLisp } from '@promethean/compiler/lisp/js2lisp.js';
import { tsToLisp } from '@promethean/compiler/lisp/ts2lisp.js';

type Argv = string[];

async function readInput(arg?: string): Promise<string> {
    if (!arg || arg === '-' || arg === '/dev/stdin') {
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            process.stdin.on('data', (c) => chunks.push(Buffer.from(c)));
            process.stdin.on('end', () => resolve());
            process.stdin.on('error', reject);
        });
        return Buffer.concat(chunks).toString('utf8');
    }
    return fs.readFile(arg, 'utf8');
}

function parseFlag(args: Argv, name: string): boolean {
    const i = args.indexOf(name);
    if (i >= 0) args.splice(i, 1);
    return i >= 0;
}

function parseOption(args: Argv, name: string, fallback?: string): string | undefined {
    const i = args.indexOf(name);
    if (i >= 0) {
        args.splice(i, 1);
        const v = args[i];
        if (v && !v.startsWith('-')) {
            args.splice(i, 1);
            return v;
        }
    }
    return fallback;
}

function printUsage() {
    const bin = path.basename(process.argv[1] || 'prom-lisp');
    console.log(`
${bin} — Lisp tools (compile/run/js2lisp/ts2lisp)

Usage:
  ${bin} compile [--pretty] [--imports name1,name2] [-o out.js] <file|->
  ${bin} run [--import name=path[:export]]... [--json] <file|->
  ${bin} js2lisp <file|->
  ${bin} ts2lisp [--include-intermediate] <file|->

Examples:
  ${bin} compile --pretty -o out.js program.lisp
  ${bin} run --import print=./runtime.js:print program.lisp
  ${bin} js2lisp source.js > out.lisp
  ${bin} ts2lisp component.ts > out.lisp
`);
}

async function cmdCompile(args: Argv) {
    const pretty = parseFlag(args, '--pretty');
    const importsOpt = parseOption(args, '--imports');
    const out = parseOption(args, '-o');
    const file = args.shift();
    if (!file) return printUsage();
    const src = await readInput(file);
    const importNames = importsOpt ? importsOpt.split(',').filter(Boolean) : [];
    const { js } = compileLispToJS(src, { pretty, importNames });
    if (out) await fs.writeFile(out, js, 'utf8');
    else process.stdout.write(js + '\n');
}

async function resolveImport(spec: string): Promise<[string, any]> {
    // spec: name=path[:export]
    const [name, rhs] = spec.split('=');
    if (!name || !rhs) throw new Error(`Invalid --import spec: ${spec}`);
    let modPath = rhs;
    let exportName: string | undefined;
    const idx = rhs.lastIndexOf(':');
    if (idx > 0) {
        modPath = rhs.slice(0, idx);
        exportName = rhs.slice(idx + 1);
    }
    const url = modPath.match(/^\.\.|^\./) ? pathToFileURL(path.resolve(modPath)).href : modPath;
    const mod = await import(url);
    const value = exportName ? mod[exportName] : mod.default ?? mod;
    return [name, value];
}

async function cmdRun(args: Argv) {
    const json = parseFlag(args, '--json');
    const importSpecs = args.filter((a) => a.startsWith('--import'));
    // remove all --import entries and their values if split form used
    for (let i = 0; i < args.length; ) {
        if (args[i] === '--import') args.splice(i, 2);
        else if (args[i].startsWith('--import=')) args.splice(i, 1);
        else i++;
    }
    const file = args.shift();
    if (!file) return printUsage();
    const src = await readInput(file);

    // Accept both --import name=path[:export] and --import=name=path[:export]
    const merged: string[] = [];
    for (const s of importSpecs) {
        const eq = s.indexOf('=');
        if (s === '--import') continue; // handled as pair above
        merged.push(s.slice(eq + 1));
    }
    const imports: Record<string, any> = {};
    for (const spec of merged) {
        const [name, value] = await resolveImport(spec);
        imports[name] = value;
    }
    const result = runLisp(src, imports);
    process.stdout.write(json ? JSON.stringify(result) + '\n' : String(result) + '\n');
}

async function cmdJs2Lisp(args: Argv) {
    const file = args.shift();
    if (!file) return printUsage();
    const src = await readInput(file);
    const { text } = await jsToLisp(src, { tryAcorn: true, foldLetInits: true });
    process.stdout.write(text + '\n');
}

async function cmdTs2Lisp(args: Argv) {
    const includeIntermediate = parseFlag(args, '--include-intermediate');
    const file = args.shift();
    if (!file) return printUsage();
    const src = await readInput(file);
    const res = await tsToLisp(src, { includeIntermediate });
    const text = includeIntermediate ? res.lisp : res.lisp;
    process.stdout.write(text + '\n');
}

async function main(argv: Argv) {
    const [, , cmd, ...rest] = argv;
    switch (cmd) {
        case 'compile':
            return cmdCompile(rest);
        case 'run':
            return cmdRun(rest);
        case 'js2lisp':
            return cmdJs2Lisp(rest);
        case 'ts2lisp':
            return cmdTs2Lisp(rest);
        case '-h':
        case '--help':
        default:
            return printUsage();
    }
}

main(process.argv).catch((err) => {
    console.error(err);
    process.exit(1);
});
