// ESLint real-time violations
// These should trigger specific ESLint rules immediately as I edit

// 1. var usage (should trigger no-var immediately)
var globalVar = 'triggers no-var';

// 2. let instead of const (should trigger prefer-const)
let notReassigned = 'should be const';

// 3. Class declaration (should trigger no-restricted-syntax)
class ForbiddenClass {
  method() {}
}

// 4. Class expression (should trigger no-restricted-syntax)
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
  riskyOperation();
} catch (error) {
  console.log(error);
}

// 9. Floating promise (should trigger @typescript-eslint/no-floating-promises)
fetch('https://example.com');

// 10. Missing return type (should trigger @typescript-eslint/explicit-module-boundary-types)
function missingReturnType(param1, param2) {
  return param1 + param2;
}

// 11. Any type (should trigger @typescript-eslint/no-explicit-any)
const anyTypeValue: any = 'triggers error';

// 12. Unsafe assignment (should trigger @typescript-eslint/no-unsafe-assignment)
const unsafeValue: any = 'test';
const result = unsafeValue.someProperty;

// 13. Multiple var declarations
var var1 = 'test',
  var2 = 'test2',
  var3 = 'test3';

// 14. Var in function scope
function functionWithVar() {
  var localVar = 'local var';
  return localVar;
}

// 15. Var redeclaration
var redeclared = 'first';
var redeclared = 'second';
