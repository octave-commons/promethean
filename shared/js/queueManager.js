// queueManager.js

import { randomUUID } from 'crypto';

const queues = new Map(); // queueName -> [task]
const workers = new Map(); // workerId -> { ws, queue, active, lastSeen }
const assignments = new Map(); // workerId -> { task, queue, timeoutId }
let rateLimitMs = 0; // delay between task dispatches per queue
const lastDispatch = new Map(); // queue -> timestamp
let taskTimeoutMs = 10000; // ms before unacked task is requeued

function ready(ws, workerId, queue) {
    workers.set(workerId, {
        ws,
        queue,
        active: true,
        lastSeen: Date.now(),
    });
    dispatch(queue);
}

function unregisterWorker(workerId) {
    if (assignments.has(workerId)) {
        const { task, queue } = assignments.get(workerId);
        enqueue(queue, task.payload); // Requeue unacknowledged task
        assignments.delete(workerId);
    }
    workers.delete(workerId);
}

function enqueue(queue, payload) {
    const task = {
        id: randomUUID(),
        queue,
        payload,
        createdAt: new Date().toISOString(),
        attempts: 0,
    };
    if (!queues.has(queue)) queues.set(queue, []);
    queues.get(queue).push(task);
    dispatch(queue);
    return task;
}

function dispatch(queue) {
    const q = queues.get(queue);
    if (!q || q.length === 0) return;
    const now = Date.now();
    const last = lastDispatch.get(queue) || 0;
    if (rateLimitMs > 0 && now - last < rateLimitMs) {
        setTimeout(() => dispatch(queue), rateLimitMs - (now - last));
        return;
    }

    for (const [workerId, worker] of workers.entries()) {
        if (!worker.active || worker.queue !== queue || assignments.has(workerId)) continue;

        const task = q.shift();
        task.attempts += 1;
        assignments.set(workerId, {
            task,
            queue,
            timeoutId: setTimeout(() => handleTimeout(workerId), taskTimeoutMs),
        });

        worker.active = false;
        worker.ws.send(JSON.stringify({ action: 'task-assigned', task }));
        console.log(`task ${task.id} dispatched to ${workerId} on ${queue}`);
        lastDispatch.set(queue, Date.now());
        break;
    }
}

function acknowledge(workerId, taskId) {
    const assignment = assignments.get(workerId);
    if (!assignment || assignment.task.id !== taskId) return false;

    clearTimeout(assignment.timeoutId);
    assignments.delete(workerId);
    console.log(`task ${taskId} acknowledged by ${workerId} on ${assignment.queue}`);
    dispatch(assignment.queue);
    return true;
}

function handleTimeout(workerId) {
    const assignment = assignments.get(workerId);
    if (!assignment) return;
    console.warn(`task ${assignment.task.id} timed out for ${workerId} on ${assignment.queue}`);
    enqueue(assignment.queue, assignment.task.payload);
    assignments.delete(workerId);
}

function heartbeat(workerId) {
    const worker = workers.get(workerId);
    if (worker) {
        worker.lastSeen = Date.now();
    }
}

function getState() {
    return {
        queues: Object.fromEntries([...queues.entries()].map(([k, v]) => [k, v.length])),
        workers: Object.fromEntries(
            [...workers.entries()].map(([id, { active, lastSeen, queue }]) => [
                id,
                { active, lastSeen, queue },
            ]),
        ),
        assignments: Object.fromEntries(
            [...assignments.entries()].map(([id, { task, queue }]) => [
                id,
                { taskId: task.id, queue },
            ]),
        ),
    };
}

export const queueManager = {
    ready,
    unregisterWorker,
    enqueue,
    acknowledge,
    heartbeat,
    getState,
    setRateLimit,
    setTaskTimeout,
};

function setRateLimit(ms) {
    rateLimitMs = Math.max(0, Number(ms) || 0);
    lastDispatch.clear();
}

function setTaskTimeout(ms) {
    taskTimeoutMs = Math.max(1, Number(ms) || 1);
}
