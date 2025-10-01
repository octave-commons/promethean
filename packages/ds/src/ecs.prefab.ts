// shared/ts/prom-lib/ds/ecs.prefab.ts

import { World, ComponentType } from './ecs.js';

export type BlueprintStep<T = any> = {
    c: ComponentType<T>;
    v?: T | ((i: number) => T);
};
export type Blueprint = {
    name: string;
    steps: BlueprintStep[];
};

export function makeBlueprint(name: string, steps: BlueprintStep[]): Blueprint {
    return { name, steps };
}

export function spawn(world: World, bp: Blueprint, count = 1, overrides?: Partial<Record<number, any>>): number[] {
    return Array.from({ length: count }, (_, index) => {
        const entity = world.createEntity();
        bp.steps.forEach((step) => {
            const valueOrFactory = step.v;
            const generated =
                typeof valueOrFactory === 'function'
                    ? (valueOrFactory as (i: number) => unknown)(index)
                    : valueOrFactory;
            const resolved = overrides?.[step.c.id] ?? generated;
            world.addComponent(entity, step.c as any, resolved);
        });
        return entity;
    });
}
