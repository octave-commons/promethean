/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
import type { IncomingHttpHeaders, Server } from 'http';

import bodyParser from 'body-parser';
import express, {
    type ErrorRequestHandler,
    type NextFunction,
    type Request,
    type RequestHandler,
    type Response,
} from 'express';
import type { ReadonlyDeep } from 'type-fest';
import type { EventBus } from '@promethean/event/types.js';

type PublishParams = { readonly topic: string };
type PublishResultBody = { readonly id: string };
type PublishPayload = unknown;

type HttpPublisherDeps = {
    readonly bus: Pick<EventBus, 'publish'>;
    readonly port?: number;
};

const toHeaderRecord = (headers: ReadonlyDeep<IncomingHttpHeaders>): Readonly<Record<string, string>> =>
    Object.freeze(
        Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
            if (typeof value === 'string') {
                return { ...acc, [key]: value };
            }

            if (Array.isArray(value)) {
                return { ...acc, [key]: value.join(',') };
            }

            return acc;
        }, {}),
    );

type ImmutableRequestHandler<Params, ResBody, ReqBody, ReqQuery> = (
    ...args: readonly [
        ReadonlyDeep<Request<Params, ResBody, ReqBody, ReqQuery>>,
        ReadonlyDeep<Response<ResBody>>,
        NextFunction,
    ]
) => void;

const wrapAsync =
    <Params, ResBody, ReqBody, ReqQuery>(
        handler: (
            req: ReadonlyDeep<Request<Params, ResBody, ReqBody, ReqQuery>>,
            res: ReadonlyDeep<Response<ResBody>>,
        ) => Promise<void>,
    ): ImmutableRequestHandler<Params, ResBody, ReqBody, ReqQuery> =>
    (...[req, res, next]) => {
        void handler(req, res).catch((error) => {
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            next(normalizedError);
        });
    };

export const startHttpPublisher = ({ bus, port = 8081 }: HttpPublisherDeps): Server => {
    const app = express();
    app.use(bodyParser.json({ limit: '1mb' }));

    const handlePublish = async (
        req: ReadonlyDeep<Request<PublishParams, PublishResultBody, PublishPayload>>,
        res: ReadonlyDeep<Response<PublishResultBody>>,
    ): Promise<void> => {
        const record = await bus.publish<PublishPayload>(req.params.topic, req.body, {
            headers: { ...toHeaderRecord(req.headers) },
        });

        res.json({ id: record.id });
    };

    const publishRoute = wrapAsync(handlePublish);

    app.post(
        '/publish/:topic',
        publishRoute as unknown as RequestHandler<PublishParams, PublishResultBody, PublishPayload>,
    );

    const errorMiddleware = (
        ...[error, _req, res, next]: readonly [unknown, ReadonlyDeep<Request>, ReadonlyDeep<Response>, NextFunction]
    ) => {
        const actualRes = res as Response;

        if (actualRes.headersSent) {
            next(error instanceof Error ? error : new Error(String(error)));
            return;
        }

        const normalizedError = error instanceof Error ? error : new Error(String(error));
        actualRes.status(500).json({ error: normalizedError.message });
    };

    app.use(errorMiddleware as unknown as ErrorRequestHandler);

    return app.listen(port);
};
/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
