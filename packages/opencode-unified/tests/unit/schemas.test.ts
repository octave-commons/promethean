import test from 'ava';

// Import schemas module
const { SCHEMAS_VERSION } = await import('../../src/schemas');

test('schemas module exports correct version', (t) => {
  t.is(SCHEMAS_VERSION, '1.0.0');
});

test('can import schemas module', async (t) => {
  const schemas = await import('../../src/schemas');

  t.truthy(schemas.SCHEMAS_VERSION);
  t.true(typeof schemas.SCHEMAS_VERSION === 'string');
});
