import test from 'ava';

// Basic test to verify testing framework works
test('basic test setup works', (t) => {
  t.pass();
});

test('basic assertions work', (t) => {
  t.is(1 + 1, 2);
  t.true(true);
  t.false(false);
  t.not(null, undefined);
});
