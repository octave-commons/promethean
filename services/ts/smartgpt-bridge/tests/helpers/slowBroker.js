export default class SlowBroker {
    constructor(opts) {
        this.opts = opts;
    }
    async connect() {
        /* no-op */
    }
    subscribe() {
        // Return unsubscribe noop
        return () => {};
    }
    enqueue() {
        // Intentionally do nothing: no replies -> trigger timeout
    }
    disconnect() {
        /* no-op */
    }
}
