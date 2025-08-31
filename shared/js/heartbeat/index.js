/**
 * Heartbeat client for publishing process IDs via the message broker.
 *
 * Other services can instantiate this class to automatically send their PID
 * to the broker on a fixed interval. Uses the `ws` WebSocket implementation
 * available in the repository.
 */
import { BrokerClient } from '@shared/js/brokerClient.js';

const BROKER_PORT = process.env.BROKER_PORT || 7000;

export class HeartbeatClient {
    constructor({
        url = `ws://127.0.0.1:${BROKER_PORT}`,
        pid = process.pid,
        name = process.env.name,
        interval = 3000,
        onHeartbeat,
        maxMisses = Number(process.env.HEARTBEAT_MAX_MISSES || 5),
        fatalOnMiss = String(process.env.HEARTBEAT_FATAL_ON_MISS || 'true').toLowerCase() ===
            'true',
    } = {}) {
        this.url = url;
        this.pid = pid;
        this.name = name;
        this.interval = interval;
        this.onHeartbeat = onHeartbeat;
        this.maxMisses = maxMisses;
        this.fatalOnMiss = fatalOnMiss;
        this._timer = null;
        this._broker = null;
        this._misses = 0;
        this._lastOk = 0;
        if (!this.name) {
            throw new Error('name required for HeartbeatClient');
        }
    }

    async _ensure() {
        if (this._broker && this._broker.socket && this._broker.socket.readyState === 1) return;
        this._broker = null;
        this._broker = new BrokerClient({ url: this.url });
        await this._broker.connect();
    }

    async sendOnce() {
        await this._ensure();
        await this._broker.publish('heartbeat', {
            pid: this.pid,
            name: this.name,
        });
        if (this.onHeartbeat) this.onHeartbeat({ pid: this.pid, name: this.name });
        this._misses = 0;
        this._lastOk = Date.now();
    }

    start() {
        if (this._timer) return;
        const tick = () => {
            this.sendOnce().catch(() => {
                this._misses++;
                if (this.fatalOnMiss && this._misses >= this.maxMisses) {
                    // exit quickly; allow external supervisors to restart
                    try {
                        process.kill(process.pid, 'SIGTERM');
                    } catch {}
                    process.exit(1);
                }
            });
        };
        this._timer = setInterval(tick, this.interval);
    }

    stop() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
        if (this._broker) {
            try {
                this._broker.socket?.close();
            } catch {}
            this._broker = null;
        }
    }
}
