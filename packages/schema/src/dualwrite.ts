import { SchemaRegistry } from './registry.js';
import type { PublishOptions, SchemaEventBus } from './types.js';

const withSchemaHeaders = (opts: Readonly<PublishOptions>, version: number): PublishOptions => {
    const headers = {
        ...(opts.headers ?? {}),
        'x-schema-version': String(version),
    };

    return {
        ...opts,
        headers,
    };
};

export function withDualWrite<TBus extends SchemaEventBus>(bus: Readonly<TBus>, reg: SchemaRegistry): TBus {
    const publish: SchemaEventBus['publish'] = async (...args: Readonly<Parameters<SchemaEventBus['publish']>>) => {
        const [topic, payload, options] = args;
        const latest = reg.latest(topic);
        const baseOptions: PublishOptions = options ? { ...options } : {};
        const nextOptions = latest ? withSchemaHeaders(baseOptions, latest.version) : baseOptions;

        if (latest && !topic.endsWith(`.v${latest.version}`)) {
            const versionedTopic = `${topic}.v${latest.version}`;
            const versionedOptions: PublishOptions = {
                ...nextOptions,
                ...(nextOptions.headers ? { headers: { ...nextOptions.headers } } : {}),
            };
            void bus.publish(versionedTopic, payload, versionedOptions);
        }

        return bus.publish(topic, payload, nextOptions);
    };

    return {
        ...bus,
        publish,
    } as TBus;
}
