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

## Sentinel code structure (planned)

- Entry/config: `services/sentinel/src/promethean/sentinel/{core,config,defaults,events}.cljs`
- Actions: `actions/{embedded,handler_nb,runner}.cljs`
- Watchers: `watchers/engine.cljs`
- Apps/PM2: `apps/{model,pm2_bridge}.cljs`
- Services/Docker: `services/{model,docker_bridge}.cljs`
- Git: `git/{hooks_runner,nbb_hooks}.cljs`
- GitHub: `gh/{client,runner,model}.cljs`
- Nx: `nx/{model,runner}.cljs`
- Client: `client/node.cljs`
- Utilities: `util/io.cljs`

### Docs

Read these if you need to, all documents should be connected in a graph.
Unconnected documents should have links added here or to another document.
All documents must be reachable through a link somewhere.
The documentation must be completely traversable .

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

### 🔗 Cross-Repository Documentation

- **[CROSS_REFERENCES.md](./CROSS_REFERENCES.md)** - Complete cross-references to all related repositories
- **[Workspace AGENTS.md](../AGENTS.md)** - Main workspace documentation
- **[Repository Index](../REPOSITORY_INDEX.md)** - Complete repository overview

---

## ⚖️ License

All packages use:

```
"license": "GPL-3.0-only"
```

<!--  LocalWords:  traversable
 -->
