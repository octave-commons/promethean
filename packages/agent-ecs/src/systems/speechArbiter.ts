import type { Entity, Query, World } from '@promethean/ds/ecs.js';

import type {
    AgentComponents,
    AudioRefComponent,
    BargeStateComponent,
    PlaybackQueueComponent,
    UtteranceComponent,
} from '../types.js';

const defaultQueue = (): PlaybackQueueComponent => ({ items: [] });

const defaultBargeState = (): BargeStateComponent => ({ speakingSince: null, paused: false });

const filterActiveUtterances = (
    world: World,
    components: AgentComponents,
    items: ReadonlyArray<Entity>,
): ReadonlyArray<Entity> =>
    items.filter((entity) => {
        const utterance = world.get(entity, components.Utterance);
        return !!utterance && (utterance.status === 'queued' || utterance.status === 'playing');
    });

type PendingUtteranceContext = {
    readonly world: World;
    readonly components: AgentComponents;
    readonly query: Query;
    readonly items: ReadonlyArray<Entity>;
    readonly minTurnId: number;
};

const includePendingUtterances = ({
    world,
    components,
    query,
    items,
    minTurnId,
}: PendingUtteranceContext): ReadonlyArray<Entity> => {
    const known = new Set(items);
    const appended: Entity[] = [...items];
    for (const [entity] of world.iter(query)) {
        if (known.has(entity)) continue;
        const utterance = world.get(entity, components.Utterance);
        if (!utterance) continue;
        if (utterance.status === 'queued' && utterance.turnId >= minTurnId) appended.push(entity);
    }
    return appended;
};

const comparePriority =
    (world: World, components: AgentComponents): ((a: Entity, b: Entity) => number) =>
    (a, b) => {
        const ua = world.get(a, components.Utterance);
        const ub = world.get(b, components.Utterance);
        return (ub?.priority ?? 0) - (ua?.priority ?? 0);
    };

const pickQueuedUtterance = (
    world: World,
    components: AgentComponents,
    ordered: ReadonlyArray<Entity>,
): Entity | undefined => ordered.find((entity) => world.get(entity, components.Utterance)?.status === 'queued');

const dequeueEntity = (items: ReadonlyArray<Entity>, entity: Entity): ReadonlyArray<Entity> =>
    items.filter((value) => value !== entity);

const markPlaying = (world: World, components: AgentComponents, entity: Entity): UtteranceComponent | undefined => {
    const utterance = world.get(entity, components.Utterance);
    if (!utterance) return undefined;
    const updated: UtteranceComponent = { ...utterance, status: 'playing' };
    world.set(entity, components.Utterance, updated);
    return updated;
};

const resetBargeState = (world: World, components: AgentComponents, agent: Entity): void => {
    const barge = world.get(agent, components.BargeState) ?? defaultBargeState();
    world.set(agent, components.BargeState, { ...barge, paused: false, speakingSince: null });
};

type PlayContext = {
    readonly world: World;
    readonly components: AgentComponents;
    readonly player: AudioRefComponent['player'];
    readonly entity: Entity;
    readonly token: number;
};

const playUtterance = ({ world, components, player, entity, token }: PlayContext): void => {
    const audioRes = world.get(entity, components.AudioRes);
    if (!audioRes) return;
    void audioRes.factory().then((resource) => {
        if (resource === undefined) return;
        const latest = world.get(entity, components.Utterance);
        if (!latest || latest.token !== token || latest.status === 'cancelled') return;
        try {
            void player.play(resource);
        } catch (error) {
            console.warn('[arbiter] failed to play resource', error);
        }
    });
};

export const SpeechArbiterSystem = (world: World, components: AgentComponents) => {
    const agentQuery = world.makeQuery({
        all: [components.Turn, components.PlaybackQ, components.AudioRef, components.Policy],
    });
    const utteranceQuery = world.makeQuery({ all: [components.Utterance] });

    return async (_dt: number): Promise<void> => {
        for (const [agent] of world.iter(agentQuery)) {
            const turnId = world.get(agent, components.Turn)?.id ?? 0;
            const queue = world.get(agent, components.PlaybackQ) ?? defaultQueue();
            const filtered = filterActiveUtterances(world, components, queue.items);
            const augmented = includePendingUtterances({
                world,
                components,
                query: utteranceQuery,
                items: filtered,
                minTurnId: turnId,
            });
            const player = world.get(agent, components.AudioRef)?.player;
            if (!player) continue;

            const queueChanged =
                augmented.length !== queue.items.length ||
                augmented.some((value, index) => value !== queue.items[index]);

            const ordered = [...augmented].sort(comparePriority(world, components));
            const nextEntity = pickQueuedUtterance(world, components, ordered);
            if (!nextEntity) {
                if (queueChanged) world.set(agent, components.PlaybackQ, { items: augmented });
                continue;
            }

            const reduced = dequeueEntity(augmented, nextEntity);
            const nowPlaying = markPlaying(world, components, nextEntity);
            if (nowPlaying) {
                resetBargeState(world, components, agent);
                playUtterance({ world, components, player, entity: nextEntity, token: nowPlaying.token });
            }

            world.set(agent, components.PlaybackQ, { items: reduced });
        }
    };
};
