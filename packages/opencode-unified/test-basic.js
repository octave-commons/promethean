import test from 'ava';

test('basic test works', (t) => {
  t.pass();
});

test('can import schemas version', async (t) => {
  const { SCHEMAS_VERSION } = await import('./dist/schemas/index.js');
  t.is(SCHEMAS_VERSION, '1.0.0');
});
