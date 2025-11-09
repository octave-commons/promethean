import test from 'ava';
import { z } from 'zod';

import { SchemaRegistry } from '../registry.js';

test('latest returns the highest registered version', (t) => {
    const registry = new SchemaRegistry();
    const schemaV1 = z.object({ foo: z.string().optional() });
    const schemaV2 = schemaV1.extend({ bar: z.number().optional() });

    registry.register({ topic: 'demo.topic', version: 1, schema: schemaV1, compat: 'none' });
    registry.register({ topic: 'demo.topic', version: 2, schema: schemaV2, compat: 'backward' });

    const latest = registry.latest('demo.topic');

    t.truthy(latest);
    t.is(latest?.version, 2);
    t.notThrows(() => registry.validate('demo.topic', { foo: 'value', bar: 1 }));
});

test('register rejects non-increasing versions', (t) => {
    const registry = new SchemaRegistry();
    const schema = z.object({ foo: z.string().optional() });

    registry.register({ topic: 'demo.topic', version: 1, schema, compat: 'none' });

    const error = t.throws(() => registry.register({ topic: 'demo.topic', version: 1, schema, compat: 'none' }));

    t.truthy(error);
    t.regex(error?.message ?? '', /version must increase/);
});

test('validate uses the requested schema version when provided', (t) => {
    const registry = new SchemaRegistry();
    const schemaV1 = z.object({ foo: z.string() });
    const schemaV2 = z.object({ foo: z.string(), bar: z.number() });

    registry.register({ topic: 'demo.topic', version: 1, schema: schemaV1, compat: 'none' });
    registry.register({ topic: 'demo.topic', version: 2, schema: schemaV2, compat: 'none' });

    t.notThrows(() => registry.validate('demo.topic', { foo: 'value' }, 1));
    t.throws(() => registry.validate('demo.topic', { foo: 'value' }));
});
