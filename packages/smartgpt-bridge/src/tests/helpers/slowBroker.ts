export default class SlowBroker {
  opts: any;
  constructor(opts: any) {
    this.opts = opts;
  }
  async connect(): Promise<void> {
    /* no-op */
  }
  subscribe(): () => void {
    // Return unsubscribe noop
    return () => {};
  }
  enqueue(): void {
    // Intentionally do nothing: no replies -> trigger timeout
  }
  disconnect(): void {
    /* no-op */
  }
}
