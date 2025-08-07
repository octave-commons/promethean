// queueManager.js

const queues = new Map(); // queueName -> [task]
const workers = new Map(); // workerId -> { ws, active: bool, lastSeen: Date }
const assignments = new Map(); // workerId -> { task, queue, timeoutId }

function registerWorker(ws, workerId) {
  workers.set(workerId, {
    ws,
    active: true,
    lastSeen: Date.now(),
  });
}

function unregisterWorker(workerId) {
  if (assignments.has(workerId)) {
    const { task, queue } = assignments.get(workerId);
    enqueue(queue, task); // Requeue unacknowledged task
    assignments.delete(workerId);
  }
  workers.delete(workerId);
}

function enqueue(queue, task) {
  if (!queues.has(queue)) queues.set(queue, []);
  queues.get(queue).push(task);
  dispatch(queue);
}

function dispatch(queue) {
  const q = queues.get(queue);
  if (!q || q.length === 0) return;

  for (const [workerId, { ws, active }] of workers.entries()) {
    if (!active || assignments.has(workerId)) continue;

    const task = q.shift();
    assignments.set(workerId, {
      task,
      queue,
      timeoutId: setTimeout(() => handleTimeout(workerId), 10000),
    });

    ws.send(JSON.stringify({ action: "task-assigned", task }));
    break;
  }
}

function acknowledge(workerId, taskId) {
  const assignment = assignments.get(workerId);
  if (!assignment) return false;
  if (assignment.task.id !== taskId) return false;

  clearTimeout(assignment.timeoutId);
  assignments.delete(workerId);
  dispatch(assignment.queue);
  return true;
}

function handleTimeout(workerId) {
  const assignment = assignments.get(workerId);
  if (!assignment) return;
  enqueue(assignment.queue, assignment.task);
  assignments.delete(workerId);
}

function heartbeat(workerId) {
  const worker = workers.get(workerId);
  if (worker) {
    worker.lastSeen = Date.now();
    worker.active = true;
  }
}

function getState() {
  return {
    queues: Object.fromEntries([...queues.entries()].map(([k, v]) => [k, v.length])),
    workers: Object.fromEntries(
      [...workers.entries()].map(([id, { active, lastSeen }]) => [id, { active, lastSeen }])
    ),
    assignments: Object.fromEntries(
      [...assignments.entries()].map(([id, { task, queue }]) => [id, { taskId: task.id, queue }])
    ),
  };
}

export const queueManager = {
  registerWorker,
  unregisterWorker,
  enqueue,
  acknowledge,
  heartbeat,
  getState,
};
