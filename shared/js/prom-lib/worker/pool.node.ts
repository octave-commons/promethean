import { Worker } from "node:worker_threads";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type Task = {
  id: number;
  mod: string;
  input: any;
  resolve: (v: any) => void;
  reject: (e: any) => void;
};

export class NodeWorkerPool {
  private size: number;
  private workers: Worker[] = [];
  private idle: Worker[] = [];
  private q: Task[] = [];
  private nextId = 1;
  private runnerURL: string;

  constructor(size = Math.max(1, os.cpus().length - 1)) {
    this.size = size;
    // runner script (ESM)
    const here = path.dirname(fileURLToPath(import.meta.url));
    this.runnerURL = pathToFileURL(path.join(here, "runner.node.js")).href;
    for (let i = 0; i < this.size; i++) this.spawn();
  }

  private spawn() {
    const w = new Worker(this.runnerURL, { type: "module" });
    w.on("message", (msg) => {
      const task = this._tasks.get(msg.id);
      if (!task) return;
      this._tasks.delete(msg.id);
      this.idle.push(w);
      if (msg.ok) task.resolve(msg.out);
      else task.reject(new Error(msg.err || "job failed"));
      this._drain();
    });
    w.on("error", (err) => {
      // fail any running task on this worker
      for (const [id, t] of this._tasks)
        if ((t as any).worker === w) {
          t.reject(err);
          this._tasks.delete(id);
        }
      // respawn
      this.workers = this.workers.filter((x) => x !== w);
      this.spawn();
    });
    (w as any)._busy = false;
    this.workers.push(w);
    this.idle.push(w);
  }

  private _tasks = new Map<number, Task>();

  private _drain() {
    while (this.q.length && this.idle.length) {
      const t = this.q.shift()!;
      const w = this.idle.pop()!;
      (t as any).worker = w;
      this._tasks.set(t.id, t);
      w.postMessage({ id: t.id, mod: t.mod, input: t.input });
    }
  }

  run(mod: string, input: any) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.q.push({ id, mod, input, resolve, reject });
      this._drain();
    });
  }

  async close() {
    for (const w of this.workers) w.terminate();
    this.workers.length = 0;
    this.idle.length = 0;
    this.q.length = 0;
    this._tasks.clear();
  }
}
