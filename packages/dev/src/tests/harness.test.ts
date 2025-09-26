import test from 'ava';

import { startHarness } from '../harness.js';

test('startHarness exposes a bus and stops cleanly', async (t) => {
    const harness = await startHarness({ wsPort: 0, httpPort: 0 });
    t.teardown(() => harness.stop());

    t.truthy(harness.bus);
    t.is(typeof harness.bus.publish, 'function');
});
