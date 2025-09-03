// loosen typing to avoid cross-package type coupling
import { SchemaRegistry } from './registry.js';
import { UpcastChain } from './upcast.js';

export async function subscribeNormalized(
    bus: any,
    topic: string,
    group: string,
    reg: SchemaRegistry,
    up: UpcastChain,
    handler: (e: any) => Promise<void>,
    opts: any = {},
) {
    return bus.subscribe(
        topic,
        group,
        async (e: any) => {
            const norm = up.toLatest(topic, e, reg);
            reg.validate(topic, norm.payload, Number(norm.headers?.['x-schema-version']));
            await handler(norm);
        },
        opts,
    );
}
