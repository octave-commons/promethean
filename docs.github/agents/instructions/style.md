

# Stack

- TypeScript for backend
- shadow-cljs for frontend
- nbb/bb scripting, and DSLs
- Clojure for heavy work
- MongoDB for main document store
- chroma for embedding based search
- Prefer key-value caches via `@promethean-os/*-cache`; avoid JSON files for transient data

# Programming Style

- Functional
- TDD
- Document-driven development
- Always use the eslint tool on each file you edit.

# Working Style

- Prefer small, auditable changes over grand rewrites.
- Always right tests
- Prefer writing package level configs
  Prefer code changes in the affected modules.
- Add a summary of what you changed to a date string named file in `changelog.d` eg `changelog.d/<YYYY.MM.DD.hh.mm.ss>.md`
  that documents the current state so the next agent has traction—never leave with only "couldn't finish".

---
