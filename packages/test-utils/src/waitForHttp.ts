import http from 'node:http';

import { sleep as wait } from '@promethean-os/utils';

export const waitForHttp = async (url: string, timeoutMs = 15000): Promise<void> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const ok = await new Promise<boolean>((resolve) => {
            const req = http.get(url, (res) => {
                res.resume();
                resolve((res.statusCode ?? 0) < 500);
            });
            req.on('error', () => resolve(false));
            req.end();
        });
        if (ok) return;
        await wait(120);
    }
    throw new Error(`HTTP not ready: ${url}`);
};
