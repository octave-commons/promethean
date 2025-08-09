export class BrowserWorkerPool {
  private factories: Record<string, () => Worker>;
  constructor(factories: Record<string, () => Worker>) {
    this.factories = factories;
  }
  run(name: string, input: any) {
    return new Promise((resolve, reject) => {
      const w = this.factories[name]();
      const onMsg = (ev: MessageEvent) => {
        w.removeEventListener("message", onMsg);
        w.terminate();
        resolve(ev.data);
      };
      const onErr = (e: ErrorEvent) => {
        w.removeEventListener("error", onErr);
        w.terminate();
        reject(e.error || new Error(e.message));
      };
      w.addEventListener("message", onMsg);
      w.addEventListener("error", onErr);
      w.postMessage(input);
    });
  }
  async close() {}
}
