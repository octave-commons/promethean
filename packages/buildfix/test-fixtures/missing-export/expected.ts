export function helper() {
  return "hello";
}

// Usage in another module expects this to be exported
export function main() {
  return helper();
}