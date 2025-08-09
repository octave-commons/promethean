A design for a polymorphic DSL where each language backend exposes an `Interface` namespace (e.g., `js.Interface`, `py.Interface`). Runtimes are spawned as REPLs and cached, while macros proxy calls via `eval-in`. Namespaced macros and caches per backend enable unified control across multiple languages.

Related notes: [polyglot-repl-interface](polyglot-repl-interface.md), [cross-language-runtime-messaging](cross-language-runtime-messaging.md) [unique/index](../../unique-notes/index.md)

#tags: #dsl #interface #polyglot
