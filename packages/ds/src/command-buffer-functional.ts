/**
 * Functional Command Buffer
 *
 * This file contains pure functional implementations of command buffering operations.
 * These were previously instance methods on CommandBuffer class.
 */

import { Entity, ComponentType, World } from './ecs.js';

// Command buffer state interface
export interface CommandBufferState {
    world: World;
    ops: Array<() => void>;
}

// Create initial command buffer state
export const createCommandBufferState = (world: World): CommandBufferState => ({
    world,
    ops: [],
});

// Create entity command
export const createEntityCommand = (
    state: CommandBufferState,
    init?: Record<string, unknown> | bigint,
): { entity: Entity; newState: CommandBufferState } => {
    let temp: Entity = -1;
    const newOp = () => {
        temp = state.world.createEntity(init);
    };

    return {
        entity: temp,
        newState: {
            ...state,
            ops: [...state.ops, newOp],
        },
    };
};

// Destroy entity command
export const destroyEntityCommand = (state: CommandBufferState, e: Entity): CommandBufferState => ({
    ...state,
    ops: [...state.ops, () => state.world.destroyEntity(e)],
});

// Add component command
export const addComponentCommand = <T>(
    state: CommandBufferState,
    e: Entity,
    ct: ComponentType<T>,
    v?: T,
): CommandBufferState => ({
    ...state,
    ops: [...state.ops, () => state.world.addComponent(e, ct, v)],
});

// Remove component command
export const removeComponentCommand = <T>(
    state: CommandBufferState,
    e: Entity,
    ct: ComponentType<T>,
): CommandBufferState => ({
    ...state,
    ops: [...state.ops, () => state.world.removeComponent(e, ct)],
});

// Set component command
export const setComponentCommand = <T>(
    state: CommandBufferState,
    e: Entity,
    ct: ComponentType<T>,
    v: T,
): CommandBufferState => ({
    ...state,
    ops: [...state.ops, () => state.world.set(e, ct, v)],
});

// Flush commands
export const flushCommands = (state: CommandBufferState): CommandBufferState => {
    for (const op of state.ops) op();
    return {
        ...state,
        ops: [],
    };
};

// Execute commands immediately (create entity with flush)
export const createEntityImmediate = (
    state: CommandBufferState,
    init?: Record<string, unknown> | bigint,
): { entity: Entity; newState: CommandBufferState } => {
    const { entity, newState: stateWithCommand } = createEntityCommand(state, init);
    const flushedState = flushCommands(stateWithCommand);
    return { entity, newState: flushedState };
};
