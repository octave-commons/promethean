// Used violations - making sure variables are used to avoid unused errors
// This should trigger ESLint rules but not TypeScript unused errors

// 1. Used var - should trigger no-var
var usedVar = 'var is used';
console.log(usedVar);

// 2. Used let - should trigger functional/no-let
let usedLet = 'let is used';
console.log(usedLet);

// 3. Used class - should trigger no-restricted-syntax
class UsedClass {
  constructor() {
    console.log('class is used');
  }
}
const instance = new UsedClass();

// 4. Used class expression - should trigger no-restricted-syntax
const usedClassExpression = class {
  method() {
    console.log('class expression is used');
  }
};
usedClassExpression.method();

// 5. Used array with mutations - should trigger functional/immutable-data
const usedArray = [1, 2, 3];
usedArray.push(4);
console.log(usedArray);

// 6. Used object with mutations - should trigger functional/immutable-data
const usedObject = { prop: 'value' };
usedObject.newProp = 'new';
console.log(usedObject);

// 7. Used loop - should trigger functional/no-loop-statements
for (let i = 0; i < 3; i++) {
  console.log('loop is used', i);
}

// 8. Used try-catch - should trigger functional/no-try-statements
try {
  JSON.parse('{"valid": "json"}');
  console.log('try is used');
} catch (error) {
  console.log('catch is used', error);
}

// 9. Used function with no return type - should trigger explicit-module-boundary-types
function usedFunction(param1, param2) {
  console.log('function is used', param1, param2);
  return param1 + param2;
}
const result = usedFunction('hello', 'world');

// 10. Used any type - should trigger no-explicit-any
const usedAny: any = 'any is used';
console.log(usedAny.someProperty);

// 11. Used too many params - should trigger max-params
function usedTooMany(a, b, c, d, e, f) {
  console.log('too many params is used', a, b, c, d, e, f);
  return a + b + c + d + e + f;
}
const tooManyResult = usedTooMany(1, 2, 3, 4, 5, 6);

// 12. Used require - should trigger no-restricted-syntax
const usedRequire = require('fs');
console.log('require is used', usedRequire);

// 13. Used module.exports - should trigger no-restricted-syntax
module.exports = { used: true };
console.log('module.exports is used');
