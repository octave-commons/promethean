import test from 'ava';

import { PantheonError, createError, isError } from '../../utils/index.js';

test('PantheonError creates proper error instance', (t) => {
  const error = new PantheonError('Test error message', 'TEST_CODE', { detail: 'value' });

  t.is(error.name, 'PantheonError');
  t.is(error.message, 'Test error message');
  t.is(error.code, 'TEST_CODE');
  t.deepEqual(error.details, { detail: 'value' });
  t.true(error instanceof Error);
  t.true(error instanceof PantheonError);
});

test('PantheonError with minimal parameters', (t) => {
  const error = new PantheonError('Simple error', 'SIMPLE');

  t.is(error.message, 'Simple error');
  t.is(error.code, 'SIMPLE');
  t.is(error.details, undefined);
});

test('PantheonError has stack trace', (t) => {
  const error = new PantheonError('Stack test', 'STACK_TEST');

  t.is(typeof error.stack, 'string');
  t.true(error.stack!.length > 0);
});

test('createError factory function', (t) => {
  const error = createError('FACTORY_CODE', 'Factory error message', { factory: true });

  t.true(error instanceof PantheonError);
  t.is(error.message, 'Factory error message');
  t.is(error.code, 'FACTORY_CODE');
  t.deepEqual(error.details, { factory: true });
});

test('createError without details', (t) => {
  const error = createError('NO_DETAILS', 'Error without details');

  t.is(error.message, 'Error without details');
  t.is(error.code, 'NO_DETAILS');
  t.is(error.details, undefined);
});

test('isError type guard with PantheonError', (t) => {
  const pantheonError = new PantheonError('Test', 'TEST');
  const regularError = new Error('Regular error');
  const stringValue = 'not an error';
  const nullValue = null;

  t.true(isError(pantheonError));
  t.false(isError(regularError));
  t.false(isError(stringValue));
  t.false(isError(nullValue));
});

test('isError type guard with subclass', (t) => {
  class CustomPantheonError extends PantheonError {
    constructor(message: string) {
      super(message, 'CUSTOM');
    }
  }

  const customError = new CustomPantheonError('Custom message');

  t.true(isError(customError));
  t.true(customError instanceof PantheonError);
  t.is(customError.code, 'CUSTOM');
});

test('PantheonError serialization', (t) => {
  const testError = new PantheonError('Serialization test', 'SERIALIZE', {
    nested: { value: 42 },
    array: [1, 2, 3],
  });

  const errorJson = JSON.stringify(testError);
  const parsed = JSON.parse(errorJson) as {
    message: string;
    code: string;
    details: Record<string, unknown>;
  };

  t.is(parsed.message, 'Serialization test');
  t.is(parsed.code, 'SERIALIZE');
  t.deepEqual(parsed.details, {
    nested: { value: 42 },
    array: [1, 2, 3],
  });
});

test('PantheonError inheritance chain', (t) => {
  const error = new PantheonError('Inheritance test', 'INHERITANCE');

  t.true(error instanceof Error);
  t.true(error instanceof PantheonError);
  t.is(error.constructor.name, 'PantheonError');
});
