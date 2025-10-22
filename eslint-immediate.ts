// ESLint immediate violations - targeting specific ESLint rules
// These should trigger ESLint rule violations immediately

// 1. var usage (should trigger no-var rule immediately)
var globalVar = 'triggers no-var rule';

// 2. let that should be const (should trigger prefer-const)
let notReassigned = 'should be const';

// 3. Class declaration (should trigger no-restricted-syntax for ClassDeclaration)
class ForbiddenClass {
  method() {}
}

// 4. Class expression (should trigger no-restricted-syntax for ClassExpression)
const classExpression = class {
  field = 'test';
};

// 5. Loop (should trigger functional/no-loop-statements)
for (let i = 0; i < 10; i++) {
  console.log(i);
}

// 6. Array mutation (should trigger functional/immutable-data)
const mutableArray = [1, 2, 3];
mutableArray.push(4);

// 7. Object mutation (should trigger functional/immutable-data)
const mutableObject = { prop: 'value' };
mutableObject.newProp = 'new value';

// 8. Try-catch (should trigger functional/no-try-statements)
try {
  JSON.parse('{"invalid": json}');
} catch (error) {
  console.log(error);
}

// 9. Multiple var declarations
var var1 = 'test',
  var2 = 'test2',
  var3 = 'test3';

// 10. let usage (should trigger functional/no-let)
let letVariable = 'triggers no-let';

// 11. Floating promise (should trigger @typescript-eslint/no-floating-promises)
fetch('https://example.com');

// 12. Missing return type (should trigger @typescript-eslint/explicit-module-boundary-types)
function missingReturnType(param1, param2) {
  return param1 + param2;
}

// 13. Any type (should trigger @typescript-eslint/no-explicit-any)
const anyTypeValue: any = 'triggers error';

// 14. Too many parameters (should trigger max-params)
function tooManyParams(a, b, c, d, e, f) {
  return a + b + c + d + e + f;
}

// 15. Collapsible if (should trigger sonarjs/no-collapsible-if)
if (true) {
  if (false) {
    console.log('nested');
  }
}

// 16. Import order violations
import * as fs from 'fs';
import { something } from 'lodash';
import local from './local';
