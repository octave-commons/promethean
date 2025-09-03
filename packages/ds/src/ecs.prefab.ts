// shared/ts/prom-lib/ds/ecs.prefab.ts

import { World, ComponentType } from './ecs.js';

export type BlueprintStep<T = any> = {
    c: ComponentType<T>;
    v?: T | ((i: number) => T);
};
export interface Blueprint {
    name: string;
    steps: BlueprintStep[];
}

export function makeBlueprint(name: string, steps: BlueprintStep[]): Blueprint {
    return { name, steps };
}

export function spawn(world: World, bp: Blueprint, count = 1, overrides?: Partial<Record<number, any>>): number[] {
    const ids: number[] = [];
    for (let i = 0; i < count; i++) {
        const e = world.createEntity();
        for (const s of bp.steps) {
            const val = typeof s.v === 'function' ? (s.v as any)(i) : s.v;
            world.addComponent(e, s.c as any, overrides?.[s.c.id] ?? val);
        }
        ids.push(e);
    }
    return ids;
}
