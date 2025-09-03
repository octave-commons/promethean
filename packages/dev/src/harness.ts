// SPDX-License-Identifier: GPL-3.0-only
import { InMemoryEventBus } from '@promethean/event/memory.js';
import { startWSGateway } from '@promethean/ws/server.js';
import { startHttpPublisher } from '@promethean/http/publish.js';
import { startProcessProjector } from '@promethean/examples/process/projector.js';

export interface Harness {
    bus: any;
    stop(): Promise<void>;
}

export async function startHarness({ wsPort = 9090, httpPort = 9091 } = {}): Promise<Harness> {
    const bus = new InMemoryEventBus();

    const wss = startWSGateway(bus, wsPort, { auth: async () => ({ ok: true }) });
    const http = startHttpPublisher(bus, httpPort);
    const stopProj = await startProcessProjector(bus);

    return {
        bus,
        async stop() {
            await new Promise((r) => (http as any).close(r));
            wss.close();
            stopProj();
        },
    };
}
