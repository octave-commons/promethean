import fs from 'fs';
import path from 'path';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const LOG_JSON = /^true$/i.test(process.env.LOG_JSON || 'false');
const LOG_FILE = process.env.LOG_FILE || '';

let stream = null;
if (LOG_FILE) {
    try {
        const dir = path.dirname(LOG_FILE);
        fs.mkdirSync(dir, { recursive: true });
        stream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
    } catch (e) {
        // fall back to console only
    }
}

function should(level) {
    return (LEVELS[level] ?? 2) <= (LEVELS[LOG_LEVEL] ?? 2);
}

function format(level, msg, meta) {
    const ts = new Date().toISOString();
    if (LOG_JSON) {
        return JSON.stringify({ ts, level, msg, ...meta });
    }
    let line = `[${ts}] ${level.toUpperCase()} ${msg}`;
    if (meta && (meta.err || meta.error)) {
        const err = meta.err || meta.error;
        const details = err?.stack || err?.message || String(err);
        line += `\n${details}`;
    }
    return line;
}

function doWrite(line) {
    if (stream) {
        try {
            stream.write(line + '\n');
        } catch {}
    }
    try {
        console.log(line);
    } catch {}
}

function write(level, msg, meta = {}) {
    if (!should(level)) return;
    const line = format(level, msg, meta) + '\n';
    if (stream) {
        try {
            stream.write(line);
        } catch {}
    }
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    try {
        fn(line.trimEnd());
    } catch {}
}

export const logger = {
    level: LOG_LEVEL,
    info: (msg, meta) => write('info', msg, meta),
    warn: (msg, meta) => write('warn', msg, meta),
    error: (msg, meta) => write('error', msg, meta),
    debug: (msg, meta) => write('debug', msg, meta),
    trace: (msg, meta) => write('trace', msg, meta),
    // Always-on audit logs (bypass level filtering). Use for security events.
    audit: (msg, meta = {}) => {
        const line = format('audit', msg, meta);
        doWrite(line);
    },
};
