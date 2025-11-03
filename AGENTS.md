# Promethean

> _“Stealing fire from the gods to grant man the gift of knowledge and wisdom.”_
> Using **cloud LLMs** to make **local LLMs** smarter, specialized, and autonomous.

> **Note to self:** This is a solo operation with AI helpers. You're building something massive while being fundamentally "short-handed" even with automation. Be kind to yourself, focus on what matters, and remember that progress compounds.

## Build/Lint/Test Commands

**Root level (all packages):**

- `pnpm build` - Build all packages
- `pnpm test` - Test all packages
- `pnpm lint` - Lint all packages
- `pnpm typecheck:all` - Typecheck all packages

**Single package:**

- `pnpm --filter @promethean-os/<pkg> build`
- `pnpm --filter @promethean-os/<pkg> test`
- `pnpm --filter @promethean-os/<pkg> lint`
- `pnpm --filter @promethean-os/<pkg> typecheck`

**Single test file:**

- `pnpm --filter @promethean-os/<pkg> exec ava path/to/test.test.js`

## Testing

- Ava (tests live in `src/tests`).
- Test logic does not belong in module logic
- define **ports** (your own minimal interfaces),
- provide **adapters** for external services like Mongo/Chroma/level/redis/sql/etc,
- have a **composition root** that wires real adapters in prod,
- and in tests either inject fakes directly or **mock at the module boundary** (ESM-safe) without touching business code.
- **No test code in prod paths.** Ports/DI keeps boundaries explicit.
- **Deterministic & parallel-friendly.** No shared module singletons leaking between tests.
- **Easier refactors.** Adapters are the only place that knows Mongo/Chroma APIs.
- **Right tool for each test level.**
  - Fakes for unit speed;
  - containers for realistic integration.
  - The principle is well-established: mock _your_ interfaces, not vendor clients.
- `esmock` provides native ESM import mocking and has examples for AVA. It avoids invasive "test hook" exports.

---

---

## 📂 Repository Structure

```
scripts/   # deprecated build/test/deploy
packages/  # JS/TS modules
tests/     # unit & integration tests
docs/      # system-level markdown docs
sites/     # deprecated UIs/dashboards
configs/   # base configuration
pseudo/    # throwaway scripts, pseudocode, retained for transparency
```

---

## 🧱 Local Package Commands

MUST ALWAYS USE **locally scoped commands**:

```bash
pnpm --filter @promethean-os/<pkg> test
pnpm --filter @promethean-os/<pkg> build
pnpm --filter @promethean-os/<pkg> clean
pnpm --filter @promethean-os/<pkg> typecheck
pnpm --filter @promethean-os/<pkg> start
pnpm --filter @promethean-os/<pkg> exec node ./dist/index.ts
```

---

## 🧭 Operational Notes

**The Essentials (actually important):**

- Always run bash commands from **package root** - saves so much confusion
- File changes auto-commit with LLM-generated messages - one less thing to think about
- Avoid `cd ... && anything...` - it's confusing and error-prone
- Skip dynamic imports unless absolutely necessary

### Docs

Read these if you need to, all documents should be connected in a graph.
Unconnected documents should have links added here or to another document.
All documents must be reachable through a link somewhere.
The documentation must be completely traversable .

#### Development Patterns

- [[docs/development/file-based-operations-pattern.md]] - Standard patterns for file scanning and operations
- [[docs/documentation-to-code-linking-system.md]] - Documentation and code bridging system

#### System Documentation

- [[docs/agile/kanban-cli-reference.md]]
- [[docs/agile/process.md]]
- [[docs/agile/rules/kanban-transitions.clj]]
- [[operational-notes]]
- [[HUMANS]]
- [[HOME]]
- [[STYLE]]
- [[BOARD_COMMANDS]]
- [[TYPE_CLASS_PACKAGE_STRUCTURE_GUIDE]]
- [[MANIFESTO]]

#### Setup & Configuration

- [[docs/setup/environment.md]]
- [[docs/setup/clojurescript-lsp.md]]

#### API & Architecture

- [[docs/api-architecture.md]]
- [[docs/api-standards.md]]
- [[docs/design/agent-os-api-specs.md]]
- [[docs/MCP_AUTHORIZATION_ARCHITECTURE.md]]

#### Design & Architecture

- [[docs/design/overview.md]]
- [[docs/design/enso.md]]
- [[docs/design/nexus.md]]
- [[docs/design/agent-os-architecture.md]]
- [[docs/design/enso-protocol/index.md]]

#### Package Documentation

- [[docs/packages/cephalon/README.md]]
- [[docs/packages/security/README.md]]
- [[docs/packages/shadow-conf/README.md]]

#### Operations & Git

- [[docs/ops/versioning_policy.md]]
- [[docs/ops/version_matrix.md]]
- [[docs/git/branching.md]]
- [[docs/git/rulesets.md]]

---

## ⚖️ License

All packages use:

```
"license": "GPL-3.0-only"
```

<!--  LocalWords:  traversable
 -->
