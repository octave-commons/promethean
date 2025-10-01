/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
import type { Server } from 'http';

import express, {
    type ErrorRequestHandler,
    type NextFunction,
    type Request,
    type RequestHandler,
    type Response,
} from 'express';
import type { ReadonlyDeep } from 'type-fest';
import type { EventRecord, EventStore, Millis } from '@promethean/event/types.js';

class HttpError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

type ReplayQuery = {
    readonly topic?: string;
    readonly from?: string;
    readonly ts?: string;
    readonly afterId?: string;
    readonly limit?: string;
};

type ExportQuery = {
    readonly topic?: string;
    readonly fromTs?: string;
    readonly toTs?: string;
    readonly ndjson?: string;
};

type ReplayResponse = {
    readonly topic: string;
    readonly count: number;
    readonly events: ReadonlyArray<EventRecord>;
};

type ReplayDeps = {
    readonly store: Pick<EventStore, 'scan'>;
    readonly port?: number;
    readonly logger?: (message: string) => void;
};

type ReplayHandlers = {
    readonly replay: RequestHandler<unknown, ReplayResponse, unknown, ReplayQuery>;
    readonly exporter: RequestHandler<unknown, void, unknown, ExportQuery>;
};

const toError = (error: unknown): Error => (error instanceof Error ? error : new Error(String(error)));

const createErrorBody = (error: unknown): { readonly error: string } => ({ error: toError(error).message });

const wrapAsync = <Params, ResBody, ReqBody, ReqQuery>(
    handler: (
        req: ReadonlyDeep<Request<Params, ResBody, ReqBody, ReqQuery>>,
        res: ReadonlyDeep<Response<ResBody>>,
    ) => Promise<void>,
) =>
    ((
        ...[req, res, next]: readonly [
            ReadonlyDeep<Request<Params, ResBody, ReqBody, ReqQuery>>,
            ReadonlyDeep<Response<ResBody>>,
            NextFunction,
        ]
    ) => {
        void handler(req, res).catch((error) => {
            next(toError(error));
        });
    }) as unknown as RequestHandler<Params, ResBody, ReqBody, ReqQuery>;

const ensureTopic = (topic: string | undefined): string => {
    if (typeof topic === 'string' && topic.trim() !== '') {
        return topic;
    }

    throw new HttpError(400, 'topic required');
};

const parseNumber = (value: string | undefined, fallback: number | undefined): number | undefined => {
    if (value === undefined) {
        return fallback;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return undefined;
    }

    return parsed;
};

const parseReplayQuery = (query: ReadonlyDeep<ReplayQuery>) => {
    const topic = ensureTopic(query.topic);
    const from = (query.from ?? 'earliest') as 'earliest' | 'ts' | 'afterId';
    const ts = parseNumber(query.ts, undefined);
    const afterId = query.afterId === undefined ? undefined : String(query.afterId);
    const limit = parseNumber(query.limit, 1000);

    if ((from === 'ts' && ts === undefined) || (from === 'afterId' && afterId === undefined)) {
        throw new HttpError(400, 'invalid replay range parameters');
    }

    if (limit === undefined || limit <= 0) {
        throw new HttpError(400, 'limit must be a positive number');
    }

    return { topic, from, ts, afterId, limit } as const;
};

const buildScanParams = (
    from: 'earliest' | 'ts' | 'afterId',
    ts: Millis | undefined,
    afterId: string | undefined,
    limit: number,
): Parameters<EventStore['scan']>[1] =>
    from === 'afterId' ? { afterId: afterId as string, limit } : { ts: from === 'earliest' ? 0 : ts, limit };

const parseExportQuery = (query: ReadonlyDeep<ExportQuery>) => {
    const topic = ensureTopic(query.topic);
    const fromTs = parseNumber(query.fromTs, 0);
    const toTs = parseNumber(query.toTs, Date.now());
    const ndjson = (query.ndjson ?? '1') === '1';

    if (fromTs === undefined || toTs === undefined) {
        throw new HttpError(400, 'range bounds must be numeric');
    }

    if (fromTs > toTs) {
        throw new HttpError(400, 'fromTs must be less than or equal to toTs');
    }

    return { topic, fromTs, toTs, ndjson } as const;
};

