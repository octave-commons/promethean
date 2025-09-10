import test from 'ava';

import { registerProcForFile, registerProcForFileWithPort, startProcessWithPort } from '../process.js';

const codeWithArgPrinter = [
    "console.log('READY')",
    // Periodically print the last argv entry so we can observe ':PORT' substitution after readiness.
    "setInterval(() => console.log('ARG', process.argv[process.argv.length - 1]), 50)",
    // Keep process alive for a short time; it will be terminated by the harness.
    'setTimeout(() => {}, 2000)',
].join(';');

test.serial('startProcessWithPort injects fixed port and baseUrl', async (t) => {
    const fixedPort = 54321;
    const { proc, stop, port, baseUrl } = await startProcessWithPort({
        cmd: 'node',
        args: ['-e', codeWithArgPrinter, ':PORT'],
        cwd: process.cwd(),
        stdio: 'pipe',
        ready: { kind: 'log', pattern: /READY/ },
        port: { mode: 'fixed', port: fixedPort },
        baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
    });

    t.is(port, fixedPort);
    t.is(baseUrl, `http://127.0.0.1:${fixedPort}/`);

    // Observe that ':PORT' was replaced in args by listening for the printed value.
    const observed = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), 1000);
        const onData = (chunk: Buffer) => {
            if (new RegExp(`^ARG ${fixedPort}$`, 'm').test(chunk.toString())) {
                clearTimeout(timer);
                cleanup();
                resolve(true);
            }
        };
        const cleanup = () => {
            proc.stdout?.off('data', onData);
            proc.stderr?.off('data', onData);
        };
        proc.stdout?.on('data', onData);
        proc.stderr?.on('data', onData);
    });
    t.true(observed);

    await stop();
});

test.serial('startProcessWithPort allocates free port and baseUrl', async (t) => {
    const { proc, stop, port, baseUrl } = await startProcessWithPort({
        cmd: 'node',
        args: ['-e', codeWithArgPrinter, ':PORT'],
        cwd: process.cwd(),
        stdio: 'pipe',
        ready: { kind: 'log', pattern: /READY/ },
        port: { mode: 'free' },
        baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
    });

    t.truthy(typeof port === 'number' && port > 0);
    t.regex(baseUrl ?? '', /^http:\/\/127\.0\.0\.1:\d+\/$/);

    const observed = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), 1000);
        const onData = (chunk: Buffer) => {
            if (new RegExp(`^ARG ${port}$`, 'm').test(chunk.toString())) {
                clearTimeout(timer);
                cleanup();
                resolve(true);
            }
        };
        const cleanup = () => {
            proc.stdout?.off('data', onData);
            proc.stderr?.off('data', onData);
        };
        proc.stdout?.on('data', onData);
        proc.stderr?.on('data', onData);
    });
    t.true(observed);

    await stop();
});

// File-level helpers: start/stop around tests
const { getProc: getFixedProc } = registerProcForFile(test, {
    cmd: 'node',
    args: ['-e', "console.log('READY'); setTimeout(() => {}, 1000)"],
    cwd: process.cwd(),
    stdio: 'pipe',
    ready: { kind: 'log', pattern: /READY/ },
    baseUrl: 'http://example.local/',
});

test.serial('registerProcForFile exposes pid and baseUrl', (t) => {
    const { pid, baseUrl } = getFixedProc();
    t.true(pid > 0);
    t.is(baseUrl, 'http://example.local/');
});

const { getProc: getPortedProc } = registerProcForFileWithPort(test, {
    cmd: 'node',
    args: ['-e', codeWithArgPrinter, ':PORT'],
    cwd: process.cwd(),
    stdio: 'pipe',
    ready: { kind: 'log', pattern: /READY/ },
    port: { mode: 'free' },
    baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
});

test.serial('registerProcForFileWithPort exposes pid and computed baseUrl', (t) => {
    const { pid, baseUrl } = getPortedProc();
    t.true(pid > 0);
    t.regex(baseUrl ?? '', /^http:\/\/127\.0\.0\.1:\d+\/$/);
});
