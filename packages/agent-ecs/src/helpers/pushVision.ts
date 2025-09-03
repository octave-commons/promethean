// SPDX-License-Identifier: GPL-3.0-only
// loose typing
import type { defineAgentComponents } from '../components';

export function pushVisionFrame(
    w: any,
    agent: any,
    C: ReturnType<typeof import('../components').defineAgentComponents>,
    ref: {
        type: 'url' | 'blob' | 'attachment';
        url?: string;
        data?: string;
        id?: string;
        mime?: string;
    },
) {
    const { VisionFrame, VisionRing } = C as ReturnType<typeof defineAgentComponents>;
    const e = w.createEntity();
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}.${Math.random()}`;
    w.addComponent(e, VisionFrame, { id, ts: Date.now(), ref });

    const ring = w.get(agent, VisionRing)!;
    const frames = [...ring.frames, e];
    const capped = frames.length > ring.capacity ? frames.slice(frames.length - ring.capacity) : frames;
    w.set(agent, VisionRing, { ...ring, frames: capped });
}
