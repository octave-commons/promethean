// Edge case violations - testing specific anti-patterns and edge cases
// This file targets specific rules and edge cases that might be missed

// 1. Mixed var/let/const in same scope
var mixed1 = 'var';
let mixed2 = 'let';
const mixed3 = 'const';

// 2. Var with function declaration vs function expression
var functionDecl = function functionInVar() {
  return 'function declaration in var';
};

// 3. Var in global scope pollution
var globalPollution1 = 'global1';
var globalPollution2 = 'global2';
var globalPollution3 = 'global3';

// 4. Var redeclaration (same name)
var redeclared = 'first';
var redeclared = 'second'; // Redeclaration

// 5. Var with destructuring
var { prop1, prop2 } = { prop1: 'value1', prop2: 'value2' };
var [item1, item2] = [1, 2];

// 6. Var with array patterns
var [a, b, ...rest] = [1, 2, 3, 4, 5];

// 7. Var in nested scopes
function nestedVarScopes() {
  var outer = 'outer';

  function inner() {
    var inner = 'inner';
    var outer = 'shadowed'; // Shadowing

    if (true) {
      var blockLevel = 'not really block scoped';
      var outer = 'shadowed again'; // Shadowing again
    }

    return { inner, outer, blockLevel };
  }

  return inner();
}

// 8. Var with loops and closures
function varLoopClosureIssues() {
  var functions = [];

  for (var i = 0; i < 3; i++) {
    functions.push(function () {
      return i; // All functions will return 3
    });
  }

  // Another loop issue
  var j = 0;
  while (j < 3) {
    functions.push(function () {
      return j; // All will return 3
    });
    j++;
  }

  return functions;
}

// 9. Var hoisting edge cases
function hoistingEdgeCases() {
  console.log(typeof notDeclaredYet); // "undefined"

  var notDeclaredYet = 'now declared';

  function testHoisting() {
    console.log(innerVar); // undefined due to hoisting
    var innerVar = 'inner';

    if (false) {
      var neverExecuted = 'but still hoisted';
    }

    console.log(neverExecuted); // undefined
  }

  testHoisting();
}

// 10. Var with eval and dynamic scope
function evalAndVar() {
  var localVar = 'local';

  eval('var evalVar = "created by eval";');
  eval('localVar = "modified by eval";');

  console.log(evalVar); // Accessible
  console.log(localVar); // Modified

  return { evalVar, localVar };
}

// 11. Var and strict mode violations
function strictModeViolations() {
  'use strict';

  // These would throw in strict mode but might be caught by linters
  var undefinedVar;
  var reservedWords = {
    eval: 'eval as property',
    arguments: 'arguments as property',
  };

  // Octal literals (strict mode violation)
  var octal = 0o123; // Should be caught

  return { undefinedVar, reservedWords, octal };
}

// 12. Var with this and global object
function thisAndVar() {
  var that = this;
  var self = this;

  // Accidental global creation
  function accidentalGlobal() {
    noVarKeyword = 'global without var'; // Creates global
    window.anotherGlobal = 'explicit global'; // Explicit global
  }

  accidentalGlobal();

  return { that, self };
}

// 13. Var with async/await anti-patterns
async function asyncVarAntiPatterns() {
  var asyncVar = 'async';

  // var in async loop
  for (var i = 0; i < 3; i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    console.log(i); // Will log 3, 3, 3
  }

  // var with promises
  var promiseResults = [];
  for (var j = 0; j < 3; j++) {
    promiseResults.push(
      Promise.resolve(j).then((result) => result + j), // j will be 3
    );
  }

  return Promise.all(promiseResults);
}

// 14. Var with destructuring and default values
var { missing = 'default' } = {};
var [missingArray = 'default'] = [];
var { nested: { deep = 'deep default' } = {} } = {};

// 15. Var with complex patterns
var complex = {
  data: [1, 2, 3],
  meta: { count: 3 },
};

var {
  data: [first, second, ...rest],
  meta: { count },
} = complex;

// 16. Var and type annotations (violations)
var typedVar: string = 'typed var';
var anyVar: any = 'any var';
var unknownVar: unknown = 'unknown var';

// 17. Var with function parameters
function varParams(param1: string, param2: number = 42) {
  var localVar = param1 + param2;
  return localVar;
}

// 18. Var in different contexts
var inGlobal = 'global scope';

function functionContext() {
  var inFunction = 'function scope';

  if (true) {
    var inBlock = 'block scope (but really function scope)';
  }

  try {
    var inTry = 'try scope';
  } catch (e) {
    var inCatch = 'catch scope';
  }

  return { inFunction, inBlock, inTry, inCatch };
}

// 19. Var with object methods
var obj = {
  method: function () {
    var inMethod = 'method scope';
    return inMethod;
  },

  arrowMethod: () => {
    var inArrow = 'arrow method scope';
    return inArrow;
  },
};

// 20. Var and module pattern violations
var modulePattern = (function () {
  var privateVar = 'private';
  var publicVar = 'public';

  return {
    getPublic: function () {
      return publicVar;
    },
    setPublic: function (value) {
      publicVar = value;
    },
  };
})();

// 21. Var with IIFE
var iifeResult = (function () {
  var iifePrivate = 'IIFE private';
  return iifePrivate + ' result';
})();

// 22. Var and prototype pollution
function prototypePollution() {
  var obj = {};
  var key = '__proto__';
  var value = { polluted: true };

  obj[key] = value; // Potential prototype pollution

  return obj;
}

export {
  mixed1,
  mixed2,
  mixed3,
  functionDecl,
  nestedVarScopes,
  varLoopClosureIssues,
  hoistingEdgeCases,
  evalAndVar,
  strictModeViolations,
  thisAndVar,
  asyncVarAntiPatterns,
  functionContext,
  obj,
  modulePattern,
  iifeResult,
  prototypePollution,
};
