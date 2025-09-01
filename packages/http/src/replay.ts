import express from 'express';

export function startReplayAPI(store: any, { port = 8083 } = {}) {
    const app = express();

    // GET /replay?topic=t&from=earliest|ts|afterId&ts=...&afterId=...&limit=1000
    app.get('/replay', async (req, res) => {
        try {
            const topic = String(req.query.topic || '');
            if (!topic) return res.status(400).json({ error: 'topic required' });

            const from = String(req.query.from || 'earliest');
            const ts = req.query.ts ? Number(req.query.ts) : undefined;
            const afterId = req.query.afterId ? String(req.query.afterId) : undefined;
            const limit = req.query.limit ? Number(req.query.limit) : 1000;

            const events = await store.scan(topic, {
                ts: from === 'ts' ? ts : from === 'earliest' ? 0 : undefined,
                afterId: from === 'afterId' ? afterId : undefined,
                limit,
            });
            res.json({ topic, count: events.length, events });
        } catch (e: any) {
            res.status(500).json({ error: e.message ?? String(e) });
        }
    });

    // GET /export?topic=t&fromTs=...&toTs=...&ndjson=1
    app.get('/export', async (req, res) => {
        try {
            const topic = String(req.query.topic || '');
            const fromTs = Number(req.query.fromTs || 0);
            const toTs = Number(req.query.toTs || Date.now());
            const ndjson = String(req.query.ndjson || '1') === '1';

            res.setHeader('Content-Type', ndjson ? 'application/x-ndjson' : 'application/json');
            if (!ndjson) res.write('[');
            let first = true;
            const batchSize = 5000;
            let cursorTs = fromTs;
            while (true) {
                const batch = await store.scan(topic, {
                    ts: cursorTs,
                    limit: batchSize,
                });
                const filtered = batch.filter((e: any) => e.ts <= toTs);
                if (filtered.length === 0) break;
                for (const e of filtered) {
                    if (ndjson) {
                        res.write(JSON.stringify(e) + '\n');
                    } else {
                        if (!first) res.write(',');
                        res.write(JSON.stringify(e));
                        first = false;
                    }
                }
                const last = filtered.at(-1)!;
                cursorTs = last.ts + 1;
                if (filtered.length < batchSize || cursorTs > toTs) break;
            }
            if (!ndjson) res.write(']');
            res.end();
        } catch (e: any) {
            res.status(500).json({ error: e.message ?? String(e) });
        }
    });

    return app.listen(port, () => console.log(`[replay] on :${port}`));
}
