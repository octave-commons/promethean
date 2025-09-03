// SPDX-License-Identifier: GPL-3.0-only
import test from 'ava';
import { queueManager } from '../shared/js/queueManager.js';

function createWS() {
    return {
        messages: [],
        send(msg) {
            this.messages.push(msg);
        },
    };
}

// If you can add a reset in queueManager, uncomment:
// test.beforeEach(() => queueManager.reset());

test.serial('ready dispatches queued task and acknowledge clears assignment', (t) => {
    const ws = createWS();
    const workerId = 'w1';
    const queue = 'alpha';

    queueManager.ready(ws, workerId, queue);
    const task = queueManager.enqueue(queue, { value: 1 });

    t.is(ws.messages.length, 1);
    const msg = JSON.parse(ws.messages[0]);
    t.is(msg.action, 'task-assigned');
    t.is(msg.task.id, task.id);

    t.true(queueManager.acknowledge(workerId, task.id));

    const state = queueManager.getState();
    t.is(state.queues[queue], 0);
    t.is(state.assignments[workerId], undefined);

    queueManager.unregisterWorker(workerId);
});

test.serial('unregisterWorker requeues unacked task', (t) => {
    const ws = createWS();
    const workerId = 'w2';
    const queue = 'beta';

    queueManager.ready(ws, workerId, queue);
    const task = queueManager.enqueue(queue, { value: 2 });

    // first assignment went out
    t.is(ws.messages.length, 1);
    const assigned = JSON.parse(ws.messages[0]);
    t.is(assigned.task.id, task.id);

    // drop the worker without ack -> task should be requeued
    queueManager.unregisterWorker(workerId);

    const state = queueManager.getState();
    t.is(state.queues[queue], 1);
    t.deepEqual(Object.keys(state.assignments), []);

    // prove it can be reassigned to a new worker and acked
    const ws2 = createWS();
    const cleanupId = 'cleanup';
    queueManager.ready(ws2, cleanupId, queue);

    t.is(ws2.messages.length, 1);
    const reassigned = JSON.parse(ws2.messages[0]);
    t.true(queueManager.acknowledge(cleanupId, reassigned.task.id));

    queueManager.unregisterWorker(cleanupId);
});

test.serial('heartbeat updates lastSeen', async (t) => {
    const ws = createWS();
    const workerId = 'w3';
    const queue = 'gamma';

    queueManager.ready(ws, workerId, queue);
    const before = queueManager.getState().workers[workerId].lastSeen;

    await new Promise((r) => setTimeout(r, 10));
    queueManager.heartbeat(workerId);
    const after = queueManager.getState().workers[workerId].lastSeen;

    t.true(after >= before);

    queueManager.unregisterWorker(workerId);
});

test.serial('expired workers are cleaned up and tasks requeued', async (t) => {
    const ws = createWS();
    const workerId = 'w5';
    const queue = 'epsilon';

    queueManager.setHeartbeatConfig({ sweepIntervalMs: 10, expiryMs: 20 });
    queueManager.ready(ws, workerId, queue);
    queueManager.enqueue(queue, { value: 3 });

    await new Promise((r) => setTimeout(r, 40));

    const state = queueManager.getState();
    t.is(state.workers[workerId], undefined);
    t.is(state.queues[queue], 1);

    const ws2 = createWS();
    const cleanupId = 'cleanup2';
    queueManager.ready(ws2, cleanupId, queue);
    const msg = JSON.parse(ws2.messages[0]);
    t.truthy(msg.task.id);
    t.true(queueManager.acknowledge(cleanupId, msg.task.id));
    queueManager.unregisterWorker(cleanupId);

    queueManager.setHeartbeatConfig({ sweepIntervalMs: 0 });
});



test.serial('task timeout requeues and logs', async (t) => {
    const ws = createWS();
    const workerId = 'w-timeout';
    const queue = 'epsilon';
    const logs = [];
    const origWarn = console.warn;
    console.warn = (m) => logs.push(m);

    queueManager.setTaskTimeout(20);
    queueManager.ready(ws, workerId, queue);
    const task = queueManager.enqueue(queue, { value: 3 });

    t.is(ws.messages.length, 1);
    await new Promise((r) => setTimeout(r, 40));

    const state = queueManager.getState();
    t.is(state.queues[queue], 1);
    t.true(logs.some((l) => l.includes(`task ${task.id} timed out`)));

    queueManager.unregisterWorker(workerId);
    queueManager.setTaskTimeout(10000);
    console.warn = origWarn;
});

test.serial('rate limit delays dispatch', async (t) => {
    const ws = createWS();
    const workerId = 'w4';
    const queue = 'delta';

    queueManager.setHeartbeatConfig({ sweepIntervalMs: 0 });

    queueManager.setRateLimit(50);
    queueManager.ready(ws, workerId, queue);
    const first = queueManager.enqueue(queue, { v: 1 });
    const second = queueManager.enqueue(queue, { v: 2 });

    t.is(ws.messages.length, 1);
    const msg1 = JSON.parse(ws.messages[0]);
    t.is(msg1.task.id, first.id);

    const start = Date.now();
    t.true(queueManager.acknowledge(workerId, msg1.task.id));
    queueManager.ready(ws, workerId, queue);
    await new Promise((r) => setTimeout(r, 10));
    t.is(ws.messages.length, 1);

    await new Promise((r) => setTimeout(r, 60));
    t.is(ws.messages.length, 2);
    const msg2 = JSON.parse(ws.messages[1]);
    t.is(msg2.task.id, second.id);
    t.true(Date.now() - start >= 50);

    queueManager.unregisterWorker(workerId);
    queueManager.setRateLimit(0);
});
