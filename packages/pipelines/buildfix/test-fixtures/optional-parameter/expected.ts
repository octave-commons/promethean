export function greet(name?: string) {
  return `Hello, ${name || "world"}!`;
}

// Called without argument
export function main() {
  return greet();
}