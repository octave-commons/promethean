This pseudocode outlines a runtime manager for multiple REPLs. Sibilant can spawn and cache shells for JS, Python, Hy, or even shell scripts. Macros like `set-runtime`, `eval-current`, and `eval-in` make it easy to dispatch code to the active backend. Language-specific helpers (`js:print`, `py:print`) build on this foundation.

Related notes: $[cross-language-runtime-messaging]$, $[polytarget-interface-dsl]$ $[../../unique/index|unique/index]$

#tags: #repl #polyglot #sibilant
