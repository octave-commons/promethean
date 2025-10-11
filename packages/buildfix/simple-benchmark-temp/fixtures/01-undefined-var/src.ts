// ERROR: Cannot find name 'undefinedVariable'
// ERROR_CODE: TS2304
export function testFunction() {
  return undefinedVariable;
}

export function undefinedVariable() {
    return void;
}
