// @ts-nocheck
/**
 * @deprecated Persistence now uses @shared/ts/persistence/DualStore.
 */
import mongoose from 'mongoose';

let connected = false;
let _memory = null; // { mms, uri }

export async function initMongo() {
    // In tests, if MONGODB_URI is not provided or explicitly set to 'memory',
    // spin up an in-memory server and connect mongoose to it.
    const isTest = String(process.env.NODE_ENV || '').toLowerCase() === 'test';
    const wantsMemory = !process.env.MONGODB_URI || process.env.MONGODB_URI === 'memory';
    let uri = process.env.MONGODB_URI;

    if (isTest && wantsMemory) {
        if (!_memory) {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mms = await MongoMemoryServer.create();
            _memory = { mms, uri: mms.getUri() };
        }
        uri = _memory.uri;
        // expose a usable URI for any downstream that reads process.env
        process.env.MONGODB_URI = uri;
    }

    if (!uri) throw new Error('No mongo URI provided');
    if (!connected) {
        try {
            await mongoose.connect(uri);
            connected = true;
        } catch {
            throw new Error('could not connect to mongo');
        }
    }
    return mongoose;
}

export async function cleanupMongo() {
    try {
        if (connected) await mongoose.disconnect();
    } catch {}
    connected = false;
    if (_memory?.mms) {
        try {
            await _memory.mms.stop();
        } catch {}
        _memory = null;
    }
}
