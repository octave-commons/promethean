// Test file for type checking
const test: string = 123; // This should cause a type error

function testFunction(param: number): string {
  return param.toString();
}

const result = testFunction('not a number'); // This should also cause an error

// Added new line to trigger write hook
