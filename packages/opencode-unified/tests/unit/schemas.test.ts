import test from 'ava';

// Import schemas module
const { SCHEMAS_VERSION } = await import('../../src/schemas');

test('schemas module exports correct version', (t) => {
  t.is(SCHEMAS_VERSION, '1.0.0');
});

test('can import schema types', async (t) => {
  const { BaseSchema, ConfigSchema } = await import('../../src/schemas');

  t.truthy(BaseSchema);
  t.truthy(ConfigSchema);
});

test('base schema interface structure', async (t) => {
  const { BaseSchema } = await import('../../src/schemas');

  // Test that we can create objects conforming to the interface
  const baseSchema: BaseSchema = {
    id: 'test-123',
    type: 'test',
    version: '1.0.0',
    created: new Date(),
    updated: new Date(),
  };

  t.is(baseSchema.id, 'test-123');
  t.is(baseSchema.type, 'test');
  t.is(baseSchema.version, '1.0.0');
  t.true(baseSchema.created instanceof Date);
  t.true(baseSchema.updated instanceof Date);
});
