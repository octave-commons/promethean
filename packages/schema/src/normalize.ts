import { SchemaRegistry } from './registry.js';
import { UpcastChain } from './upcast.js';
import type { DeliveryContext, EventRecord, SchemaEventBus, SubscribeOptions } from './types.js';

export type NormalizedHandler = (event: Readonly<EventRecord>, ctx: DeliveryContext) => Promise<void>;

export type SubscribeNormalizedParams<TBus extends SchemaEventBus = SchemaEventBus> = Readonly<{
    readonly bus: TBus;
    readonly topic: string;
    readonly group: string;
    readonly registry: SchemaRegistry;
    readonly upcast: UpcastChain;
    readonly handler: NormalizedHandler;
    readonly options?: SubscribeOptions;
}>;

export async function subscribeNormalized<TBus extends SchemaEventBus>(
    params: Readonly<SubscribeNormalizedParams<TBus>>,
): Promise<() => Promise<void>> {
    const { bus, topic, group, registry, upcast, handler, options } = params;
    const subscribeOptions: SubscribeOptions = options ?? {};
    return bus.subscribe(
        topic,
        group,
        async (event: Readonly<EventRecord>, ctx: DeliveryContext) => {
            const normalized = upcast.toLatest(topic, event, registry);
            const version = Number(normalized.headers?.['x-schema-version']);
            registry.validate(topic, normalized.payload, Number.isNaN(version) ? undefined : version);
            await handler(normalized, ctx);
        },
        subscribeOptions,
    );
}
