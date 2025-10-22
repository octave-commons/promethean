// Real-time violations - triggering opencode edit diagnostics
// These should trigger immediate feedback as I type

// 1. Missing semicolons (should trigger immediately)
let missingSemicolon = "test"

// 2. Undefined variables (immediate error)
console.log(undefinedVariable)

// 3. Type errors (immediate TypeScript error)
const number: string = 42

// 4. Class declaration (should trigger no-restricted-syntax immediately)
class RealtimeClass {
    constructor() {}
}

// 5. Import errors (immediate)
import { NonExistentExport } from './non-existent-file'

// 6. Syntax errors (immediate parsing error)
const brokenSyntax = {

// 7. Var usage (immediate no-var error)
var realtimeVar = "should trigger error"

// 8. Any type (immediate @typescript-eslint/no-explicit-any)
const anyValue: any = "test"

// 9. Missing return type (immediate)
function noReturnType(param) {
    return param
}

// 10. Reassigning const (immediate error)
const constValue = "immutable"
constValue = "reassigned"