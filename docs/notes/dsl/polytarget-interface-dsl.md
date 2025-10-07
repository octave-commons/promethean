A design for a polymorphic DSL where each language backend exposes an `Interface` namespace (e.g., `js.Interface`, `py.Interface`). Runtimes are spawned as REPLs and cached, while macros proxy calls via `eval-in`. Namespaced macros and caches per backend enable unified control across multiple languages.

Related notes: $[polyglot-repl-interface]$, $[cross-language-runtime-messaging]$ $[../../unique/index|unique/index]$

#tags: #dsl #interface #polyglot
