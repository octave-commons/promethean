/* eslint functional/prefer-immutable-types: "off", @typescript-eslint/prefer-readonly-parameter-types: "off" */
import type { Server } from 'http';

import express, { type RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import type { Db, Collection } from 'mongodb';

import { etagOf } from './etag.js';

export type SnapshotApiOptions = {
    collection: string; // e.g., "processes.snapshot"
    keyField?: string; // default "_key"
    bodyLimit?: string; // default "200kb"
    maxAgeSeconds?: number; // default 5 (client cache)
};

export function getSnap(coll: Collection, keyField: string, cacheCtl: string): RequestHandler {
    return async (req, res): Promise<void> => {
        const key = req.params.key;
        const doc = await coll.findOne({ [keyField]: key });
        if (!doc) {
            res.status(404).json({ error: 'not_found' });
            return;
        }

        const etag = etagOf({ ...doc, _id: undefined });
        if (req.headers['if-none-match'] === etag) {
            res.status(304).end();
            return;
        }
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', cacheCtl);
        res.json(doc);
    };
}

export function listSnaps(coll: Collection, _keyField: string, _cacheCtl: string): RequestHandler {
    return async (req, res): Promise<void> => {
        const limit = Math.min(Number(req.query.limit ?? 100), 1000);
        const offset = Number(req.query.offset ?? 0);
        const q = Object.entries(req.query).reduce<Record<string, unknown>>(
            (acc, [k, v]) => (k === 'limit' || k === 'offset' ? acc : { ...acc, [k]: v }),
            {},
        );
        const cursor = coll.find(q).sort({ _ts: -1 }).skip(offset).limit(limit);
        const items = await cursor.toArray();
        res.setHeader('Cache-Control', 'no-store');
        res.json({ offset, limit, count: items.length, items });
    };
}

export function headSnap(coll: Collection, keyField: string, cacheCtl: string): RequestHandler {
    return async (req, res): Promise<void> => {
        const key = req.params.key;
        const doc = await coll.findOne({ [keyField]: key }, { projection: { _id: 0, _ts: 1 } });
        if (!doc) {
            res.status(404).end();
            return;
        }
        const etag = etagOf(doc);
        if (req.headers['if-none-match'] === etag) {
            res.status(304).end();
            return;
        }
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', cacheCtl);
        res.status(200).end();
    };
}

export function startSnapshotApi(db: Db, port = 8091, opts: SnapshotApiOptions): Server {
    const app = express();
    app.set('etag', false);
    app.use(express.json({ limit: opts.bodyLimit ?? '200kb' }));

    // Rate limiter: max 100 requests per 15 minutes per IP
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);

    const coll = db.collection(opts.collection);
    const keyField = opts.keyField ?? '_key';
    const cacheCtl = `public, max-age=${opts.maxAgeSeconds ?? 5}`;

    app.get('/snap/:key', getSnap(coll, keyField, cacheCtl));
    app.get('/list', listSnaps(coll, keyField, cacheCtl));
    app.head('/snap/:key', headSnap(coll, keyField, cacheCtl));

    return app.listen(port, () => console.log(`[snapshot-api] on :${port} (${opts.collection})`));
}
