export function greet(name: string) {
  return `Hello, ${name}!`;
}

// Called without argument
export function main() {
  return greet();
}