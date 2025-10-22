// Extreme lint tests - pushing boundaries to trigger ESLint
// Maybe I need to be more aggressive with violations

// 1. Lots of vars
var v1, v2, v3, v4, v5, v6, v7, v8, v9, v10;

// 2. Lots of classes
class C1 {
  field = 1;
}
class C2 {
  field = 2;
}
class C3 {
  field = 3;
}
class C4 {
  field = 4;
}
class C5 {
  field = 5;
}

// 3. Lots of lets
let l1 = 1,
  l2 = 2,
  l3 = 3,
  l4 = 4,
  l5 = 5;

// 4. Massive mutations
const massiveArray = [1, 2, 3, 4, 5];
massiveArray.push(6);
massiveArray.push(7);
massiveArray.push(8);
massiveArray.pop();
massiveArray.shift();
massiveArray.splice(0, 1);
massiveArray.reverse();
massiveArray.sort();

const massiveObject = { a: 1, b: 2, c: 3 };
massiveObject.d = 4;
massiveObject.e = 5;
massiveObject.f = 6;
delete massiveObject.a;
delete massiveObject.b;
delete massiveObject.c;

// 5. Nested loops
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    for (let k = 0; k < 10; k++) {
      console.log(i, j, k);
    }
  }
}

// 6. Nested try-catch
try {
  try {
    try {
      console.log('nested');
    } catch (e1) {
      console.log(e1);
    }
  } catch (e2) {
    console.log(e2);
  }
} catch (e3) {
  console.log(e3);
}

// 7. Complex class hierarchies
class Base {
  baseMethod() {}
}
class Child1 extends Base {
  child1Method() {}
}
class Child2 extends Base {
  child2Method() {}
}
class GrandChild extends Child1 {
  grandChildMethod() {}
}

// 8. Mixed var/let/const patterns
var mixed1 = 'var';
let mixed2 = 'let';
const mixed3 = 'const';

var mixed4 = 1,
  mixed5 = 2,
  mixed6 = 3;
let mixed7 = 4,
  mixed8 = 5,
  mixed9 = 6;

// 9. Deep mutations
const deep = {
  level1: {
    level2: {
      level3: {
        level4: {
          data: [1, 2, 3, 4, 5],
        },
      },
    },
  },
};
deep.level1.level2.level3.level4.data.push(6);
deep.level1.level2.level3.level4.data.pop();
deep.level1.level2.level3.level4.data.splice(0, 1);

// 10. Many class expressions
const ce1 = class {
  f1 = 1;
};
const ce2 = class {
  f2 = 2;
};
const ce3 = class {
  f3 = 3;
};
const ce4 = class {
  f4 = 4;
};
const ce5 = class {
  f5 = 5;
};

// 11. Function violations
function func1() {
  var v = 1;
  return v;
}
function func2() {
  let l = 2;
  return l;
}
function func3() {
  const c = 3;
  return c;
}

// 12. Export everything
export var ev1 = 1;
export var ev2 = 2;
export var ev3 = 3;

export class EC1 {}
export class EC2 {}
export class EC3 {}

export const ece1 = class {};
export const ece2 = class {};
export const ece3 = class {};

// 13. Import violations
import * as fs1 from 'fs';
import * as fs2 from 'fs';
import * as fs3 from 'fs';

// 14. More loops
let whileCounter = 0;
while (whileCounter < 100) {
  whileCounter++;
}

let doCounter = 0;
do {
  doCounter++;
} while (doCounter < 50);

// 15. Array methods that mutate
const mutateArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
mutateArray.copyWithin(0, 1);
mutateArray.fill(0);
mutateArray.unshift(0);
mutateArray.splice(2, 3);
mutateArray.sort();
mutateArray.reverse();
