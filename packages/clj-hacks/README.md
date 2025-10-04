# clj-hacks

Utilities for experimenting with Emacs Lisp parsing using the Tree-sitter
runtime from Clojure.

## Tooling prerequisites

* [Babashka](https://babashka.org/) – used for the local automation entry point.
* [Clojure CLI tools](https://clojure.org/guides/install_clojure) – drives
  compilation, linting, and tests via `deps.edn` aliases.

Install both globally so the `bb` tasks can invoke them.

## Babashka tasks

The package exposes a set of Babashka entry points defined in
`bb/src/clj_hacks/tasks.clj`. Run them from the repository root:

```sh
bb clj-hacks:prepare   # downloads maven dependencies
bb clj-hacks:build     # AOT compiles elisp namespaces into target/classes
bb clj-hacks:lint      # executes clj-kondo against src/ and test/
bb clj-hacks:test      # runs clojure.test suites via cognitect test-runner
```

All tasks automatically resolve dependencies before executing. `build` will also
create `packages/clj-hacks/target/classes` when needed.

Verification from Clojure (Tree-sitter required)
-----------------------------------------------

Run verification directly from Clojure (not BB), since Tree-sitter is a Java library:

```sh
# From repo root
clojure -A:verify packages/clj-hacks/fixtures/generated.el
```

The verify task will print a parsed map from clj_hacks.mcp.adapter_elisp/read-full.

Notes:
- Ensure Tree-sitter Java bindings are available (deps are in packages/clj-hacks/deps.edn).
- The verify task is defined via the :verify alias and clj_hacks.verify.core/-main.
