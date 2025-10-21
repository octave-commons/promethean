import type { World } from '@promethean/ds/ecs.js';

import type { AgentComponents, TurnComponent, VadComponent } from '../types.js';

const defaultTurn = (): TurnComponent => ({ id: 0 });

const defaultVadState = (): VadComponent => ({
    active: false,
    lastTrueAt: 0,
    lastFalseAt: 0,
    attackMs: 120,
    releaseMs: 250,
    hangMs: 800,
    threshold: 0.5,
    _prevActive: false,
});

const incrementTurn = (turn: TurnComponent): TurnComponent => ({ ...turn, id: turn.id + 1 });

export const TurnDetectionSystem = (world: World, components: AgentComponents) => {
    const { Turn, VAD, TranscriptFinal } = components;
    const vadQuery = world.makeQuery({ all: [Turn, VAD] });
    const transcriptQuery = world.makeQuery({ changed: [TranscriptFinal], all: [Turn, TranscriptFinal] });

    return (_dt: number): void => {
        for (const [entity] of world.iter(vadQuery)) {
            const turn = world.get(entity, Turn) ?? defaultTurn();
            const vad = world.get(entity, VAD) ?? defaultVadState();
            if (!vad._prevActive && vad.active) world.set(entity, Turn, incrementTurn(turn));
        }

        for (const [entity] of world.iter(transcriptQuery)) {
            const turn = world.get(entity, Turn) ?? defaultTurn();
            world.set(entity, Turn, incrementTurn(turn));
        }
    };
};
