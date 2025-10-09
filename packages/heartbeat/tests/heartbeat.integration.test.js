// integration
import test from 'ava';
import { installInMemoryPersistence } from '@promethean/test-utils/persistence.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { BrokerClient } from '@promethean/legacy/brokerClient.js';
import { sleep } from '@promethean/utils';
import { start, stop } from '../index.js';

let pers;
let brokerPort;

if (process.env.SKIP_NETWORK_TESTS === '1') {
  test('heartbeat network tests skipped in sandbox', (t) => t.pass());
} else {
  async function publish(pid, name) {
    const bc = new BrokerClient({ url: process.env.BROKER_URL });
    await bc.connect();
    bc.publish('heartbeat', { pid, name });
    await sleep(20);
    bc.disconnect();
    for (let i = 0; i < 10; i++) {
      const doc = await pers.mongo
        .db('heartbeat_db')
        .collection('heartbeats')
        .find()
        .toArray()
        .then((d) => d.find((x) => x.pid === pid));
      if (doc) break;
      await sleep(20);
    }
  }

  test.before(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    process.env.ECOSYSTEM_CONFIG = path.resolve(
      __dirname,
      '../fixtures/ecosystem.fixture.config.mjs',
    );
    pers = installInMemoryPersistence();
    process.env.HEARTBEAT_TIMEOUT = '500';
    process.env.CHECK_INTERVAL = '50';
    process.env.BROKER_URL = 'memory://hb';
    await start();
  });

  test.after.always(async () => {
    await stop();
    if (pers) pers.dispose();
  });

  test.serial('stale process is killed', async (t) => {
    const child = spawn('node', ['-e', 'setInterval(()=>{},1000)']);
    t.teardown(() => {
      if (!child.killed) {
        try {
          child.kill();
        } catch {}
      }
    });
    await publish(child.pid, 'kill-app');
    // Wait longer than the heartbeat timeout (500ms) + check interval (50ms)
    await sleep(600);

    // Check multiple times with a small delay to account for timing
    let doc = null;
    for (let i = 0; i < 5; i++) {
      doc = (await pers.mongo.db('heartbeat_db').collection('heartbeats').find().toArray()).find(
        (d) => d.pid === child.pid,
      );

      if (doc?.killedAt) {
        break;
      }
      await sleep(50);
    }

    t.truthy(doc?.killedAt, `Process should be marked as killed, got: ${JSON.stringify(doc)}`);
  });

  test.serial('rejects excess instances', async (t) => {
    const child1 = spawn('node', ['-e', 'setInterval(()=>{},1000)']);
    const child2 = spawn('node', ['-e', 'setInterval(()=>{},1000)']);
    t.teardown(() => {
      for (const child of [child1, child2]) {
        if (!child.killed) {
          try {
            child.kill();
          } catch {}
        }
      }
    });
    await publish(child1.pid, 'test-app');
    await publish(child2.pid, 'test-app');
    const count = await pers.mongo
      .db('heartbeat_db')
      .collection('heartbeats')
      .countDocuments({ name: 'test-app' });
    t.is(count, 1);
  });

  test.serial('records process metrics', async (t) => {
    const child = spawn('node', ['-e', 'setInterval(()=>{},1000)']);
    t.teardown(() => {
      if (!child.killed) {
        try {
          child.kill();
        } catch {}
      }
    });
    await publish(child.pid, 'metric-app');
    const doc = (
      await pers.mongo.db('heartbeat_db').collection('heartbeats').find().toArray()
    ).find((d) => d.pid === child.pid);
    t.is(typeof doc.cpu, 'number');
    t.is(typeof doc.memory, 'number');
    t.is(typeof doc.netRx, 'number');
    t.is(typeof doc.netTx, 'number');
  });

  test.serial('lists heartbeats', async (t) => {
    const child = spawn('node', ['-e', 'setInterval(()=>{},1000)']);
    t.teardown(() => {
      if (!child.killed) {
        try {
          child.kill();
        } catch {}
      }
    });
    await publish(child.pid, 'list-app');
    const docs = await pers.mongo.db('heartbeat_db').collection('heartbeats').find({}).toArray();
    const found = docs.find((h) => h.pid === child.pid);
    t.truthy(found);
    t.is(found.name, 'list-app');
  });

  test.serial('ignores heartbeats from previous sessions', async (t) => {
    await pers.mongo.db('heartbeat_db').collection('heartbeats').insertOne({
      pid: 12345,
      name: 'test-app',
      last: Date.now(),
      sessionId: 'old-session',
    });
    await stop();
    await start();
    const child = spawn('node', ['-e', 'setInterval(()=>{},1000)']);
    t.teardown(() => {
      if (!child.killed) {
        try {
          child.kill();
        } catch {}
      }
    });
    await publish(child.pid, 'test-app');
    const doc = (
      await pers.mongo.db('heartbeat_db').collection('heartbeats').find().toArray()
    ).find((d) => d.pid === child.pid);
    t.truthy(doc.sessionId);
    t.not(doc.sessionId, 'old-session');
  });

  test.serial('cleanup marks heartbeats killed on stop', async (t) => {
    const child = spawn('node', ['-e', 'setInterval(()=>{},1000)']);
    await publish(child.pid, 'cleanup-app');
    await stop();
    const doc = (
      await pers.mongo.db('heartbeat_db').collection('heartbeats').find().toArray()
    ).find((d) => d.pid === child.pid);
    t.truthy(doc.killedAt);
    await start();
    if (!child.killed) {
      try {
        child.kill();
      } catch {}
    }
  });
}
