// In-memory EventBus implementation that conforms to ./types
import type {
    EventBus,
    EventRecord,
    PublishOptions,
    SubscribeOptions,
    Handler,
    CursorPosition,
    EventStore,
    CursorStore,
    Ack,
    UUID,
} from './types.js';

// Import functional implementations
import {
    createInMemoryEventBusState,
    publishEvent,
    subscribeToTopic,
    acknowledgeEvent,
    negativeAcknowledgeEvent,
    getCursor as getCursorFn,
    setCursor as setCursorFn,
    InMemoryEventBusState,
} from './memory-functional.js';

/**
 * @deprecated Use the functional implementations from './memory-functional' instead.
 * This class is provided for backward compatibility and will be removed in a future version.
 */
export class InMemoryEventBus implements EventBus {
    private state: InMemoryEventBusState;

    constructor(store?: EventStore, cursors?: CursorStore) {
        this.state = createInMemoryEventBusState(store, cursors);
    }

    async publish<T>(topic: string, payload: T, opts: PublishOptions = {}): Promise<EventRecord<T>> {
        console.warn('InMemoryEventBus.publish is deprecated. Use publishEvent from memory-functional instead.');
        const result = await publishEvent(this.state, topic, payload, opts);
        this.state = result.newState;
        return result.event;
    }

    async subscribe(
        topic: string,
        group: string,
        handler: Handler,
        opts: Omit<SubscribeOptions, 'group'> = {},
    ): Promise<() => Promise<void>> {
        console.warn('InMemoryEventBus.subscribe is deprecated. Use subscribeToTopic from memory-functional instead.');
        const result = await subscribeToTopic(this.state, topic, group, handler, opts);
        this.state = result.newState;
        return result.unsubscribe;
    }

    async ack(topic: string, group: string, id: UUID): Promise<Ack> {
        console.warn('InMemoryEventBus.ack is deprecated. Use acknowledgeEvent from memory-functional instead.');
        const result = await acknowledgeEvent(this.state, topic, group, id);
        this.state = result.newState;
        return result.ack;
    }

    async nack(topic: string, group: string, id: UUID): Promise<Ack> {
        console.warn(
            'InMemoryEventBus.nack is deprecated. Use negativeAcknowledgeEvent from memory-functional instead.',
        );
        const result = await negativeAcknowledgeEvent(this.state, topic, group, id);
        this.state = result.newState;
        return result.ack;
    }

    async getCursor(topic: string, group: string): Promise<CursorPosition | null> {
        console.warn('InMemoryEventBus.getCursor is deprecated. Use getCursor from memory-functional instead.');
        return getCursorFn(this.state, topic, group);
    }

    async setCursor(topic: string, group: string, cursor: CursorPosition): Promise<void> {
        console.warn('InMemoryEventBus.setCursor is deprecated. Use setCursor from memory-functional instead.');
        this.state = await setCursorFn(this.state, topic, group, cursor);
    }
}
