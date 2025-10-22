// Pure ESLint violations - no TypeScript errors, only ESLint rule violations
// These should trigger ESLint rules that opencode might detect in real-time

// 1. var usage - should trigger no-var rule
var eslintVar = 'triggers no-var rule';

// 2. let that should be const - should trigger prefer-const
let eslintLet = 'should be const since never reassigned';

// 3. Class declaration - should trigger no-restricted-syntax
class EslintClassViolation {
  constructor() {}
}

// 4. Class expression - should trigger no-restricted-syntax
const eslintClassExpression = class {
  method() {}
};

// 5. Array mutation - should trigger functional/immutable-data
const eslintArray = [1, 2, 3];
eslintArray.push(4);

// 6. Object mutation - should trigger functional/immutable-data
const eslintObject = { prop: 'value' };
eslintObject.newProp = 'added';

// 7. Loop - should trigger functional/no-loop-statements
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// 8. Try-catch - should trigger functional/no-try-statements
try {
  const result = JSON.parse('{"valid": "json"}');
  console.log(result);
} catch (error) {
  console.log('Error caught');
}

// 9. Multiple var declarations
var var1 = 'test1',
  var2 = 'test2',
  var3 = 'test3';

// 10. let usage - should trigger functional/no-let
let anotherLet = 'triggers functional/no-let';

// 11. More mutations
const data = { items: [] as string[] };
data.items.push('new item');

// 12. More class violations
class AnotherEslintClass {
  field: string = 'test';

  method(): void {
    console.log(this.field);
  }
}

// 13. More var patterns
var global1 = 'global1';
var global2 = 'global2';

// 14. Nested mutations
const nested = {
  level1: {
    level2: {
      items: [1, 2, 3],
    },
  },
};
nested.level1.level2.items.push(4);

// 15. More loops
let j = 0;
while (j < 3) {
  console.log(j);
  j++;
}

// 16. Array methods that mutate
const mutable = [1, 2, 3];
mutable.reverse();
mutable.sort();
mutable.splice(0, 1);

// 17. Object property deletion
const deletable = { temp: 'value', keep: 'value' };
delete deletable.temp;

// 18. Class with static members
class StaticClassViolation {
  static staticField = 'static';
  static staticMethod() {
    return 'static method';
  }
}

// 19. Class inheritance
class BaseViolation {
  baseMethod(): string {
    return 'base';
  }
}

class DerivedViolation extends BaseViolation {
  derivedMethod(): string {
    return 'derived';
  }
}

// 20. Export class
export class ExportedViolation {
  exportMethod(): string {
    return 'exported';
  }
}
