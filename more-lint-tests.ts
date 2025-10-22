// More lint tests - trying different approaches to trigger ESLint in real-time
// Maybe the issue is with how I'm structuring the violations

// 1. Simple var at top level
var simpleVar = 'test';

// 2. Simple class
class SimpleClass {
  field: string = 'test';
}

// 3. Simple let
let simpleLet = 'test';

// 4. Simple array mutation
const arr = [1, 2, 3];
arr.push(4);

// 5. Simple object mutation
const obj = { a: 1 };
obj.b = 2;

// 6. Simple loop
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// 7. Simple try-catch
try {
  console.log('test');
} catch (e) {
  console.log(e);
}

// 8. Multiple vars on separate lines
var var1 = 'test1';
var var2 = 'test2';
var var3 = 'test3';

// 9. Multiple classes
class Class1 {}
class Class2 {}
class Class3 {}

// 10. More mutations
const data = { items: [] as number[] };
data.items.push(1);
data.items.push(2);
data.items.push(3);

// 11. More loops
let j = 0;
while (j < 3) {
  console.log(j);
  j++;
}

// 12. More lets
let let1 = 'test1';
let let2 = 'test2';
let let3 = 'test3';

// 13. Class expressions
const expr1 = class {};
const expr2 = class {
  field = 'test';
};
const expr3 = class {
  method() {}
};

// 14. Nested mutations
const nested = {
  level1: {
    level2: {
      data: [1, 2, 3],
    },
  },
};
nested.level1.level2.data.push(4);

// 15. Different mutation patterns
const mutations = {
  array: [1, 2, 3],
  object: { prop: 'value' },
};
mutations.array.pop();
mutations.array.shift();
mutations.object.newProp = 'test';
delete mutations.object.prop;

// 16. Function with var
function functionWithVar() {
  var localVar = 'local';
  return localVar;
}

// 17. Function with let
function functionWithLet() {
  let localLet = 'local';
  return localLet;
}

// 18. Class in function
function functionWithClass() {
  class LocalClass {
    field = 'local';
  }
  return LocalClass;
}

// 19. Export var
export var exportVar = 'exported var';

// 20. Export class
export class ExportClass {
  exportField = 'exported';
}
