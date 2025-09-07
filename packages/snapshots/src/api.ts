import crypto from 'crypto';

import express from 'express';
import type { Db } from 'mongodb';

export type SnapshotApiOptions = {
    collection: string; // e.g., "processes.snapshot"
    keyField?: string; // default "_key"
    bodyLimit?: string; // default "200kb"
    maxAgeSeconds?: number; // default 5 (client cache)
};

function etagOf(doc: any) {
    const s = JSON.stringify(doc);
    return '"' + crypto.createHash('sha1').update(s).digest('hex') + '"';
}

export function startSnapshotApi(db: Db, port = 8091, opts: SnapshotApiOptions) {
    const app = express();
    app.set('etag', false);
    app.use(express.json({ limit: opts.bodyLimit ?? '200kb' }));

    const coll = db.collection(opts.collection);
    const keyField = opts.keyField ?? '_key';
    const cacheCtl = `public, max-age=${opts.maxAgeSeconds ?? 5}`;

    // GET /snap/:key
    app.get('/snap/:key', async (req, res): Promise<void> => {
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
        return;
    });

    // GET /list?offset=0&limit=100&status=alive
    app.get('/list', async (req, res): Promise<void> => {
        const limit = Math.min(Number(req.query.limit ?? 100), 1000);
        const offset = Number(req.query.offset ?? 0);
        const q: any = {};
        // simple filters
        for (const k of Object.keys(req.query)) {
            if (['limit', 'offset'].includes(k)) continue;
            q[k] = req.query[k];
        }
        const cursor = coll.find(q).sort({ _ts: -1 }).skip(offset).limit(limit);
        const items = await cursor.toArray();
        res.setHeader('Cache-Control', 'no-store');
        res.json({ offset, limit, count: items.length, items });
        return;
    });

    // HEAD /snap/:key (for cheap freshness checks)
    app.head('/snap/:key', async (req, res): Promise<void> => {
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
        return;
    });

    return app.listen(port, () => console.log(`[snapshot-api] on :${port} (${opts.collection})`));
}
