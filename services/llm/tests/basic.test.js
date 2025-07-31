import test from 'ava';
import express from 'express';

test('express app initializes', t => {
  const app = express();
  t.truthy(app);
});
