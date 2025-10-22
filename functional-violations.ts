// Functional programming violations - should trigger immediate ESLint feedback
// Targeting specific functional programming rules

// 1. Class declaration (should trigger no-restricted-syntax immediately)
class FunctionalViolation {
  constructor(public value: string) {}

  getValue(): string {
    return this.value;
  }
}

// 2. Another class
class AnotherClass {
  private field: number = 42;

  method(): void {
    console.log(this.field);
  }
}

// 3. Class expression (should trigger no-restricted-syntax)
const classExpression = class {
  data: string[] = [];

  add(item: string): void {
    this.data.push(item); // Also triggers functional/immutable-data
  }
};

// 4. var usage (should trigger no-var immediately)
var functionalVar = 'triggers no-var';

// 5. let usage (should trigger functional/no-let)
let functionalLet = 'triggers no-let';

// 6. let that's never reassigned (should trigger prefer-const)
let shouldBeConst = 'never reassigned';

// 7. Array mutation (should trigger functional/immutable-data)
const array = [1, 2, 3];
array.push(4);
array.pop();
array[0] = 99;

// 8. Object mutation (should trigger functional/immutable-data)
const object = { prop: 'value' };
object.newProp = 'new';
object.prop = 'modified';

// 9. Loop (should trigger functional/no-loop-statements)
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// 10. While loop
let j = 0;
while (j < 3) {
  console.log(j);
  j++;
}

// 11. Try-catch (should trigger functional/no-try-statements)
try {
  JSON.parse('{"invalid": json}');
} catch (error) {
  console.log(error);
}

// 12. Multiple var declarations
var var1 = 'test1',
  var2 = 'test2',
  var3 = 'test3';

// 13. Var in different scopes
function varInScope() {
  var outer = 'outer';
  if (true) {
    var inner = 'inner'; // Not actually block scoped
  }
  return outer + inner;
}

// 14. More class violations
class WithMethods {
  private data: Map<string, any> = new Map();

  setData(key: string, value: any): void {
    this.data.set(key, value);
  }

  getData(key: string): any {
    return this.data.get(key);
  }
}

// 15. Class with inheritance
class ChildClass extends FunctionalViolation {
  private childProp: number = 0;

  getChildProp(): number {
    return this.childProp;
  }
}

// 16. Exported class
export class ExportedViolation {
  static readonly CONSTANT = 'test';

  instanceMethod(): string {
    return 'instance';
  }
}
