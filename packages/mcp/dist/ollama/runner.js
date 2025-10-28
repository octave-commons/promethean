const defaultNow = () => new Date();
const isAbortError = (error) => Boolean(error &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'AbortError');
const errorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    return 'Unknown error';
};
const buildRequest = (task) => {
    const common = {
        model: task.model,
        stream: task.stream ?? true,
    };
    if (task.options) {
        common.options = task.options;
    }
    if (task.kind === 'generate') {
        if (task.suffix) {
            common.suffix = task.suffix;
        }
        return {
            path: '/api/generate',
            body: {
                ...common,
                prompt: task.prompt,
            },
        };
    }
    return {
        path: '/api/chat',
        body: {
            ...common,
            messages: task.messages.map((message) => ({ role: message.role, content: message.content })),
        },
    };
};
const createStreamQueue = () => {
    const buffer = [];
    let pending;
    let pendingReject;
    let finished = false;
    let storedError;
    const iterator = {
        [Symbol.asyncIterator]() {
            return this;
        },
        next() {
            if (storedError) {
                return Promise.reject(storedError);
            }
            if (buffer.length > 0) {
                return Promise.resolve({ value: buffer.shift(), done: false });
            }
            if (finished) {
                return Promise.resolve({ value: undefined, done: true });
            }
            return new Promise((resolve, reject) => {
                pending = resolve;
                pendingReject = reject;
            });
        },
        return() {
            finished = true;
            if (pending) {
                pending({ value: undefined, done: true });
                pending = undefined;
                pendingReject = undefined;
            }
            return Promise.resolve({ value: undefined, done: true });
        },
        throw(error) {
            finished = true;
            storedError = error;
            if (pendingReject) {
                pendingReject(error);
                pending = undefined;
                pendingReject = undefined;
            }
            return Promise.reject(error);
        },
    };
    const push = (event) => {
        if (finished || storedError) {
            return;
        }
        if (pending) {
            pending({ value: event, done: false });
            pending = undefined;
            pendingReject = undefined;
        }
        else {
            buffer.push(event);
        }
    };
    const close = () => {
        if (finished) {
            return;
        }
        finished = true;
        if (pending) {
            pending({ value: undefined, done: true });
            pending = undefined;
            pendingReject = undefined;
        }
    };
    const fail = (error) => {
        if (finished) {
            return;
        }
        storedError = error;
        finished = true;
        if (pendingReject) {
            pendingReject(error);
        }
        pending = undefined;
        pendingReject = undefined;
    };
    return { iterator, push, close, fail };
};
const safeParse = (raw) => {
    try {
        return JSON.parse(raw);
    }
    catch {
        return undefined;
    }
};
const coerceNumber = (value) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const normaliseDurationMs = (value) => {
    const parsed = coerceNumber(value);
    if (!parsed)
        return 0;
    return Math.round(parsed / 1_000_000);
};
const toSsePayload = (payload) => {
    const lines = payload
        .split(/\r?\n/)
        .map((line) => line.trimStart())
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart());
    if (lines.length === 0) {
        return undefined;
    }
    return lines.join('\n').trim();
};
const createChunkParser = (contentType) => {
    const mime = contentType?.split(';')[0]?.trim().toLowerCase() ?? '';
    const isSse = mime === 'text/event-stream';
    let buffer = '';
    const drain = (includePartial) => {
        const delimiter = isSse ? '\n\n' : '\n';
        const collected = [];
        while (true) {
            const idx = buffer.indexOf(delimiter);
            if (idx < 0) {
                break;
            }
            const segment = buffer.slice(0, idx);
            buffer = buffer.slice(idx + delimiter.length);
            const trimmed = segment.trim();
            if (!trimmed) {
                continue;
            }
            if (isSse) {
                const payload = toSsePayload(segment);
                if (payload) {
                    collected.push(payload);
                }
            }
            else {
                collected.push(trimmed);
            }
        }
        if (includePartial) {
            const remaining = buffer.trim();
            buffer = '';
            if (remaining) {
                if (isSse) {
                    const payload = toSsePayload(remaining);
                    if (payload) {
                        collected.push(payload);
                    }
                }
                else {
                    collected.push(remaining);
                }
            }
        }
        return collected;
    };
    return {
        feed(fragment) {
            buffer += fragment;
            return drain(false);
        },
        flush() {
            return drain(true);
        },
    };
};
const consumeResponse = async (response, options) => {
    const chunks = [];
    const decoder = new TextDecoder();
    let aborted = false;
    let reader;
    const parser = createChunkParser(response.headers.get('content-type'));
    let aggregatedText = '';
    let lastParsed;
    let finalParsed;
    let tokensIn = 0;
    let tokensOut = 0;
    let durationMs = 0;
    const abortHandler = () => {
        aborted = true;
        if (reader) {
            reader.cancel().catch(() => undefined);
        }
    };
    if (options.signal) {
        if (options.signal.aborted) {
            aborted = true;
        }
        options.signal.addEventListener('abort', abortHandler, { once: true });
    }
    const handleSegment = (segment) => {
        const raw = segment.trim();
        if (!raw) {
            return;
        }
        chunks.push(raw);
        const parsed = safeParse(raw);
        if (parsed && typeof parsed === 'object') {
            lastParsed = parsed;
            const maybeDelta = parsed.message
                ?.content;
            const responseText = parsed.response;
            const hasDoneField = Object.prototype.hasOwnProperty.call(parsed, 'done');
            const delta = typeof maybeDelta === 'string'
                ? maybeDelta
                : hasDoneField && typeof responseText === 'string'
                    ? responseText
                    : undefined;
            if (delta) {
                aggregatedText += delta;
            }
            const done = Boolean(parsed.done);
            if (done) {
                finalParsed = parsed;
                if (options.debug) {
                    tokensIn =
                        coerceNumber(parsed.prompt_eval_count) ?? tokensIn;
                    tokensOut = coerceNumber(parsed.eval_count) ?? tokensOut;
                    durationMs = normaliseDurationMs(parsed.total_duration ?? durationMs);
                }
            }
            else if (options.debug) {
                tokensIn =
                    coerceNumber(parsed.prompt_eval_count) ?? tokensIn;
                tokensOut = coerceNumber(parsed.eval_count) ?? tokensOut;
            }
            options.queue.push({ raw, json: parsed, textDelta: delta, done });
        }
        else {
            if (raw) {
                aggregatedText += raw;
            }
            options.queue.push({ raw });
        }
    };
    try {
        if (response.body) {
            reader = response.body.getReader();
            while (true) {
                if (options.signal?.aborted) {
                    aborted = true;
                    break;
                }
                const { value, done } = await reader.read();
                if (value) {
                    const fragment = decoder.decode(value, { stream: !done });
                    if (fragment.length > 0) {
                        const segments = parser.feed(fragment);
                        for (const segment of segments) {
                            handleSegment(segment);
                        }
                    }
                }
                if (done)
                    break;
            }
            const remaining = parser.flush();
            for (const segment of remaining) {
                handleSegment(segment);
            }
        }
        else {
            const text = await response.text();
            if (text.length > 0) {
                const segments = parser.feed(text);
                for (const segment of segments) {
                    handleSegment(segment);
                }
                const remaining = parser.flush();
                for (const segment of remaining) {
                    handleSegment(segment);
                }
            }
        }
    }
    catch (error) {
        if (isAbortError(error) || options.signal?.aborted) {
            aborted = true;
        }
        else {
            options.queue.fail(error);
            if (options.signal) {
                options.signal.removeEventListener('abort', abortHandler);
            }
            return {
                status: 'failed',
                error: errorMessage(error),
                data: aggregatedText || lastParsed,
                logs: chunks,
                aborted: false,
            };
        }
    }
    finally {
        if (options.signal) {
            options.signal.removeEventListener('abort', abortHandler);
        }
        options.queue.close();
    }
    const data = (() => {
        if (finalParsed && typeof finalParsed === 'object') {
            if (aggregatedText) {
                const base = finalParsed;
                const message = (base.message && typeof base.message === 'object'
                    ? { ...base.message, content: aggregatedText }
                    : { content: aggregatedText });
                return { ...base, message };
            }
            return finalParsed;
        }
        if (aggregatedText) {
            return aggregatedText;
        }
        return lastParsed ?? (chunks.length > 0 ? chunks.join('') : undefined);
    })();
    if (aborted) {
        return {
            status: 'aborted',
            error: 'aborted',
            data,
            logs: chunks,
            aborted: true,
            debug: options.debug ? { tokensIn, tokensOut, durationMs } : undefined,
        };
    }
    if (!response.ok) {
        return {
            status: 'failed',
            error: `ollama returned ${response.status}`,
            data,
            logs: chunks,
            aborted: false,
            debug: options.debug ? { tokensIn, tokensOut, durationMs } : undefined,
        };
    }
    return {
        status: 'succeeded',
        data,
        logs: chunks,
        aborted: false,
        debug: options.debug ? { tokensIn, tokensOut, durationMs } : undefined,
    };
};
const finalise = (id, started, finished, result) => ({
    id,
    startedAt: started.toISOString(),
    finishedAt: finished.toISOString(),
    status: result.status,
    output: Object.freeze({
        logs: Object.freeze([...result.logs]),
        data: result.data,
        error: result.error,
    }),
});
const parseRetryAfter = (header, now) => {
    if (!header) {
        return null;
    }
    const numeric = Number(header);
    if (Number.isFinite(numeric)) {
        return Math.max(0, Math.floor(numeric * 1000));
    }
    const ts = Date.parse(header);
    if (Number.isFinite(ts)) {
        const diff = ts - now().getTime();
        return diff > 0 ? diff : 0;
    }
    return null;
};
const emptyStream = {
    [Symbol.asyncIterator]() {
        return {
            next: () => Promise.resolve({ value: undefined, done: true }),
        };
    },
};
export const runTask = async (task, deps, options = {}) => {
    const { fetch: fetchImpl, baseUrl } = deps;
    const now = deps.now ?? defaultNow;
    const startedAt = now();
    const descriptor = buildRequest(task);
    const url = new URL(descriptor.path, baseUrl).toString();
    const queue = createStreamQueue();
    const controller = new AbortController();
    const inputSignal = options.signal;
    let timedOut = false;
    let externalAbort = false;
    const unsubscribe = (() => {
        if (!inputSignal) {
            return () => undefined;
        }
        if (inputSignal.aborted) {
            externalAbort = true;
            controller.abort(inputSignal.reason);
            return () => undefined;
        }
        const listener = () => {
            externalAbort = true;
            controller.abort(inputSignal.reason);
        };
        inputSignal.addEventListener('abort', listener, { once: true });
        return () => inputSignal.removeEventListener('abort', listener);
    })();
    let timeoutId;
    if (typeof options.timeoutMs === 'number' && Number.isFinite(options.timeoutMs)) {
        timeoutId = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, Math.max(0, options.timeoutMs));
    }
    const init = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(descriptor.body),
        signal: controller.signal,
    };
    let response;
    try {
        response = await fetchImpl(url, init);
    }
    catch (error) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        unsubscribe();
        const kind = timedOut || externalAbort || isAbortError(error)
            ? { kind: 'Timeout' }
            : { kind: 'Error', error: errorMessage(error) };
        return {
            stream: emptyStream,
            result: Promise.resolve(kind),
        };
    }
    if (response.status === 429) {
        const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'), now);
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        unsubscribe();
        return {
            stream: emptyStream,
            result: Promise.resolve({ kind: 'RateLimited', retryAfterMs }),
        };
    }
    const processing = consumeResponse(response, {
        signal: controller.signal,
        queue,
        debug: options.debug,
    })
        .then((result) => {
        const finishedAt = now();
        if (result.aborted || controller.signal.aborted) {
            return { kind: 'Timeout' };
        }
        if (!response.ok || result.status !== 'succeeded') {
            if (!response.ok) {
                return {
                    kind: 'Error',
                    error: result.error ?? `ollama returned ${response.status}`,
                    status: response.status,
                };
            }
            return {
                kind: 'Error',
                error: result.error ?? 'ollama response stream failed',
            };
        }
        return {
            kind: 'Success',
            result: finalise(task.id, startedAt, finishedAt, result),
            debug: result.debug,
        };
    })
        .catch((error) => {
        queue.fail(error);
        return { kind: 'Error', error: errorMessage(error) };
    })
        .finally(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        unsubscribe();
    });
    return { stream: queue.iterator, result: processing };
};
//# sourceMappingURL=runner.js.map