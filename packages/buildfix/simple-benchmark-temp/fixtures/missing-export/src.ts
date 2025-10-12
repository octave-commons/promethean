// ERROR: Function 'helper' is used but not exported
// ERROR_CODE: TS2305
function helper() {
  return "hello";
}

// Usage in another module expects this to be exported
export function main() {
  return helper();
}