/**
 * Heartbeat client for posting process IDs to the heartbeat service.
 *
 * Other services can instantiate this class to automatically send their PID
 * to the service on a fixed interval. Uses the global `fetch` available in
 * modern Node.js versions, avoiding external dependencies.
 */
const HEARTBEAT_PORT = process.env.HEARTBEAT_PORT || 5000;
export class HeartbeatClient {
  constructor({
    url = `http://127.0.0.1:${HEARTBEAT_PORT}/heartbeat`,
    pid = process.pid,
    interval = 3000,
  } = {}) {
    this.url = url;
    this.pid = pid;
    this.interval = interval;
    this._timer = null;
  }

  async sendOnce() {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pid: this.pid }),
    });
    if (!res.ok) {
      throw new Error(`heartbeat failed with status ${res.status}`);
    }
    return res.json();
  }

  start() {
    if (this._timer) return;
    this._timer = setInterval(() => {
      this.sendOnce().catch(() => {
        /* ignore errors */
      });
    }, this.interval);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}
