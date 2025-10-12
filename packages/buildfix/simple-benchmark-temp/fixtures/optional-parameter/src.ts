// ERROR: Function parameter should be optional
// ERROR_CODE: TS2554
export function greet(name: string) {
  return `Hello, ${name}!`;
}

// Called without argument
export function main() {
  return greet();
}