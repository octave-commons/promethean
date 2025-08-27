import test from 'ava';
import { getMemoryBroker } from '@shared/ts/dist/test-utils/broker.js';
import { startKanbanProcessor } from '../src/index.js';

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

test('enqueues processing tasks for board and file changes (memory broker)', async (t) => {
    process.env.BROKER_URL = 'memory://kanban';
    const broker = getMemoryBroker('kanban');
    const svc = startKanbanProcessor(process.cwd());

    await wait(50);
    // Simulate incoming events
    broker.publish({ type: 'file-watcher-board-change' });
    broker.publish({ type: 'file-watcher-task-change' });
    await wait(100);

    t.truthy(broker.logs.find((m) => m.action === 'ready' && m.data.queue));
    t.truthy(broker.logs.find((m) => m.action === 'enqueue' && m.data.task?.kind === 'board'));
    t.truthy(broker.logs.find((m) => m.action === 'enqueue' && m.data.task?.kind === 'tasks'));

    await svc.close();
});