const batchSize = 5000;

type BatchState = { readonly wroteAny: boolean; readonly nextCursor: Millis | undefined };

const writeBatch = (
    format: 'json' | 'ndjson',
    response: ReadonlyDeep<Response>,
    events: ReadonlyArray<EventRecord>,
    wroteAny: boolean,
): BatchState =>
    events.reduce<BatchState>(
        (state, event) => {
            const serialized = JSON.stringify(event);

            if (format === 'ndjson') {
                response.write(`${serialized}\n`);
                return { wroteAny: true, nextCursor: event.ts + 1 };
            }

            response.write(`${state.wroteAny ? ',' : ''}${serialized}`);
            return { wroteAny: true, nextCursor: event.ts + 1 };
        },
        { wroteAny, nextCursor: undefined },
    );

type StreamContext = {
    readonly store: Pick<EventStore, 'scan'>;
    readonly topic: string;
    readonly toTs: Millis;
    readonly format: 'json' | 'ndjson';
    readonly response: ReadonlyDeep<Response>;
};

const streamBatches = async (
    context: ReadonlyDeep<StreamContext>,
    cursor: Millis,
    wroteAny: boolean,
): Promise<boolean> => {
    const batch = await context.store.scan(context.topic, { ts: cursor, limit: batchSize });
    const filtered = batch.filter((event) => event.ts <= context.toTs);

    if (filtered.length === 0) {
        return wroteAny;
    }

    const { wroteAny: nextWroteAny, nextCursor } = writeBatch(context.format, context.response, filtered, wroteAny);

    if (filtered.length < batchSize || nextCursor === undefined || nextCursor > context.toTs) {
        return nextWroteAny;
    }

    return streamBatches(context, nextCursor, nextWroteAny);
};

const createReplayHandlers = (store: Pick<EventStore, 'scan'>): ReplayHandlers => {
    const replay = wrapAsync(
        async (
            req: ReadonlyDeep<Request<unknown, ReplayResponse, unknown, ReplayQuery>>,
            res: ReadonlyDeep<Response<ReplayResponse>>,
        ) => {
            const { topic, from, ts, afterId, limit } = parseReplayQuery(req.query);
            const params = buildScanParams(from, ts, afterId, limit);
            const events = await store.scan(topic, params);
            const immutableEvents = Object.freeze([...events]);

            res.json({ topic, count: immutableEvents.length, events: immutableEvents });
        },
    );

    const exporter = wrapAsync(
        async (req: ReadonlyDeep<Request<unknown, void, unknown, ExportQuery>>, res: ReadonlyDeep<Response<void>>) => {
            const { topic, fromTs, toTs, ndjson } = parseExportQuery(req.query);
            const format: 'json' | 'ndjson' = ndjson ? 'ndjson' : 'json';

            res.setHeader('Content-Type', format === 'ndjson' ? 'application/x-ndjson' : 'application/json');
            if (format === 'json') {
                res.write('[');
            }

            await streamBatches({ store, topic, toTs, format, response: res }, fromTs, false);

            if (format === 'json') {
                res.write(']');
            }

            res.end();
        },
    );

    const handlers: ReplayHandlers = { replay, exporter };
    return handlers;
};

const createErrorMiddleware = (): ErrorRequestHandler =>
    ((...[error, _req, res, next]: readonly [unknown, ReadonlyDeep<Request>, ReadonlyDeep<Response>, NextFunction]) => {
        const actualRes = res as Response;

        if (actualRes.headersSent) {
            next(toError(error));
            return;
        }

        const status = error instanceof HttpError ? error.status : 500;
        actualRes.status(status).json(createErrorBody(error));
    }) as unknown as ErrorRequestHandler;

export const startReplayAPI = ({ store, port = 8083, logger }: ReplayDeps): Server => {
    const app = express();
    const { replay, exporter } = createReplayHandlers(store);

    app.get('/replay', replay);
    app.get('/export', exporter);
    app.use(createErrorMiddleware());

    const log =
        logger ??
        ((message: string) => {
            console.log(message);
        });

    return app.listen(port, () => {
        log(`[replay] on :${port}`);
    });
};
/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
