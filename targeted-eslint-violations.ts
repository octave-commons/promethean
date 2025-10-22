// Targeted ESLint violations - specifically targeting your configured rules
// These should trigger ESLint rules that opencode might detect

// 1. Class declaration - targets no-restricted-syntax selector: 'ClassDeclaration'
class TargetedClassDeclaration {
  constructor() {}
}

// 2. Class expression - targets no-restricted-syntax selector: 'ClassExpression'
const targetedClassExpression = class {
  method() {}
};

// 3. var usage - targets no-var rule
var targetedVar = 'triggers no-var';

// 4. let usage - targets functional/no-let
let targetedLet = 'triggers no-let';

// 5. Array mutation - targets functional/immutable-data
const targetArray = [1, 2, 3];
targetArray.push(4);

// 6. Object mutation - targets functional/immutable-data
const targetObject = { prop: 'value' };
targetObject.newProp = 'new';

// 7. Loop - targets functional/no-loop-statements
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// 8. Try-catch - targets functional/no-try-statements
try {
  JSON.parse('{"invalid": json}');
} catch (error) {
  console.log(error);
}

// 9. Multiple var in one line
var var1 = 'test1',
  var2 = 'test2';

// 10. require() usage - targets no-restricted-syntax selector: "CallExpression[callee.name='require']"
const fs = require('fs');

// 11. module.exports - targets no-restricted-syntax selector: "MemberExpression[object.name='module'][property.name='exports']"
module.exports = { test: 'value' };

// 12. Floating promise - targets @typescript-eslint/no-floating-promises
fetch('https://example.com');

// 13. Any type - targets @typescript-eslint/no-explicit-any
const anyValue: any = 'test';

// 14. Missing return type - targets @typescript-eslint/explicit-module-boundary-types
function missingReturnType(param) {
  return param;
}

// 15. Too many params - targets max-params
function tooMany(a, b, c, d, e, f) {
  return a + b + c + d + e + f;
}

// 16. Import order - targets import/order
import * as path from 'path';
import { test } from './local';

// 17. prefer-const violation
let shouldBeConst = 'never reassigned';

// 18. More class violations
class AnotherClassViolation {
  method() {}
}

class YetAnotherClass {
  field = 'test';
}

// 19. More var patterns
var globalVar1 = 'global1';
var globalVar2 = 'global2';
var globalVar3 = 'global3';

// 20. More mutations
const mutableData = { items: [] };
mutableData.items.push('new item');
