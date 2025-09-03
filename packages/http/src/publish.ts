// SPDX-License-Identifier: GPL-3.0-only
import express from 'express';
import bodyParser from 'body-parser';

export function startHttpPublisher(bus: any, port = 8081) {
    const app = express();
    app.use(bodyParser.json({ limit: '1mb' }));

    app.post('/publish/:topic', async (req, res) => {
        try {
            const rec = await bus.publish(req.params.topic, req.body, {
                headers: req.headers as any,
            });
            res.json({ id: rec.id });
        } catch (e: any) {
            res.status(500).json({ error: e.message ?? String(e) });
        }
    });

    return app.listen(port);
}
