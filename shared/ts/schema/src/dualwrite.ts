import { EventBus, PublishOptions, EventRecord } from '@promethean/event/types.js';
import { SchemaRegistry } from './registry';

export function withDualWrite(bus: EventBus, reg: SchemaRegistry): EventBus {
    return {
        ...bus,
        async publish<T>(topic: string, payload: T, opts: PublishOptions = {}): Promise<EventRecord<T>> {
            const latest = reg.latest(topic);
            if (latest) {
                opts.headers = {
                    ...(opts.headers || {}),
                    'x-schema-version': String(latest.version),
                };
            }
            // optional: also write to versioned topic name e.g., foo.bar.v2
            if (latest && !String(topic).endsWith(`.v${latest.version}`)) {
                const vTopic = `${topic}.v${latest.version}`;
                // fire-and-forget extra write; ignore error to avoid breaking primary path
                bus.publish(vTopic, payload, { ...opts });
            }
            return bus.publish(topic, payload, opts);
        },
    };
}
