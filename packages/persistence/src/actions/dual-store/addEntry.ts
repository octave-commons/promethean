import type { DualStoreDependencies, InsertInputs } from './types.js';

import { insert } from './insert.js';

export const addEntry = async <TextKey extends string, TimeKey extends string>(
    inputs: InsertInputs<TextKey, TimeKey>,
    dependencies: DualStoreDependencies<TextKey, TimeKey>,
): Promise<void> => insert(inputs, dependencies);

