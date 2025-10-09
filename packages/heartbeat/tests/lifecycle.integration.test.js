// integration
import test from 'ava';
import path from 'path';
import { fileURLToPath } from 'url';
import { installInMemoryPersistence } from '@promethean/test-utils/persistence.js';
import { start, stop } from '../index.js';
import { start as startBroker, stop as stopBroker } from '../../broker/index.js';

if (process.env.SKIP_NETWORK_TESTS === '1') {
  test('heartbeat lifecycle network tests skipped in sandbox', (t) => t.pass());
} else {
  test.before(async (t) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    process.env.ECOSYSTEM_CONFIG = path.resolve(
      __dirname,
      '../fixtures/ecosystem.fixture.config.mjs',
    );
    const pers = installInMemoryPersistence();
    const broker = await startBroker(0);
    const brokerPort = broker.address().port;
    process.env.BROKER_URL = `ws://127.0.0.1:${brokerPort}`;
    t.context.pers = pers;
    t.context.broker = broker;
  });

  test.after.always(async (t) => {
    await stop();
    if (t.context.broker) await stopBroker(t.context.broker);
    if (t.context.pers) t.context.pers.dispose();
  });

  // Ensure stopping twice does not throw and cleans up internal state.
  test('stop may be called multiple times', async (t) => {
    await start();
    await stop();
    await t.notThrowsAsync(stop);
  });
}
