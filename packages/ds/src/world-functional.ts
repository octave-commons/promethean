/**
 * Functional ECS World Operations
 *
 * This file contains pure functional implementations of ECS World operations.
 * These were previously instance methods on the World class.
 */

import { World, type Entity, type ComponentId, type ComponentType, type ComponentSpec, type Query } from './ecs.js';

// Functional world operations that work with World instances
export const createWorld = (): World => {
    // Import World class dynamically to avoid circular dependencies
    const { World } = require('./ecs.js');
    return new World();
};

export const defineComponentFunctional = <T>(world: World, spec: ComponentSpec<T>): ComponentType<T> => {
    console.warn('defineComponentFunctional is deprecated. Use world.defineComponent instead.');
    return world.defineComponent(spec);
};

export const createEntityFunctional = (world: World, init?: Record<ComponentId, unknown> | bigint): Entity => {
    console.warn('createEntityFunctional is deprecated. Use world.createEntity instead.');
    return world.createEntity(init);
};

export const destroyEntityFunctional = (world: World, entity: Entity): void => {
    console.warn('destroyEntityFunctional is deprecated. Use world.destroyEntity instead.');
    world.destroyEntity(entity);
};

export const isAliveFunctional = (world: World, entity: Entity): boolean => {
    console.warn('isAliveFunctional is deprecated. Use world.isAlive instead.');
    return world.isAlive(entity);
};

export const addComponentFunctional = <T>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
    value?: T,
): void => {
    console.warn('addComponentFunctional is deprecated. Use world.addComponent instead.');
    world.addComponent(entity, componentType, value);
};

export const removeComponentFunctional = <T>(world: World, entity: Entity, componentType: ComponentType<T>): void => {
    console.warn('removeComponentFunctional is deprecated. Use world.removeComponent instead.');
    world.removeComponent(entity, componentType);
};

export const getComponentFunctional = <T>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
): T | undefined => {
    console.warn('getComponentFunctional is deprecated. Use world.get instead.');
    return world.get(entity, componentType);
};

export const setComponentFunctional = <T>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
    value: T,
): void => {
    console.warn('setComponentFunctional is deprecated. Use world.set instead.');
    world.set(entity, componentType, value);
};

export const setIfChangedFunctional = <T>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
    value: T,
): void => {
    console.warn('setIfChangedFunctional is deprecated. Use world.setIfChanged instead.');
    world.setIfChanged(entity, componentType, value);
};

export const hasComponentFunctional = (world: World, entity: Entity, componentType: ComponentType<any>): boolean => {
    console.warn('hasComponentFunctional is deprecated. Use world.has instead.');
    return world.has(entity, componentType);
};

export const makeQueryFunctional = (
    world: World,
    opts: {
        all?: ComponentType<any>[];
        any?: ComponentType<any>[];
        none?: ComponentType<any>[];
        changed?: ComponentType<any>[];
    },
): Query => {
    console.warn('makeQueryFunctional is deprecated. Use world.makeQuery instead.');
    return world.makeQuery(opts);
};

export const iterateQueryFunctional = function* <T1 = unknown, T2 = unknown, T3 = unknown>(
    world: World,
    query: Query,
    c1?: ComponentType<T1>,
    c2?: ComponentType<T2>,
    c3?: ComponentType<T3>,
): IterableIterator<[Entity, (ct: ComponentType<any>) => any, T1?, T2?, T3?]> {
    console.warn('iterateQueryFunctional is deprecated. Use world.iter instead.');
    return world.iter(query, c1, c2, c3);
};

export const beginTickFunctional = (world: World): any => {
    console.warn('beginTickFunctional is deprecated. Use world.beginTick instead.');
    return world.beginTick();
};

export const endTickFunctional = (world: World): void => {
    console.warn('endTickFunctional is deprecated. Use world.endTick instead.');
    world.endTick();
};

// Higher-level functional operations
export const withEntity = <T>(world: World, entity: Entity, operation: (entity: Entity) => T): T => {
    if (!world.isAlive(entity)) {
        throw new Error(`Entity ${entity} is not alive`);
    }
    return operation(entity);
};

