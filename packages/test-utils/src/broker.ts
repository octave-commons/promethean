export type MemoryBrokerEvent<TPayload = unknown> = {
    readonly type: string;
    readonly payload?: TPayload;
    readonly source?: string;
    readonly timestamp?: string;
    readonly correlationId?: string;
    readonly replyTo?: string;
};

export type MemoryBrokerClient = {
    readonly id: string;
    readonly onEvent: (event: MemoryBrokerEvent) => void;
};

type MemoryBrokerWorker = {
    readonly id: string;
    readonly assign: (task: MemoryBrokerTask) => void;
};

export type MemoryBrokerTask = {
    readonly id: string;
    readonly queue: string;
    readonly payload: unknown;
};

type MemoryBrokerLogEntry =
    | { action: 'subscribe'; data: { readonly client: string; readonly topic: string } }
    | { action: 'unsubscribe'; data: { readonly client: string; readonly topic: string } }
    | { action: 'publish'; data: { readonly type: string; readonly payload?: unknown; readonly source?: string } }
    | { action: 'ready'; data: { readonly queue: string; readonly client: string } }
    | { action: 'task-assigned'; data: { readonly queue: string; readonly taskId: string; readonly client: string } }
    | { action: 'enqueue'; data: { readonly queue: string; readonly task: MemoryBrokerTask } }
    | { action: string; data: unknown };

class MemoryBroker {
    private readonly topics = new Map<string, Set<MemoryBrokerClient>>();
    private _logs: MemoryBrokerLogEntry[] = [];
    private readonly ready = new Map<string, MemoryBrokerWorker[]>();
    private readonly pending = new Map<string, MemoryBrokerTask[]>();

    get logs(): ReadonlyArray<MemoryBrokerLogEntry> {
        return this._logs;
    }

    subscribe(client: MemoryBrokerClient, topic: string) {
        this._logs.push({ action: 'subscribe', data: { client: client.id, topic } });
        if (!this.topics.has(topic)) this.topics.set(topic, new Set());
        this.topics.get(topic)!.add(client);
    }

    unsubscribe(client: MemoryBrokerClient, topic: string) {
        const set = this.topics.get(topic);
        if (!set) return;
        set.delete(client);
        if (set.size === 0) this.topics.delete(topic);
        this._logs.push({ action: 'unsubscribe', data: { client: client.id, topic } });
    }

    publish(event: MemoryBrokerEvent) {
        this._logs.push({
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

    readyWorker(queue: string, worker: MemoryBrokerWorker) {
        this._logs.push({ action: 'ready', data: { queue, client: worker.id } });
        const pending = this.pending.get(queue);
        if (pending && pending.length > 0) {
            const task = pending.shift()!;
            try {
                worker.assign(task);
                this._logs.push({ action: 'task-assigned', data: { queue, taskId: task.id, client: worker.id } });
            } catch {
                // ignore handler errors from worker assignment
            }
            return;
        }
        const list = this.ready.get(queue) ?? [];
        list.push(worker);
        this.ready.set(queue, list);
    }

    enqueue(queue: string, payload: unknown) {
        const task: MemoryBrokerTask = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            queue,
            payload,
        };
        this._logs.push({ action: 'enqueue', data: { queue, task } });
        const list = this.ready.get(queue);
        if (list && list.length > 0) {
            const worker = list.shift()!;
            try {
                worker.assign(task);
                this._logs.push({ action: 'task-assigned', data: { queue, taskId: task.id, client: worker.id } });
            } catch {
                // ignore handler errors from worker assignment
            }
            return;
        }
        const q = this.pending.get(queue) ?? [];
        q.push(task);
        this.pending.set(queue, q);
    }

    reset() {
        this.topics.clear();
        this._logs = [];
        this.ready.clear();
        this.pending.clear();
    }

    record(action: string, data: unknown): void {
        this._logs.push({ action, data });
    }
}

const brokers = new Map<string, MemoryBroker>();

export function getMemoryBroker(namespace = 'default'): MemoryBroker {
    if (!brokers.has(namespace)) brokers.set(namespace, new MemoryBroker());
    return brokers.get(namespace)!;
}

export function resetMemoryBroker(namespace?: string): void {
    if (namespace) {
        brokers.get(namespace)?.reset();
        brokers.delete(namespace);
    } else {
        for (const b of brokers.values()) b.reset();
        brokers.clear();
    }
}
