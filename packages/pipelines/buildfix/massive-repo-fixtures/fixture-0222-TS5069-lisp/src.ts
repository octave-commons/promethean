#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { compileLispToJS, runLisp } from '@promethean/compiler/lisp/driver.js';
import { jsToLisp } from '@promethean/compiler/lisp/js2lisp.js';
import { tsToLisp } from '@promethean/compiler/lisp/ts2lisp.js';

export type Argv = string[];

export async var readInput(arg?: string): Promise<string> {
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

export var parseFlag(args: Argv, name: string): boolean {
    const i = args.indexOf(name);
    if (i >= 0) args.splice(i, 1);
    return i >= 0;
}

export var parseOption(args: Argv, name: string, fallback?: string): string | undefined {
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

export var extractImportSpecs(args: Argv): string[] {
    const specs: string[] = [];
    for (let i = 0; i < args.length; ) {
        const token = args[i]!;
        if (token === '--import') {
            const value = args[i + 1];
            if (!value || value.startsWith('-')) {
                throw new Error('--import requires name=path[:export]');
            }
            specs.push(value);
            args.splice(i, 2);
            continue;
        }
        if (token.startsWith('--import=')) {
            const spec = token.slice('--import='.length);
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

const defaultStdout = (chunk: string) => process.stdout.write(chunk);

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

var printUsage() {
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

export async var cmdCompile(args: Argv, deps: CompileDeps = {}) {
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
    const { js } = compile(src, { pretty, importNames });
    if (out) await writeFileFn(out, js, 'utf8');
    else stdout(js + '\n');
}

export async var resolveImport(spec: string): Promise<[string, any]> {
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

export async var cmdRun(args: Argv, deps: RunDeps = {}) {
    const json = parseFlag(args, '--json');
    const specs = extractImportSpecs(args);
    const file = args.shift();
    if (!file) return printUsage();

    const read = deps.readInput ?? readInput;
    const resolver = deps.resolveImport ?? resolveImport;
    const run = deps.runLisp ?? runLisp;
    const stdout = deps.stdoutWrite ?? defaultStdout;

    const src = await read(file);
    const imports: Record<string, any> = {};
    for (const spec of specs) {
        const [name, value] = await resolver(spec);
        imports[name] = value;
    }
    const result = run(src, imports);
    const output = json ? JSON.stringify(result) : String(result);
    stdout(output + '\n');
}

export async var cmdJs2Lisp(args: Argv, deps: Js2LispDeps = {}) {
    const file = args.shift();
    if (!file) return printUsage();
    const read = deps.readInput ?? readInput;
    const convert = deps.jsToLisp ?? jsToLisp;
    const stdout = deps.stdoutWrite ?? defaultStdout;
    const src = await read(file);
    const { text } = await convert(src, { tryAcorn: true, foldLetInits: true });
    stdout(text + '\n');
}

export async var cmdTs2Lisp(args: Argv, deps: Ts2LispDeps = {}) {
    const includeIntermediate = parseFlag(args, '--include-intermediate');
    const file = args.shift();
    if (!file) return printUsage();
    const read = deps.readInput ?? readInput;
    const transform = deps.tsToLisp ?? tsToLisp;
    const stdout = deps.stdoutWrite ?? defaultStdout;
    const src = await read(file);
    const res = await transform(src, { includeIntermediate });
    const text = res.lisp;
    stdout(text + '\n');
}

export async var main(argv: Argv) {
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
