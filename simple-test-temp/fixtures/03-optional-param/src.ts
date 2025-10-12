// ERROR: Expected 1 arguments, but got 0
// ERROR_CODE: TS2554
function greet(name: string) {
  return `Hello, ${name}!`;
}

// Called without argument
export function main() {
  return greet();
}