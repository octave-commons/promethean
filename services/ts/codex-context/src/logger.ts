type Level = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<Level, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

function now() {
    return new Date().toISOString();
}

function parseLevel(): Level {
    const raw = (process.env.CC_LOG_LEVEL || process.env.LOG_LEVEL || 'info').toLowerCase();
    if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
    return 'info';
}

const globalLevel = parseLevel();

export type LogFields = Record<string, unknown>;

export function createLogger(service: string, base: LogFields = {}) {
    const svc = service;
    function emit(level: Level, msg: string, fields?: LogFields) {
        if (levelOrder[level] < levelOrder[globalLevel]) return;
        const payload = {
            ts: now(),
            level,
            service: svc,
            ...base,
            ...(fields || {}),
            msg,
        };
        try {
            // Emit as line-delimited JSON for PM2/file capture
            process.stdout.write(JSON.stringify(payload) + '\n');
        } catch (e) {
            // Fallback to console if needed
            // eslint-disable-next-line no-console
            console.log(`[${payload.ts}] ${svc} ${level.toUpperCase()}: ${msg}`);
        }
    }

    return {
        debug: (msg: string, fields?: LogFields) => emit('debug', msg, fields),
        info: (msg: string, fields?: LogFields) => emit('info', msg, fields),
        warn: (msg: string, fields?: LogFields) => emit('warn', msg, fields),
        error: (msg: string, fields?: LogFields) => emit('error', msg, fields),
        child(extra: LogFields) {
            return createLogger(service, { ...base, ...extra });
        },
    };
}

export type Logger = ReturnType<typeof createLogger>;
