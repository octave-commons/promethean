// shared/js/brokerClient.js

import WebSocket from 'ws';
import { randomUUID } from 'crypto';

export class BrokerClient {
    constructor({
        url = 'ws://localhost:7000',
        id = randomUUID(),
        heartbeatInterval = Number(process.env.BROKER_HEARTBEAT_MS) || 30000,
    } = {}) {
        this.url = url;
        this.id = id;
        this.socket = null;
        this.handlers = new Map();
        this.onTask = null; // callback(task)
        this.messageQueue = [];
        this.reconnectAttempts = 0;
        this.shouldReconnect = true;
        this.reconnectTimer = null;
        this.heartbeatInterval = heartbeatInterval;
        this.heartbeatTimer = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.url);

            this.socket.on('open', () => {
                this.reconnectAttempts = 0;
                this.flushQueue();
                for (const topic of this.handlers.keys()) {
                    this.socket.send(JSON.stringify({ action: 'subscribe', topic }));
                }
                resolve();
            });

            this.socket.on('error', reject);
            this.socket.on('open', () => {
                this.heartbeatTimer = setInterval(() => this.heartbeat(), this.heartbeatInterval);
                resolve();
            });
            this.socket.on('error', reject);
            this.socket.on('close', () => {
                if (this.heartbeatTimer) {
                    clearInterval(this.heartbeatTimer);
                    this.heartbeatTimer = null;
                }
            });
            this.socket.on('message', (data) => {
                try {
                    const msg = JSON.parse(data);
                    if (msg.action === 'task-assigned' && this.onTask) {
                        this.onTask(msg.task);
                    } else if (msg.event) {
                        const handler = this.handlers.get(msg.event.type);
                        if (handler) handler(msg.event);
                    }
                } catch (err) {
                    console.warn('Invalid broker message', err);
                }
            });

            this.socket.on('close', () => {
                if (!this.shouldReconnect) return;
                const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
                this.reconnectAttempts += 1;
                this.reconnectTimer = setTimeout(() => this.connect(), delay);
            });
        });
    }

    subscribe(topic, handler) {
        this.handlers.set(topic, handler);
        this.send({ action: 'subscribe', topic });
    }

    unsubscribe(topic) {
        this.handlers.delete(topic);
        this.send({ action: 'unsubscribe', topic });
    }

    publish(type, payload, opts = {}) {
        const message = {
            type,
            payload,
            source: this.id,
            timestamp: new Date().toISOString(),
            ...opts,
        };

        this.send({ action: 'publish', message });
    }

    enqueue(queue, task) {
        this.send({ action: 'enqueue', queue, task });
    }

    ready(queue) {
        this.send({ action: 'ready', queue });
    }

    ack(taskId) {
        this.send({ action: 'ack', taskId });
    }

    heartbeat() {
        this.send({ action: 'heartbeat' });
    }

    onTaskReceived(callback) {
        this.onTask = callback;
    }

    send(obj) {
        const msg = JSON.stringify(obj);
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(msg);
        } else {
            this.messageQueue.push(msg);
        }
    }

    flushQueue() {
        while (
            this.messageQueue.length > 0 &&
            this.socket &&
            this.socket.readyState === WebSocket.OPEN
        ) {
            this.socket.send(this.messageQueue.shift());
        }
    }

    disconnect() {
        this.shouldReconnect = false;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
