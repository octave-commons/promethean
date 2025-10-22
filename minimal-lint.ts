// Minimal lint tests - just the basics to see if ESLint shows up
// Stripping down to the most basic violations

var x;
class Y {}
let z;

// Adding more violations
var globalVar1 = 'test1';
var globalVar2 = 'test2';
class AnotherClass {}
class YetAnotherClass {}
let anotherLet = 'test';
const mutableArray = [1, 2, 3];
mutableArray.push(4);
const mutableObject = { prop: 'value' };
mutableObject.newProp = 'new';
for (let i = 0; i < 5; i++) {
  console.log(i);
}
try {
  console.log('test');
} catch (error) {
  console.log(error);
}
