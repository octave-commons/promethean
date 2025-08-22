import { DualSink } from './DualSink.js';

class DualSinkRegistry {
    constructor() {
        this.sinks = {};
    }

    register(name, schema, metadataBuilder) {
        if (this.sinks[name]) {
            throw new Error(`Sink already registered: ${name}`);
        }
        this.sinks[name] = new DualSink(name, schema, metadataBuilder);
        return this.sinks[name];
    }

    get(name) {
        const sink = this.sinks[name];
        if (!sink) throw new Error(`Sink not found: ${name}`);
        return sink;
    }

    list() {
        return Object.keys(this.sinks);
    }
}

export const dualSinkRegistry = new DualSinkRegistry();
