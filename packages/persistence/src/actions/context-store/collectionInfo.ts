import type { ContextDependencies } from './types.js';

export const collectionCount = (dependencies: ContextDependencies): number => dependencies.state.collections.size;

export const listCollectionNames = (dependencies: ContextDependencies): readonly string[] =>
    Array.from(dependencies.state.collections.keys());

