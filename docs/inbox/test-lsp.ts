// Test TypeScript LSP integration
const message: string = 123; // Type error: assigning number to string

function brokenFunction(param: undefined): void {
  return param.toString(); // Error: Cannot read property 'toString' of undefined
}

export { brokenFunction };
