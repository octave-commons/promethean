// SPDX-License-Identifier: GPL-3.0-only
type Event = {
    type: string;
    payload?: any;
    source?: string;
    timestamp?: string;
    correlationId?: string;
    replyTo?: string;
};

export interface MemoryBrokerClient {
    id: string;
    onEvent: (evt: Event) => void;
}

class MemoryBroker {
    topics = new Map<string, Set<MemoryBrokerClient>>();
    logs: Array<{ action: string; data: any }> = [];
    ready = new Map<string, Array<{ id: string; assign: (task: any) => void }>>();
    pending = new Map<string, Array<{ id: string; queue: string; payload: any }>>();

    subscribe(client: MemoryBrokerClient, topic: string) {
        this.logs.push({ action: 'subscribe', data: { client: client.id, topic } });
        if (!this.topics.has(topic)) this.topics.set(topic, new Set());
        this.topics.get(topic)!.add(client);
    }

    unsubscribe(client: MemoryBrokerClient, topic: string) {
        const set = this.topics.get(topic);
        if (!set) return;
        set.delete(client);
        if (set.size === 0) this.topics.delete(topic);
        this.logs.push({ action: 'unsubscribe', data: { client: client.id, topic } });
    }

    publish(event: Event) {
        this.logs.push({
            action: 'publish',
            data: { type: event.type, payload: event.payload, source: event.source },
        });
        const subs = this.topics.get(event.type);
        if (!subs) return;
        for (const client of subs) {
            try {
                client.onEvent(event);
            } catch {
                // ignore handler errors
            }
        }
    }

    readyWorker(queue: string, worker: { id: string; assign: (task: any) => void }) {
        this.logs.push({ action: 'ready', data: { queue, client: worker.id } });
        const pending = this.pending.get(queue);
        if (pending && pending.length > 0) {
            const task = pending.shift()!;
            try {
                worker.assign(task);
                this.logs.push({ action: 'task-assigned', data: { queue, taskId: task.id, client: worker.id } });
            } catch {}
            return;
        }
        const list = this.ready.get(queue) || [];
        list.push(worker);
        this.ready.set(queue, list);
    }

    enqueue(queue: string, payload: any) {
        const task = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, queue, payload };
        this.logs.push({ action: 'enqueue', data: { queue, task } });
        const list = this.ready.get(queue);
        if (list && list.length > 0) {
            const worker = list.shift()!;
            try {
                worker.assign(task);
                this.logs.push({ action: 'task-assigned', data: { queue, taskId: task.id, client: worker.id } });
            } catch {}
            return;
        }
        const q = this.pending.get(queue) || [];
        q.push(task);
        this.pending.set(queue, q);
    }

    reset() {
        this.topics.clear();
        this.logs = [];
        this.ready.clear();
        this.pending.clear();
    }

    record(action: string, data: any) {
        this.logs.push({ action, data });
    }
}

const brokers = new Map<string, MemoryBroker>();

export function getMemoryBroker(namespace = 'default'): MemoryBroker {
    if (!brokers.has(namespace)) brokers.set(namespace, new MemoryBroker());
    return brokers.get(namespace)!;
}

export function resetMemoryBroker(namespace?: string) {
    if (namespace) {
        brokers.get(namespace)?.reset();
        brokers.delete(namespace);
    } else {
        for (const b of brokers.values()) b.reset();
        brokers.clear();
    }
}