export const withComponent = <T, R>(
    world: World,
    entity: Entity,
    componentType: ComponentType<T>,
    operation: (value: T) => R,
): R | undefined => {
    const value = world.get(entity, componentType);
    if (value === undefined) {
        return undefined;
    }
    return operation(value);
};

export const createEntityWithComponents = (
    world: World,
    components: Array<{ type: ComponentType<any>; value?: unknown }>,
): Entity => {
    const entity = world.createEntity();
    for (const { type, value } of components) {
        world.addComponent(entity, type, value);
    }
    return entity;
};

export const findEntitiesByQuery = (world: World, query: Query): Entity[] => {
    const entities: Entity[] = [];
    for (const [entity] of world.iter(query)) {
        entities.push(entity);
    }
    return entities;
};

export const findFirstEntityByQuery = (world: World, query: Query): Entity | undefined => {
    for (const [entity] of world.iter(query)) {
        return entity;
    }
    return undefined;
};

export const countEntitiesByQuery = (world: World, query: Query): number => {
    let count = 0;
    for (const _ of world.iter(query)) {
        count++;
    }
    return count;
};

// Batch operations
export const destroyEntitiesByQuery = (world: World, query: Query): number => {
    const entitiesToDestroy: Entity[] = [];
    for (const [entity] of world.iter(query)) {
        entitiesToDestroy.push(entity);
    }

    const command = world.beginTick();
    for (const entity of entitiesToDestroy) {
        command.destroyEntity(entity);
    }
    command.flush();
    world.endTick();

    return entitiesToDestroy.length;
};

export const addComponentToEntitiesByQuery = <T>(
    world: World,
    query: Query,
    componentType: ComponentType<T>,
    value?: T,
): number => {
    const entitiesToUpdate: Entity[] = [];
    for (const [entity] of world.iter(query)) {
        entitiesToUpdate.push(entity);
    }

    const command = world.beginTick();
    for (const entity of entitiesToUpdate) {
        command.add(entity, componentType, value);
    }
    command.flush();
    world.endTick();

    return entitiesToUpdate.length;
};

export const removeComponentFromEntitiesByQuery = <T>(
    world: World,
    query: Query,
    componentType: ComponentType<T>,
): number => {
    const entitiesToUpdate: Entity[] = [];
    for (const [entity] of world.iter(query)) {
        entitiesToUpdate.push(entity);
    }

    const command = world.beginTick();
    for (const entity of entitiesToUpdate) {
        command.remove(entity, componentType);
    }
    command.flush();
    world.endTick();

    return entitiesToUpdate.length;
};

// Utility operations
export const getEntityComponents = (
    world: World,
    entity: Entity,
): Array<{ type: ComponentType<any>; value: unknown }> => {
    const components: Array<{ type: ComponentType<any>; value: unknown }> = [];

    // This is a simplified implementation - in practice you'd need to iterate
    // through all registered component types and check if the entity has them
    const loc = (world as any).loc[entity & 0xffff];
    if (loc && loc.arch) {
        for (const [cid, { prev }] of loc.arch.columns) {
            const componentType = (world as any).comps[cid];
            if (componentType && prev[loc.row] !== undefined) {
                components.push({
                    type: componentType,
                    value: prev[loc.row],
                });
            }
        }
    }

    return components;
};

export const duplicateEntity = (world: World, entity: Entity, componentOverrides?: Record<string, unknown>): Entity => {
    const components = getEntityComponents(world, entity);
    const newEntity = world.createEntity();

    const command = world.beginTick();
    for (const { type, value } of components) {
        const overriddenValue = componentOverrides?.[type.name];
        command.add(newEntity, type, overriddenValue ?? value);
    }
    command.flush();
    world.endTick();

    return newEntity;
};

export const validateEntity = (world: World, entity: Entity): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!world.isAlive(entity)) {
        errors.push(`Entity ${entity} is not alive`);
        return { isValid: false, errors };
    }

    // Additional validation logic could be added here
    // For example: checking required components, data consistency, etc.

    return {
        isValid: errors.length === 0,
        errors,
    };
};
