// This file intentionally contains linting violations for testing

var unused_variable = 'this should be const or let';
let another_unused;

function bad_function(param1, param2) {
  console.log('missing return type');
  var x = param1 + param2;
  return x;
}

const obj = {
  prop1: 'value1',
  prop2: 'value2',
  prop1: 'duplicate', // duplicate key
};

if (condition) {
  doSomething();
} else {
  doSomethingElse();
}

function has_unused_params(a, b, c, d, e) {
  return a + b;
}

// Missing semicolons
const missing_semicolon = 'test';

function trailing_whitespace() {
  return 'extra spaces';
}

// Unused imports
import { unused1, unused2 } from 'some-module';
import * as fs from 'fs';

// Mixed quotes
const single_quotes = 'single';
const double_quotes = 'double';

// Long line that exceeds typical lint limits and should be broken up into multiple lines for better readability and to trigger line length violations in most linting configurations
const very_long_variable_name_that_exceeds_reasonable_length_limits =
  'this is a very long string that makes the line too long';

// Inconsistent spacing
const spaced = 1;
const notSpaced = 2;

// Missing error handling
try {
  JSON.parse(invalid_json);
} catch {
  // empty catch block
}

// Magic numbers
const timeout = 5000;
const max_retries = 3;

// Console statements in production code
console.log('debug info');
console.error('error info');

// TODO without proper format
//TODO: fix this later

// Function without proper JSDoc
function calculate(a, b) {
  return a * b;
}

// Unused variables in scope
function unused_vars() {
  const x = 1;
  const y = 2;
  const z = 3;
  return x;
}

// Type assertions without proper checks
const value = someValue as string;

// Missing dependencies in useEffect (if React)
useEffect(() => {
  fetchData();
}, []);

// Potential memory leak
let interval = setInterval(() => {
  console.log('running');
}, 1000);
// clearInterval never called

// Equality vs identity
if (x == null) {
  // should use ===
}

// Forbidden global variables
window.globalVar = 'test';

// Regex without proper escaping
const regex = /https?:\/\/[^\s]+/;

// Missing return type annotation
function noReturnType() {
  return 42;
}

// Object property access without optional chaining
const value = obj.deep.nested.property.might.not.exist;

// Array methods without proper type guards
const items = data.filter((item) => item.active);

// Missing error types
try {
  await riskyOperation();
} catch (err) {
  // err is any/unknown
  console.log(err.message);
}

// Inconsistent naming conventions
const PascalCase_variable = 'wrong';
const camelCase_Function = 'also wrong';

// Missing exports
const internal_helper = () => {
  return 'helper';
};

// Dead code
if (false) {
  console.log('never runs');
}

// Nested ternary operators
const result = condition1 ? value1 : condition2 ? value2 : value3;

// Multiple statements on one line
const a = 1;
const b = 2;
const c = 3;

// Missing parentheses in complex expressions
const result2 = x + y * z - w / v + u;

// Unnecessary complexity
function complex_function(x) {
  if (x > 0) {
    if (x > 10) {
      if (x > 100) {
        return 'very large';
      } else {
        return 'large';
      }
    } else {
      return 'small';
    }
  } else {
    return 'zero or negative';
  }
}

export { unused_variable, PascalCase_variable };
