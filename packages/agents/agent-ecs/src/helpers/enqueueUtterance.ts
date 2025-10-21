import type { Entity, World } from '@promethean/ds/ecs.js';

import type {
    AgentComponents,
    AudioResourceFactory,
    BargeIn,
    PlaybackQueueComponent,
    UtteranceComponent,
} from '../types.js';

export type EnqueueUtteranceOptions = {
    readonly id?: string;
    readonly priority?: number;
    readonly group?: string;
    readonly bargeIn?: BargeIn;
    readonly factory: AudioResourceFactory;
};

const EMPTY_QUEUE: PlaybackQueueComponent = { items: [] };

type NormalizedOptions = {
    readonly id?: string;
    readonly priority: number;
    readonly group?: string;
    readonly bargeIn: BargeIn;
    readonly factory: AudioResourceFactory;
};

const createUtterance = (turnId: number, options: NormalizedOptions): UtteranceComponent => ({
    id: options.id ?? globalThis.crypto?.randomUUID?.() ?? `${Date.now()}.${Math.random()}`,
    turnId,
    priority: options.priority,
    group: options.group,
    bargeIn: options.bargeIn,
    status: 'queued',
    token: Math.floor(Math.random() * 1_000_000_000),
});

export const enqueueUtterance = (
    world: World,
    agent: Entity,
    components: AgentComponents,
    rawOptions: EnqueueUtteranceOptions,
): void => {
    const { Turn, PlaybackQ, Utterance, AudioRes, Policy } = components;
    const policy = world.get(agent, Policy);
    const defaultBargeIn: BargeIn = policy?.defaultBargeIn ?? 'pause';
    const options: NormalizedOptions = {
        id: rawOptions.id,
        priority: rawOptions.priority ?? 1,
        group: rawOptions.group,
        bargeIn: rawOptions.bargeIn ?? defaultBargeIn,
        factory: rawOptions.factory,
    };

    if (typeof options.factory !== 'function') {
        console.warn('[enqueueUtterance] missing factory; dropping', { rawOptions });
        return;
    }

    const currentTurn = world.get(agent, Turn)?.id ?? 0;
    const queue: PlaybackQueueComponent = world.get(agent, PlaybackQ) ?? EMPTY_QUEUE;

    if (options.group) {
        queue.items.forEach((utteranceEntity) => {
            const utterance = world.get(utteranceEntity, Utterance);
            if (
                utterance &&
                utterance.group === options.group &&
                utterance.status === 'queued' &&
                utterance.priority <= options.priority
            ) {
                const cancelled: UtteranceComponent = { ...utterance, status: 'cancelled' };
                world.set(utteranceEntity, Utterance, cancelled);
            }
        });
    }

    const utteranceEntity = world.createEntity();
    const utterance = createUtterance(currentTurn, options);
    world.addComponent(utteranceEntity, Utterance, utterance);
    world.addComponent(utteranceEntity, AudioRes, { factory: options.factory });

    const latestQueue: PlaybackQueueComponent = world.get(agent, PlaybackQ) ?? EMPTY_QUEUE;
    const nextItems: ReadonlyArray<Entity> = [...latestQueue.items, utteranceEntity];
    world.set(agent, PlaybackQ, { items: nextItems });
};
