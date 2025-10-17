import type { Entity, World } from '@promethean/ds/ecs.js';

import type { AgentComponents, RawVadComponent, VadComponent } from '../types.js';

const defaultRawVad = (): RawVadComponent => ({ level: 0, ts: 0 });

const defaultVad = (): VadComponent => ({
    active: false,
    lastTrueAt: 0,
    lastFalseAt: 0,
    attackMs: 120,
    releaseMs: 250,
    hangMs: 800,
    threshold: 0.5,
    _prevActive: false,
});

const toActive = (vad: VadComponent, now: number): VadComponent => ({
    ...vad,
    active: true,
    lastTrueAt: now,
    _prevActive: vad.active,
});

const toInactive = (vad: VadComponent, now: number): VadComponent => ({
    ...vad,
    active: false,
    lastFalseAt: now,
    _prevActive: vad.active,
});

const applyRawLevel = (vad: VadComponent, raw: RawVadComponent, now: number): VadComponent => {
    const rawActive = raw.level >= vad.threshold;
    if (rawActive) {
        if (!vad.active && now - vad.lastFalseAt >= vad.attackMs) {
            return toActive(vad, now);
        }
        return { ...vad, lastTrueAt: now, _prevActive: vad.active };
    }
    if (vad.active && now - vad.lastTrueAt >= vad.releaseMs) {
        return toInactive(vad, now);
    }
    return { ...vad, lastFalseAt: now, _prevActive: vad.active };
};

const applyHang = (vad: VadComponent, now: number): VadComponent => {
    if (vad.active && now - vad.lastTrueAt > vad.hangMs) {
        return toInactive(vad, now);
    }
    return vad;
};

const updateVad = (raw: RawVadComponent, previous: VadComponent, now: number): VadComponent =>
    applyHang(applyRawLevel(previous, raw, now), now);

const updateEntity = (world: World, components: AgentComponents, entity: Entity): void => {
    const { RawVAD, VAD } = components;
    const raw = world.get(entity, RawVAD) ?? defaultRawVad();
    const current = world.get(entity, VAD) ?? defaultVad();
    const next = updateVad(raw, current, Date.now());
    world.set(entity, VAD, next);
};

export const VADUpdateSystem = (world: World, components: AgentComponents) => {
    const query = world.makeQuery({ all: [components.RawVAD, components.VAD] });
    return (_dt: number): void => {
        for (const [entity] of world.iter(query)) updateEntity(world, components, entity);
    };
};
