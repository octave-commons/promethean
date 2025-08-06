/**
 * Heartbeat client for posting process IDs to the heartbeat service.
 *
 * Other services can instantiate this class to automatically send their PID
 * to the service on a fixed interval. Uses the global `fetch` available in
 * modern Node.js versions, avoiding external dependencies.
 */
const HEARTBEAT_PORT = process.env.HEARTBEAT_PORT || 5005;
export class HeartbeatClient {
  constructor({
    url = `http://127.0.0.1:${HEARTBEAT_PORT}/heartbeat`,
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
    if (!this.name) {
      throw new Error("name required for HeartbeatClient");
    }
  }

  async sendOnce() {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pid: this.pid, name: this.name }),
    });
    if (!res.ok) {
      throw new Error(`heartbeat failed with status ${res.status}`);
    }
    return res.json();
  }

  start() {
    if (this._timer) return;
    const tick = async () => {
      try {
        const data = await this.sendOnce();
        if (this.onHeartbeat) this.onHeartbeat(data);
      } catch {
        /* ignore errors */
      }
    };
    this._timer = setInterval(tick, this.interval);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}
