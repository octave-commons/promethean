import { InMemoryEventBus } from '@promethean/event/memory.js';
import type { EventBus } from '@promethean/event/types.js';
import { startProcessProjector } from '@promethean/examples/process/projector.js';
import { startHttpPublisher } from '@promethean/http/publish.js';
import { startWSGateway } from '@promethean/ws/server.js';

export type Harness = {
    bus: EventBus;
    stop(): Promise<void>;
};

export type HarnessOptions = {
    readonly wsPort?: number;
    readonly httpPort?: number;
};

type CloseHandler = (err?: Readonly<Error>) => void;

const closeGracefully = (closer: (handler: CloseHandler) => void): Promise<void> =>
    new Promise<void>((resolve, reject) => {
        const onClose: CloseHandler = (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        };
        closer(onClose);
    });

export async function startHarness({ wsPort = 9090, httpPort = 9091 }: HarnessOptions = {}): Promise<Harness> {
    const bus: EventBus = new InMemoryEventBus();

    const wss = startWSGateway(bus, wsPort, { auth: async () => ({ ok: true }) });
    const http = startHttpPublisher({ bus, port: httpPort });
    const stopProj = await startProcessProjector(bus);

    return {
        bus,
        async stop() {
            await closeGracefully((handler) => {
                http.close(handler);
            });
            await closeGracefully((handler) => {
                wss.close(handler);
            });
            stopProj();
        },
    };
}
