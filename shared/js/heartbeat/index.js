/**
 * Heartbeat client for publishing process IDs via the message broker.
 *
 * Other services can instantiate this class to automatically send their PID
 * to the broker on a fixed interval. Uses the `ws` WebSocket implementation
 * available in the repository.
 */
import BrokerClient from "@shared/js/brokerClient.js";

const BROKER_PORT = process.env.BROKER_PORT || 7000;

export class HeartbeatClient {
  constructor({
    url = `ws://127.0.0.1:${BROKER_PORT}`,
    pid = process.pid,
    name = process.env.name,
    interval = 3000,
    onHeartbeat,
  } = {}) {
    this.url = url;
    this.pid = pid;
    this.name = name;
    this.interval = interval;
    this.onHeartbeat = onHeartbeat;
    this._timer = null;
    this._broker = null;
    if (!this.name) {
      throw new Error("name required for HeartbeatClient");
    }
  }

  async _ensure() {
    if (this._broker) return;
    this._broker = new BrokerClient({ url: this.url });
    await this._broker.connect();
  }

  async sendOnce() {
    await this._ensure();
    await this._broker.publish("heartbeat", {
      pid: this.pid,
      name: this.name,
    });
    if (this.onHeartbeat) this.onHeartbeat({ pid: this.pid, name: this.name });
  }

  start() {
    if (this._timer) return;
    const tick = () => {
      this.sendOnce().catch(() => {});
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
