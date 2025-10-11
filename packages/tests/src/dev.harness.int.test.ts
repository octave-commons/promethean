import test from 'ava';
import { sleep } from '@promethean/utils';
import { startHarness } from '@promethean/dev/harness.js';

test('harness end-to-end', async (t) => {
    // Set a per-test timeout
    // @ts-ignore - ava runtime supports this method
    t.timeout?.(10_000);

    const h = await startHarness({ wsPort: 9190, httpPort: 9191 });

    // publish a heartbeat and wait a tick
    await h.bus.publish('heartbeat.received', {
        pid: 1,
        name: 'stt',
        host: 'local',
        cpu_pct: 1,
        mem_mb: 2,
    });
    await sleep(200);

    // ensure projector emitted process.state
    const events = await (h.bus as any).store.scan('process.state', { ts: 0 });
    t.is(events.length, 1);
    const cur = await h.bus.getCursor('heartbeat.received', 'process-projector');
    t.truthy(cur);

    await h.stop();
});
