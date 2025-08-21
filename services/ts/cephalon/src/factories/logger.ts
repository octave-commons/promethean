export type Logger = {
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
};

export function makeLogger(prefix = 'cephalon'): Logger {
    const tag = `[${prefix}]`;
    return {
        debug: (...a) => console.debug(tag, ...a),
        info: (...a) => console.info(tag, ...a),
        warn: (...a) => console.warn(tag, ...a),
        error: (...a) => console.error(tag, ...a),
    };
}
