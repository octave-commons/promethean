import test from 'ava';
import {
    Argv,
    cmdCompile,
    cmdJs2Lisp,
    cmdRun,
    cmdTs2Lisp,
    extractImportSpecs,
    parseFlag,
    parseOption,
} from '../lisp.js';

test('parseFlag removes flag and reports presence', (t) => {
    const args: Argv = ['--json', 'program.lisp'];
    t.true(parseFlag(args, '--json'));
    t.deepEqual(args, ['program.lisp']);
    t.false(parseFlag(args, '--missing'));
});

test('parseOption returns value while stripping args', (t) => {
    const args: Argv = ['--imports', 'math,util', 'program.lisp'];
    t.is(parseOption(args, '--imports'), 'math,util');
    t.deepEqual(args, ['program.lisp']);
    t.is(parseOption(args, '--other', 'fallback'), 'fallback');
});

test('extractImportSpecs supports split and inline forms', (t) => {
    const args: Argv = ['--import', 'print=./runtime.js:print', '--import=util=./util.js', 'program.lisp'];
    const specs = extractImportSpecs(args);
    t.deepEqual(specs, ['print=./runtime.js:print', 'util=./util.js']);
    t.deepEqual(args, ['program.lisp']);
});

test('cmdCompile writes to file when output provided', async (t) => {
    const writes: Array<{ path: string; data: string; encoding: BufferEncoding }> = [];
    const args: Argv = ['--pretty', '--imports', 'math', '-o', 'out.js', 'program.lisp'];

    await cmdCompile(args, {
        readInput: async (file) => {
            t.is(file, 'program.lisp');
            return '(+ 1 2)';
        },
        compileLispToJS: (src: string, opts: { pretty: boolean; importNames: string[] }) => {
            t.is(src, '(+ 1 2)');
            t.deepEqual(opts, { pretty: true, importNames: ['math'] });
            return { js: '// compiled' } as { js: string };
        },
        writeFile: async (path, data, encoding) => {
            writes.push({ path, data, encoding });
        },
    });

    t.deepEqual(writes, [{ path: 'out.js', data: '// compiled', encoding: 'utf8' }]);
});

test('cmdCompile falls back to stdout when no output file', async (t) => {
    const chunks: string[] = [];
    const args: Argv = ['program.lisp'];

    await cmdCompile(args, {
        readInput: async () => '(print "hi")',
        compileLispToJS: (_src: string) => ({ js: 'console.log("hi")' }) as { js: string },
        stdoutWrite: (chunk) => chunks.push(chunk),
    });

    t.deepEqual(chunks, ['console.log("hi")\n']);
});

test('cmdRun resolves imports and prints JSON when requested', async (t) => {
    const args: Argv = ['--json', '--import', 'print=./runtime.js:print', '--import=util=./util.js', 'program.lisp'];
    const outputs: string[] = [];
    const seen: string[] = [];

    await cmdRun(args, {
        readInput: async (file) => {
            t.is(file, 'program.lisp');
            return "(print 'hi')";
        },
        resolveImport: async (spec: string) => {
            seen.push(spec);
            const [name] = spec.split('=');
            if (!name) throw new Error('missing import name');
            return [name, spec] as [string, string];
        },
        runLisp: (src: string, imports: Record<string, unknown>) => {
            t.is(src, "(print 'hi')");
            t.deepEqual(imports, {
                print: 'print=./runtime.js:print',
                util: 'util=./util.js',
            });
            return { ok: true };
        },
        stdoutWrite: (chunk) => outputs.push(chunk),
    });

    t.deepEqual(seen, ['print=./runtime.js:print', 'util=./util.js']);
    t.deepEqual(outputs, [JSON.stringify({ ok: true }) + '\n']);
});

test('cmdJs2Lisp and cmdTs2Lisp use converters and stdout', async (t) => {
    const jsChunks: string[] = [];
    const tsChunks: string[] = [];

    await cmdJs2Lisp(['file.js'], {
        readInput: async (file) => {
            t.is(file, 'file.js');
            return 'console.log(1)';
        },
        jsToLisp: async (src: string) => {
            t.is(src, 'console.log(1)');
            return { text: '(print 1)' } as { text: string };
        },
        stdoutWrite: (chunk) => jsChunks.push(chunk),
    });

    await cmdTs2Lisp(['--include-intermediate', 'file.ts'], {
        readInput: async (file) => {
            t.is(file, 'file.ts');
            return 'export const x = 1';
        },
        tsToLisp: async (src: string, opts: { includeIntermediate: boolean }) => {
            t.is(src, 'export const x = 1');
            t.deepEqual(opts, { includeIntermediate: true });
            return { lisp: '(def x 1)' } as { lisp: string };
        },
        stdoutWrite: (chunk) => tsChunks.push(chunk),
    });

    t.deepEqual(jsChunks, ['(print 1)\n']);
    t.deepEqual(tsChunks, ['(def x 1)\n']);
});
