import test from 'ava';
import { generateId } from '../utils/index.js';

test('generateId produces different IDs', (t) => {
  const id1 = generateId();
  const id2 = generateId();

  t.is(typeof id1, 'string');
  t.is(typeof id2, 'string');
  t.not(id1, id2);
  t.true(id1.length > 0);
  t.true(id2.length > 0);
});
