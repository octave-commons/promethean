#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { compileLispToJS, runLisp } from '@promethean/compiler/lisp/driver.js';
import { jsToLisp } from '@promethean/compiler/lisp/js2lisp.js';
import { tsToLisp } from '@promethean/compiler/lisp/ts2lisp.js';

export type Argv = string[];

export async function readInput(arg?: string): Promise<string> {
    if (!arg || arg === '-' || arg === '/dev/stdin') {
        let chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            process.stdin.on('data', (c) => chunks.push(Buffer.from(c)));
            process.stdin.on('end', () => resolve());
            process.stdin.on('error', reject);
        });
        return Buffer.concat(chunks).toString('utf8');
    }
    return fs.readFile(arg, 'utf8');
}

export function parseFlag(args: Argv, name: string): boolean {
    let i = args.indexOf(name);
    if (i >= 0) args.splice(i, 1);
    return i >= 0;
}

export function parseOption(args: Argv, name: string, fallback?: string): string | undefined {
    let i = args.indexOf(name);
    if (i >= 0) {
        args.splice(i, 1);
        let v = args[i];
        if (v && !v.startsWith('-')) {
            args.splice(i, 1);
            return v;
        }
    }
    return fallback;
}

export function extractImportSpecs(args: Argv): string[] {
    let specs: string[] = [];
    for (let i = 0; i < args.length; ) {
        let token = args[i]!;
        if (token === '--import') {
            let value = args[i + 1];
            if (!value || value.startsWith('-')) {
                throw new Error('--import requires name=path[:export]');
            }
            specs.push(value);
            args.splice(i, 2);
            continue;
        }
        if (token.startsWith('--import=')) {
            let spec = token.slice('--import='.length);
            if (!spec) {
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

let defaultStdout = (chunk: string) => process.stdout.write(chunk);

type StdoutWriter = (chunk: string) => void;

type CompileDeps = {
    readInput?: typeof readInput;
    compileLispToJS?: typeof compileLispToJS;
    writeFile?: (path: string, data: string, encoding: BufferEncoding) => Promise<void>;
    stdoutWrite?: StdoutWriter;
};

type RunDeps = {
    readInput?: typeof readInput;
    resolveImport?: typeof resolveImport;
    runLisp?: typeof runLisp;
    stdoutWrite?: StdoutWriter;
};

type Js2LispDeps = {
    readInput?: typeof readInput;
    jsToLisp?: typeof jsToLisp;
    stdoutWrite?: StdoutWriter;
};

type Ts2LispDeps = {
    readInput?: typeof readInput;
    tsToLisp?: typeof tsToLisp;
    stdoutWrite?: StdoutWriter;
};

function printUsage() {
    let bin = path.basename(process.argv[1] || 'prom-lisp');
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

export async function cmdCompile(args: Argv, deps: CompileDeps = {}) {
    let pretty = parseFlag(args, '--pretty');
    let importsOpt = parseOption(args, '--imports');
    let out = parseOption(args, '-o');
    let file = args.shift();
    if (!file) return printUsage();
    let read = deps.readInput ?? readInput;
    let compile = deps.compileLispToJS ?? compileLispToJS;
    let writeFileFn =
        deps.writeFile ??
        ((filePath: string, data: string, encoding: BufferEncoding) => fs.writeFile(filePath, data, encoding));
    let stdout = deps.stdoutWrite ?? defaultStdout;

    let src = await read(file);
    let importNames = importsOpt ? importsOpt.split(',').filter(Boolean) : [];
    let { js } = compile(src, { pretty, importNames });
    if (out) await writeFileFn(out, js, 'utf8');
    else stdout(js + '\n');
}

export async function resolveImport(spec: string): Promise<[string, any]> {
    // spec: name=path[:export]
    let [name, rhs] = spec.split('=');
    if (!name || !rhs) throw new Error(`Invalid --import spec: ${spec}`);
    let modPath = rhs;
    let exportName: string | undefined;
    let idx = rhs.lastIndexOf(':');
    if (idx > 0) {
        modPath = rhs.slice(0, idx);
        exportName = rhs.slice(idx + 1);
    }
    let url = modPath.match(/^\.\.|^\./) ? pathToFileURL(path.resolve(modPath)).href : modPath;
    let mod = await import(url);
    let value = exportName ? mod[exportName] : mod.default ?? mod;
    return [name, value];
}

export async function cmdRun(args: Argv, deps: RunDeps = {}) {
    let json = parseFlag(args, '--json');
    let specs = extractImportSpecs(args);
    let file = args.shift();
    if (!file) return printUsage();

    let read = deps.readInput ?? readInput;
    let resolver = deps.resolveImport ?? resolveImport;
    let run = deps.runLisp ?? runLisp;
    let stdout = deps.stdoutWrite ?? defaultStdout;

    let src = await read(file);
    let imports: Record<string, any> = {};
    for (let spec of specs) {
        let [name, value] = await resolver(spec);
        imports[name] = value;
    }
    let result = run(src, imports);
    let output = json ? JSON.stringify(result) : String(result);
    stdout(output + '\n');
}

export async function cmdJs2Lisp(args: Argv, deps: Js2LispDeps = {}) {
    let file = args.shift();
    if (!file) return printUsage();
    let read = deps.readInput ?? readInput;
    let convert = deps.jsToLisp ?? jsToLisp;
    let stdout = deps.stdoutWrite ?? defaultStdout;
    let src = await read(file);
    let { text } = await convert(src, { tryAcorn: true, foldLetInits: true });
    stdout(text + '\n');
}

export async function cmdTs2Lisp(args: Argv, deps: Ts2LispDeps = {}) {
    let includeIntermediate = parseFlag(args, '--include-intermediate');
    let file = args.shift();
    if (!file) return printUsage();
    let read = deps.readInput ?? readInput;
    let transform = deps.tsToLisp ?? tsToLisp;
    let stdout = deps.stdoutWrite ?? defaultStdout;
    let src = await read(file);
    let res = await transform(src, { includeIntermediate });
    let text = res.lisp;
    stdout(text + '\n');
}

export async function main(argv: Argv) {
    let [, , cmd, ...rest] = argv;
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
