# Spec: clj-hacks Babashka/Clojure Setup Workflow

## Objective & Context

- Resume from prior session summary: deliver a guided workflow for installing Babashka + Clojure CLI tooling, wiring Tree-sitter Java bindings, and running the `clj-hacks` package's prepare/build/lint/test/verify pipeline.
- Target audience is new to Clojure; instructions must be explicit, reproducible, and reference the existing bb tasks + Clojure aliases.

## Key References

- `packages/clj-hacks/deps.edn:1-25` — declares Clojure/core deps alongside `io.github.bonede/tree-sitter*` libs plus lint/test/compile/verify aliases.
- `packages/clj-hacks/src/clj_hacks/automation.clj:1-29` — wraps the `clojure -P/-M:<alias>` commands that bb tasks expose (prepare/build/lint/test) and enforces `target/classes` creation.
- `bb/src/clj_hacks/tasks.clj:1-9` + `bb.edn:1-54` — registers bb tasks `clj-hacks:{prepare,build,lint,test}` so users can run `bb clj-hacks:lint` instead of raw `clojure` commands.
- `packages/clj-hacks/README.md:69-305` — documents prerequisites (Clojure CLI, Babashka, Java) and reiterates key commands including the Tree-sitter verification step at lines 299-304.
- `packages/clj-hacks/verify.clj:1-11` — entrypoint invoked by `clojure -A:verify <path>` to run the Emacs-lisp adapter (`clj_hacks.mcp.adapter_elisp/read-full`).

## Existing Issues / Signals

- `#1670 Guard MCP JSON adapter against nil server specs` — open issue (2025-10-09) potentially impacts adapter stability once tooling is installed.
- `#1668 Guard MCP JSON adapter against nil server specs` — duplicate/related issue; flag for awareness during verification.

## Existing PRs

- `gh pr list -L 5` returned no rows on 2025-11-12, so no open PR overlaps to coordinate with.

## Requirements

1. Document prerequisite installations (Babashka, Clojure CLI tools, Java 17+, and ensuring `clojure` & `bb` executables on PATH).
2. Explain how to provision the Tree-sitter Java bindings (ensure Maven/`clojure -P` pulls `io.github.bonede/tree-sitter{,-elisp}` into `packages/clj-hacks/target/m2`).
3. Provide both bb task workflow (`bb clj-hacks:prepare|build|lint|test`) and raw `clojure -M:alias` equivalents, clarifying working directory expectations.
4. Describe the AOT build (`-M:compile`) and lint/test entrypoints (`:lint`, `:test`) plus when to re-run `prepare!`.
5. Walk through running the verify step `clojure -A:verify packages/clj-hacks/fixtures/generated.el` and interpreting success/failure.
6. Offer troubleshooting for dependency resolution, classpath issues, native Tree-sitter loading, and generated artifact locations (`target/classes`, `fixtures/generated.el`).

## Definition of Done

- Reproducible, ordered checklist covering installation → dependency prep → build/lint/test/verify operations.
- Includes both bb and raw Clojure CLI invocations, with notes on environment variables, PATH, and error recovery tips.
- Highlights where generated assets land and how to clean/rebuild safely.
- References relevant repo files/aliases so future contributors can trace instructions back to source configuration.

## Phase Plan

- **Phase 1 – Repository Review (complete):** inspect deps.edn, bb tasks, verify entrypoint, README context.
- **Phase 2 – Spec Authoring (in progress):** capture references, requirements, DoD, and tracking info (this document).
- **Phase 3 – Guidance Delivery (up next):** craft the user-facing workflow + troubleshooting playbook grounded in the above references.

## Open Questions

- None blocking: instructions assume macOS/Linux shell; Windows-specific install commands may be deferred unless requested.
