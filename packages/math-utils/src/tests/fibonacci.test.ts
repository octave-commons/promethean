// SPDX-License-Identifier: GPL-3.0-only
// Fibonacci Tests

import test from 'ava';

import { Fibonacci } from '../fibonacci.js';

test('Fibonacci - basic calculations', (t) => {
  const fib = new Fibonacci();

  t.is(fib.calculate(0).value, 0n);
  t.is(fib.calculate(1).value, 1n);
  t.is(fib.calculate(2).value, 1n);
  t.is(fib.calculate(3).value, 2n);
  t.is(fib.calculate(4).value, 3n);
  t.is(fib.calculate(5).value, 5n);
  t.is(fib.calculate(10).value, 55n);
});

test('Fibonacci - different methods', (t) => {
  const fib = new Fibonacci();

  const n = 10;
  const iterative = fib.calculate(n, 'iterative').value;
  const recursive = fib.calculate(n, 'recursive').value;
  const matrix = fib.calculate(n, 'matrix').value;
  const memoized = fib.calculate(n, 'memoized').value;

  t.is(iterative, 55n);
  t.is(recursive, 55n);
  t.is(matrix, 55n);
  t.is(memoized, 55n);
});

test('Fibonacci - sequence generation', (t) => {
  const fib = new Fibonacci();

  const sequence = fib.sequence(10);
  const expected = [0n, 1n, 1n, 2n, 3n, 5n, 8n, 13n, 21n, 34n];

  t.deepEqual(sequence, expected);
});

test('Fibonacci - large numbers', (t) => {
  const fib = new Fibonacci();

  const result = fib.calculate(50, 'iterative');
  t.is(result.value, 12586269025n);
  t.is(result.index, 50);
  t.is(result.method, 'iterative');
  t.true(typeof result.computationTime === 'number');
});

test('Fibonacci - isFibonacci validation', (t) => {
  const fib = new Fibonacci();

  t.true(fib.isFibonacci(0n));
  t.true(fib.isFibonacci(1n));
  t.true(fib.isFibonacci(5n));
  t.true(fib.isFibonacci(13n));
  t.true(fib.isFibonacci(34n));
  t.true(fib.isFibonacci(144n));

  t.false(fib.isFibonacci(4n));
  t.false(fib.isFibonacci(6n));
  t.false(fib.isFibonacci(10n));
  t.false(fib.isFibonacci(100n));
});

test('Fibonacci - error handling', (t) => {
  const fib = new Fibonacci();

  t.throws(() => fib.calculate(-1), {
    message: 'Fibonacci number must be non-negative',
  });

  t.throws(() => fib.sequence(-5), {
    message: 'Sequence length must be non-negative',
  });
});

test('Fibonacci - cache operations', (t) => {
  const fib = new Fibonacci();

  const initialSize = fib.getCacheSize();
  t.is(initialSize, 2);

  fib.calculate(10, 'memoized');
  const afterCalculation = fib.getCacheSize();
  t.true(afterCalculation > initialSize);

  fib.clearCache();
  const afterClear = fib.getCacheSize();
  t.is(afterClear, 2);
});

test('Fibonacci - performance comparison', (t) => {
  const fib = new Fibonacci();

  const n = 20;

  const iterativeResult = fib.calculate(n, 'iterative');
  const matrixResult = fib.calculate(n, 'matrix');
  const memoizedResult = fib.calculate(n, 'memoized');

  t.is(iterativeResult.value, matrixResult.value);
  t.is(iterativeResult.value, memoizedResult.value);

  t.true(typeof iterativeResult.computationTime === 'number');
  t.true(typeof matrixResult.computationTime === 'number');
  t.true(typeof memoizedResult.computationTime === 'number');
});

test('Fibonacci - default method', (t) => {
  const fibIterative = new Fibonacci('iterative');
  const fibMatrix = new Fibonacci('matrix');

  const n = 15;

  const result1 = fibIterative.calculate(n);
  const result2 = fibMatrix.calculate(n);

  t.is(result1.method, 'iterative');
  t.is(result2.method, 'matrix');
  t.is(result1.value, result2.value);
});
