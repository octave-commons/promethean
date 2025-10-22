import type { Entity, World } from '@promethean/ds/ecs.js';

import type { AgentComponents, VisionFrameComponent, VisionFrameRef, VisionRingComponent } from '../types.js';

const createVisionFrame = (ref: VisionFrameRef): VisionFrameComponent => ({
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}.${Math.random()}`,
    ts: Date.now(),
    ref,
});

const appendFrame = (ring: VisionRingComponent, frameEntity: Entity): VisionRingComponent => {
    const frames = [...ring.frames, frameEntity];
    const overflow = frames.length - ring.capacity;
    const trimmed = overflow > 0 ? frames.slice(overflow) : frames;
    return { ...ring, frames: trimmed };
};

export const pushVisionFrame = (
    world: World,
    agent: Entity,
    components: AgentComponents,
    ref: VisionFrameRef,
): void => {
    const { VisionFrame, VisionRing } = components;
    const frameEntity = world.createEntity();
    world.addComponent(frameEntity, VisionFrame, createVisionFrame(ref));

    const ring = world.get(agent, VisionRing);
    if (!ring) return;

    const nextRing = appendFrame(ring, frameEntity);
    world.set(agent, VisionRing, nextRing);
};
