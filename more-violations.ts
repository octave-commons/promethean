// More violations file - testing var and other non-functional anti-patterns
// This file intentionally violates many functional programming and code quality rules

// 1. var violations (should trigger no-var)
var globalVar = "I'm a var";
var anotherVar = 1;
var functionScoped = true;

// 2. Multiple var declarations
var x = 1,
  y = 2,
  z = 3;

// 3. var with reassignment
var counter = 0;
counter = counter + 1;
counter += 1;

// 4. var in different scopes
function testVarScope() {
  var localVar = 'local';
  if (true) {
    var blockVar = 'block'; // var is function scoped, not block scoped
  }
  console.log(blockVar); // This works but is bad practice
}

// 5. var without initialization
var uninitializedVar;
uninitializedVar = 'later';

// 6. var with hoisting issues
console.log(hoistedVar); // undefined due to hoisting
var hoistedVar = "I'm hoisted";

// 7. Try-catch violations (functional/no-try-statements)
function riskyOperation() {
  try {
    // Some risky code
    var result = JSON.parse('{"invalid": json}');
    return result;
  } catch (error) {
    // Catch blocks are discouraged in functional programming
    console.error('Error:', error);
    return null;
  }
}

// 8. Loop violations (functional/no-loop-statements)
function loopViolations() {
  var numbers = [1, 2, 3, 4, 5];
  var sum = 0;

  // for loop
  for (var i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }

  // while loop
  var j = 0;
  while (j < 5) {
    sum += j;
    j++;
  }

  // do-while loop
  var k = 0;
  do {
    sum += k;
    k++;
  } while (k < 3);

  // for-in loop (bad practice for arrays)
  for (var index in numbers) {
    sum += numbers[index];
  }

  // for-of loop (still a loop violation)
  for (var num of numbers) {
    sum += num;
  }

  return sum;
}

// 9. Mutable data violations (functional/immutable-data)
function mutableDataViolations() {
  var mutableArray = [1, 2, 3];
  mutableArray.push(4); // Modifying array
  mutableArray.pop(); // Modifying array
  mutableArray[0] = 99; // Modifying array

  var mutableObject = { prop1: 'value1', prop2: 'value2' };
  mutableObject.prop3 = 'value3'; // Adding new property
  mutableObject.prop1 = 'modified'; // Modifying existing property
  delete mutableObject.prop2; // Deleting property

  var mutableString = 'hello';
  mutableString = mutableString + ' world'; // Reassignment

  return { mutableArray, mutableObject, mutableString };
}

// 10. Let violations (functional/no-let)
function letViolations() {
  let letVariable = "I'm a let";
  let anotherLet = 42;

  letVariable = 'reassigned'; // Let allows reassignment
  anotherLet = anotherLet + 1;

  // Let in loop
  for (let i = 0; i < 10; i++) {
    let temp = i * 2;
    temp = temp + 1; // Reassignment
  }

  return letVariable;
}

// 11. Side effects in functions
function sideEffects() {
  var external = 'external';

  function impureFunction(input) {
    external = external + input; // Side effect: modifies external variable
    console.log('Logging side effect'); // Side effect: I/O
    globalVar = 'modified globally'; // Side effect: modifies global state

    return input * 2;
  }

  return impureFunction(5);
}

// 12. Mutation violations
function mutationViolations() {
  var data = {
    nested: {
      array: [1, 2, 3],
      value: 'original',
    },
  };

  // Deep mutation
  data.nested.array.push(4);
  data.nested.value = 'mutated';

  // Function that mutates parameter
  function mutateParam(obj) {
    obj.mutated = true;
    obj.newProp = 'added';
    return obj;
  }

  return mutateParam(data);
}

// 13. More var patterns
function moreVarPatterns() {
  // var in for loop
  for (var i = 0; i < 5; i++) {
    setTimeout(function () {
      console.log(i); // All will log 5 due to var scoping
    }, 100);
  }

  // var with same name in different scopes
  var sameName = 'outer';

  function innerFunction() {
    var sameName = 'inner'; // Shadows outer variable
    console.log(sameName);
  }

  innerFunction();
  console.log(sameName);

  // var without block scope
  if (true) {
    var blockScopedVar = 'not really block scoped';
  }
  console.log(blockScopedVar); // Accessible outside if block
}

// 14. Require statements (ESM only violation)
var fs = require('fs'); // Should be import
var path = require('path'); // Should be import

// 15. Module.exports (ESM only violation)
module.exports = {
  // Should be export
  testVarScope,
  loopViolations,
  mutableDataViolations,
};

// 16. Var with function declarations
var functionExpression = function () {
  return "I'm a function expression assigned to var";
};

var arrowFunction = () => {
  return "I'm an arrow function assigned to var";
};

// 17. Var hoisting demonstration
function hoistingDemo() {
  console.log('Before declaration:', hoistedFunction); // Function is hoisted

  try {
    notHoistedFunction(); // Error - not hoisted
  } catch (e) {
    console.log('Error:', e.message);
  }

  var hoistedFunction = function () {
    return "I'm hoisted as undefined";
  };

  var notHoistedFunction = function () {
    return "I'm not accessible before declaration";
  };

  console.log('After declaration:', hoistedFunction());
}

export {
  testVarScope,
  riskyOperation,
  loopViolations,
  mutableDataViolations,
  letViolations,
  sideEffects,
  mutationViolations,
  moreVarPatterns,
  hoistingDemo,
};
