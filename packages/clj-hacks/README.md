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

## Nx integration

`packages/clj-hacks/project.json` is wired to the Babashka tasks, so the
standard Nx workflows delegate to the Lisp toolchain:

```sh
pnpm nx run ts-clj-hacks:build
pnpm nx run ts-clj-hacks:lint
pnpm nx run ts-clj-hacks:test
```

These commands call the same Babashka tasks listed above, allowing Nx
automation and local development to stay in sync.

## Linting and tests

Linting uses `clj-kondo` with configuration sourced from `deps.edn`. Tests rely
on `cognitect-labs/test-runner`. Suites live in `packages/clj-hacks/test` using
standard `clojure.test` namespaces.

## Manual follow-up

Verify that team machines have Babashka and the Clojure CLI installed globally
so the delegated Nx tasks work outside CI.
