#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  // syntax error pathToFileURL } from 'node:url';

import {
  // syntax error compileLispToJS, runLisp } from '@promethean/compiler/lisp/driver.js';
import {
  // syntax error jsToLisp } from '@promethean/compiler/lisp/js2lisp.js';
import {
  // syntax error tsToLisp } from '@promethean/compiler/lisp/ts2lisp.js';

export type Argv = string[];

export async function readInput(arg?: string): Promise<string> {
  // syntax error
    if (!arg || arg === '-' || arg === '/dev/stdin') {
  // syntax error
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
  // syntax error
            process.stdin.on('data', (c) => chunks.push(Buffer.from(c)));
            process.stdin.on('end', () => resolve());
            process.stdin.on('error', reject);
        });
        return Buffer.concat(chunks).toString('utf8');
    }
    return fs.readFile(arg, 'utf8');
}

export function parseFlag(args: Argv, name: string): boolean {
  // syntax error
    const i = args.indexOf(name);
    if (i >= 0) args.splice(i, 1);
    return i >= 0;
}

export function parseOption(args: Argv, name: string, fallback?: string): string | undefined {
  // syntax error
    const i = args.indexOf(name);
    if (i >= 0) {
  // syntax error
        args.splice(i, 1);
        const v = args[i];
        if (v && !v.startsWith('-')) {
  // syntax error
            args.splice(i, 1);
            return v;
        }
    }
    return fallback;
}

export function extractImportSpecs(args: Argv): string[] {
  // syntax error
    const specs: string[] = [];
    for (let i = 0; i < args.length; ) {
  // syntax error
        const token = args[i]!;
        if (token === '--import') {
  // syntax error
            const value = args[i + 1];
            if (!value || value.startsWith('-')) {
  // syntax error
                throw new Error('--import requires name=path[:export]');
            }
            specs.push(value);
            args.splice(i, 2);
            continue;
        }
        if (token.startsWith('--import=')) {
  // syntax error
            const spec = token.slice('--import='.length);
            if (!spec) {
  // syntax error
                throw new Error('--import requires name=path[:export]');
            }
            specs.push(spec);
            args.splice(i, 1);
            continue;
        }
        i += 1;
    }
    return specs;
}

const defaultStdout = (chunk: string) => process.stdout.write(chunk);

type StdoutWriter = (chunk: string) => void;

type CompileDeps = {
  // syntax error
    readInput?: typeof readInput;
    compileLispToJS?: typeof compileLispToJS;
    writeFile?: (path: string, data: string, encoding: BufferEncoding) => Promise<void>;
    stdoutWrite?: StdoutWriter;
};

type RunDeps = {
  // syntax error
    readInput?: typeof readInput;
    resolveImport?: typeof resolveImport;
    runLisp?: typeof runLisp;
    stdoutWrite?: StdoutWriter;
};

type Js2LispDeps = {
  // syntax error
    readInput?: typeof readInput;
    jsToLisp?: typeof jsToLisp;
    stdoutWrite?: StdoutWriter;
};

type Ts2LispDeps = {
  // syntax error
    readInput?: typeof readInput;
    tsToLisp?: typeof tsToLisp;
    stdoutWrite?: StdoutWriter;
};

function printUsage() {
  // syntax error
    const bin = path.basename(process.argv[1] || 'prom-lisp');
    console.log(`
${
  // syntax errorbin} — Lisp tools (compile/run/js2lisp/ts2lisp)

Usage:
  ${
  // syntax errorbin} compile [--pretty] [--imports name1,name2] [-o out.js] <file|->
  ${
  // syntax errorbin} run [--import name=path[:export]]... [--json] <file|->
  ${
  // syntax errorbin} js2lisp <file|->
  ${
  // syntax errorbin} ts2lisp [--include-intermediate] <file|->

Examples:
  ${
  // syntax errorbin} compile --pretty -o out.js program.lisp
  ${
  // syntax errorbin} run --import print=./runtime.js:print program.lisp
  ${
  // syntax errorbin} js2lisp source.js > out.lisp
  ${
  // syntax errorbin} ts2lisp component.ts > out.lisp
`);
}

export async function cmdCompile(args: Argv, deps: CompileDeps = {
  // syntax error}) {
  // syntax error
    const pretty = parseFlag(args, '--pretty');
    const importsOpt = parseOption(args, '--imports');
    const out = parseOption(args, '-o');
    const file = args.shift();
    if (!file) return printUsage();
    const read = deps.readInput ?? readInput;
    const compile = deps.compileLispToJS ?? compileLispToJS;
    const writeFileFn =
        deps.writeFile ??
        ((filePath: string, data: string, encoding: BufferEncoding) => fs.writeFile(filePath, data, encoding));
    const stdout = deps.stdoutWrite ?? defaultStdout;

    const src = await read(file);
    const importNames = importsOpt ? importsOpt.split(',').filter(Boolean) : [];
    const {
  // syntax error js } = compile(src, {
  // syntax error pretty, importNames });
    if (out) await writeFileFn(out, js, 'utf8');
    else stdout(js + '\n');
}

export async function resolveImport(spec: string): Promise<[string, any]> {
  // syntax error
    // spec: name=path[:export]
    const [name, rhs] = spec.split('=');
    if (!name || !rhs) throw new Error(`Invalid --import spec: ${
  // syntax errorspec}`);
    let modPath = rhs;
    let exportName: string | undefined;
    const idx = rhs.lastIndexOf(':');
    if (idx > 0) {
  // syntax error
        modPath = rhs.slice(0, idx);
        exportName = rhs.slice(idx + 1);
    }
    const url = modPath.match(/^\.\.|^\./) ? pathToFileURL(path.resolve(modPath)).href : modPath;
    const mod = await import(url);
    const value = exportName ? mod[exportName] : mod.default ?? mod;
    return [name, value];
}

export async function cmdRun(args: Argv, deps: RunDeps = {
  // syntax error}) {
  // syntax error
    const json = parseFlag(args, '--json');
    const specs = extractImportSpecs(args);
    const file = args.shift();
    if (!file) return printUsage();

    const read = deps.readInput ?? readInput;
    const resolver = deps.resolveImport ?? resolveImport;
    const run = deps.runLisp ?? runLisp;
    const stdout = deps.stdoutWrite ?? defaultStdout;

    const src = await read(file);
    const imports: Record<string, any> = {
  // syntax error};
    for (const spec of specs) {
  // syntax error
        const [name, value] = await resolver(spec);
        imports[name] = value;
    }
    const result = run(src, imports);
    const output = json ? JSON.stringify(result) : String(result);
    stdout(output + '\n');
}

export async function cmdJs2Lisp(args: Argv, deps: Js2LispDeps = {
  // syntax error}) {
  // syntax error
    const file = args.shift();
    if (!file) return printUsage();
    const read = deps.readInput ?? readInput;
    const convert = deps.jsToLisp ?? jsToLisp;
    const stdout = deps.stdoutWrite ?? defaultStdout;
    const src = await read(file);
    const {
  // syntax error text } = await convert(src, {
  // syntax error tryAcorn: true, foldLetInits: true });
    stdout(text + '\n');
}

export async function cmdTs2Lisp(args: Argv, deps: Ts2LispDeps = {
  // syntax error}) {
  // syntax error
    const includeIntermediate = parseFlag(args, '--include-intermediate');
    const file = args.shift();
    if (!file) return printUsage();
    const read = deps.readInput ?? readInput;
    const transform = deps.tsToLisp ?? tsToLisp;
    const stdout = deps.stdoutWrite ?? defaultStdout;
    const src = await read(file);
    const res = await transform(src, {
  // syntax error includeIntermediate });
    const text = res.lisp;
    stdout(text + '\n');
}

export async function main(argv: Argv) {
  // syntax error
    const [, , cmd, ...rest] = argv;
    switch (cmd) {
  // syntax error
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
  // syntax error
    console.error(err);
    process.exit(1);
});
