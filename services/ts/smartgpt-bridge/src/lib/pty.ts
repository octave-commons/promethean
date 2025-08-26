// @ts-nocheck
// Lazy/optional node-pty wrapper so tests and unsupported runtimes don't explode.
// If NODE_PTY_DISABLED=1, this returns null or throws a typed error via helpers.

let _pty; // undefined: not loaded, null: unavailable, object: loaded

export function getPty() {
    if (process.env.NODE_PTY_DISABLED === '1') return null;
    if (_pty !== undefined) return _pty;
    try {
        // dynamic require to avoid ESM import errors when missing
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('node-pty');
        _pty = mod && (mod.default || mod);
    } catch {
        _pty = null;
    }
    return _pty;
}

export class PtyUnavailableError extends Error {
    constructor() {
        super('PTY_UNAVAILABLE');
        this.name = 'PTY_UNAVAILABLE';
    }
}

export function spawnPty(file, args, opts = {}) {
    const pty = getPty();
    if (!pty) throw new PtyUnavailableError();
    return pty.spawn(file, args, opts);
}
