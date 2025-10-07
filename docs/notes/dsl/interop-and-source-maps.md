Lisp/Sibilant interop macros for JS $`js/get`, `js/set!`, `js/call`, `js/new`, `js/global`$ inlined by the JS emitter, plus an end-to-end source map pipeline $Lisp spans → IR sym → JS mappings with base64 VLQ$, returning `{ code, map }`.

Suggested paths:
- Macros: `shared/js/prom-lib/compiler/lisp/interop.macros.ts`
- Expander: `expand.ts` installs interop macros
- Emitter: `compiler/jsgen.ts` inlines `$get/$set/$call/$new/$g` and builds source maps
- Lowerer: `compiler/lower.ts` records `symSpan`
- Driver: `compiler/lisp/driver.ts` returns `{ code, map }` or inline data URL

Related: $[sibilant-metacompiler-overview]$, $[template-based-compilation]$ $[../../unique/index|unique/index]$

#tags: #dsl #sibilant #source-maps #interop

