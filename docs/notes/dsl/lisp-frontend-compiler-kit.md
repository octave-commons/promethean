Macro-first Lisp frontend: reader with quote/quasiquote/unquote/splice, hygienic-ish macros with gensym, macroexpander, quasiquote engine, and Lispy AST → core Expr bridge for existing IR/JS backend.

Suggested layout: `shared/js/prom-lib/compiler/lisp/` (syntax.ts, reader.ts, macros.ts, qq.ts, …).

Related: $[compiler-kit-foundations]$, $[interop-and-source-maps]$ $[../../unique/index|unique/index]$

#tags: #lisp #macros #compiler #dsl

