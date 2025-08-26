// @ts-nocheck
import test from 'ava';
import path from 'node:path';

test.serial('RemoteEmbeddingFunction: times out when no response', async (t) => {
    const prev = {
        SHARED_IMPORT: process.env.SHARED_IMPORT,
        EMBEDDING_TIMEOUT_MS: process.env.EMBEDDING_TIMEOUT_MS,
    };
    try {
        const abs = path.join(process.cwd(), 'tests', 'helpers', 'slowBroker.js');
        process.env.SHARED_IMPORT = 'file://' + abs;
        process.env.EMBEDDING_TIMEOUT_MS = '50';
        const { RemoteEmbeddingFunction } = await import('../../.js');
        const ref = new RemoteEmbeddingFunction(undefined, 'driverX', 'fnY');
        await t.throwsAsync(() => ref.generate(['hello']), {
            message: /embedding timeout/i,
        });
        ref?.dispose?.();
    } finally {
        if (prev.SHARED_IMPORT === undefined) delete process.env.SHARED_IMPORT;
        else process.env.SHARED_IMPORT = prev.SHARED_IMPORT;
        if (prev.EMBEDDING_TIMEOUT_MS === undefined) delete process.env.EMBEDDING_TIMEOUT_MS;
        else process.env.EMBEDDING_TIMEOUT_MS = prev.EMBEDDING_TIMEOUT_MS;
    }
});
