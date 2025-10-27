import net from 'node:net';

import { sleep as wait } from '@promethean-os/utils';

export const waitForTcp = async (port: number, host = '127.0.0.1', timeoutMs = 15000): Promise<void> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const ok = await new Promise<boolean>((resolve) => {
            const s = net.createConnection(port, host);
            s.once('connect', () => {
                s.end();
                resolve(true);
            });
            s.once('error', () => resolve(false));
        });
        if (ok) return;
        await wait(120);
    }
    throw new Error(`TCP not ready: ${host}:${port}`);
};
