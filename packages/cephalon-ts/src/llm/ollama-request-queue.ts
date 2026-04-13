type OllamaTask = {
  key: string;
  run: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

type OllamaQueueOptions = {
  maxParallel?: number;
  maxBacklog?: number;
};

function envInt(name: string, fallback: number, min = 1, max = 1_048_576): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export class OllamaRequestQueue {
  private maxParallel: number;
  private maxBacklog: number;
  private activeGlobal = 0;
  private activeByKey = new Map<string, number>();
  private queue: OllamaTask[] = [];

  constructor(options: OllamaQueueOptions = {}) {
    const defaultMaxParallel = envInt("CEPHALON_OLLAMA_QUEUE_MAX_PARALLEL", 8, 1, 128);
    const defaultMaxBacklog = envInt("CEPHALON_OLLAMA_QUEUE_MAX_BACKLOG", 8192, 1, 1_000_000);

    this.maxParallel = options.maxParallel ?? defaultMaxParallel;
    this.maxBacklog = options.maxBacklog ?? defaultMaxBacklog;
  }

  enqueue<T>(key: string, run: () => Promise<T>): Promise<T> {
    const normalizedKey = key.trim() || "default";

    if (this.queue.length >= this.maxBacklog) {
      return Promise.reject(new Error(`Ollama request queue overflow (${this.maxBacklog})`));
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        key: normalizedKey,
        run: run as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.drain();
    });
  }

  private drain(): void {
    while (this.activeGlobal < this.maxParallel) {
      const nextIndex = this.queue.findIndex(
        (task) => (this.activeByKey.get(task.key) ?? 0) < 1,
      );
      if (nextIndex === -1) return;
      const task = this.queue.splice(nextIndex, 1)[0];
      this.start(task);
    }
  }

  private start(task: OllamaTask): void {
    this.activeGlobal += 1;
    this.activeByKey.set(task.key, (this.activeByKey.get(task.key) ?? 0) + 1);

    Promise.resolve()
      .then(task.run)
      .then(task.resolve)
      .catch(task.reject)
      .finally(() => {
        this.activeGlobal -= 1;
        const current = (this.activeByKey.get(task.key) ?? 1) - 1;
        if (current <= 0) {
          this.activeByKey.delete(task.key);
        } else {
          this.activeByKey.set(task.key, current);
        }
        this.drain();
      });
  }
}

export const ollamaRequestQueue = new OllamaRequestQueue();
