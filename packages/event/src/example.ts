import { InMemoryEventBus } from './memory.js';
import type { EventRecord } from './types.js';

(async () => {
    const bus = new InMemoryEventBus();

    // SUBSCRIBE (durable)
    await bus.subscribe(
        'heartbeat.received',
        'ops',
        async (_e: EventRecord) => {
            // do stuff (update process table, emit metrics, etc.)
            // console.log("HB:", _e.payload);
        },
        { from: 'earliest', batchSize: 100 },
    );

    // PUBLISH
    await bus.publish(
        'heartbeat.received',
        {
            pid: 12345,
            name: 'stt',
            host: 'dev',
            cpu_pct: 12.3,
            mem_mb: 256,
        },
        { tags: ['#duck', '#stt'] },
    );

    // Optional: read the cursor
    const _cur = await bus.getCursor('heartbeat.received', 'ops');
    // console.log("cursor:", _cur);
})();
