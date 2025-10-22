// Final lint test - one more attempt with different patterns
// Maybe the issue is with file naming or location

var testVar;
class TestClass {}
let testLet;

const testArray = [];
testArray.push(1);

const testObject = {};
testObject.prop = 'value';

for (let i = 0; i < 5; i++) {
  console.log(i);
}

try {
  console.log('test');
} catch (e) {
  console.log(e);
}

function testFunction(a, b, c, d, e, f) {
  return a + b + c + d + e + f;
}

const testAny: any = 'test';

const testRequire = require('fs');

module.exports = {};
