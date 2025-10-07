---
project: Promethean
hashtags: [#sibilant, #modernization, #legacy, #report]
---

# Sibilant Modernization Report

This report maps the old `legacy/sibilant-modules/riatzukiza.github.io/` tree into the new `shared/sibilant/src/` structure. It highlights which modules have been ported, which remain missing, and which were experimental hacks.

## Legacy → Shared Mapping

### Headers (Legacy stdlib prototypes)
- `headers/async.sibilant` → *no direct match yet, candidate for `common/workers/`*
- `headers/core.sibilant` → *absorbed into multiple `common/*.sibilant` files*
- `headers/html.sibilant` → `common/dom.sibilant`
- `headers/http.sibilant` → `node/http/`
- `headers/interface.sibilant` → `common/interface.sibilant`
- `headers/repl.sibilant` → `node/repl/`
- `headers/shell.sibilant` → `node/shell/`

### Experiments (Hack folder)
- `hack/red-black.cpp` / `hack/red-black.js` → candidate for `common/data-structures/`
- `hack/floor-div.sibilant` → candidate utility, likely folded into `common/utils.sibilant`
- `hack/tile.pseudo.sibilant` → evolved into `common/tiles.sibilant`
- `hack/camera.js`, `panning-camera.js`, `sprite-shader.js` → graphics experiments, partially related to `common/gl.sibilant`
- `hack/probability-scratch.lith` → remains unported, legacy math experiment.

### Scripts
- `scripts/dev.sibilant`, `server.sibilant`, `watch.sibilant` → superseded by modern build tooling, not ported.

### Server
- `server/*.js` (basic Node server) → replaced by dedicated Promethean `services/`.

### Shaders
- GLSL files → still relevant for rendering, not directly integrated into `shared/sibilant` yet.

### Docs & Kanban
- Markdown notes, kanban boards, chats → project management artifacts, not code.

## Current Shared Sibilant Structure
- `common/` → contains domain-level DSL: `database.sibilant`, `game.sibilant`, `gl.sibilant`, `grid.sibilant`, etc.
- `node/` → contains runtime bindings (FS, HTTP, REPL, Shell).
- `browser/` → placeholder for future browser-specific bindings.

## Recommendations
1. **Finalize core mapping:** Move any still-useful legacy headers (`async.sibilant`, math experiments) into `shared/sibilant/src/common/`.
2. **Integrate data structures:** Port `red-black.js/cpp` into `common/data-structures/` with a clean Sibilant interface.
3. **Deprecate hacks:** Archive `hack/` materials in `legacy/` — only port those that still serve a purpose.
4. **Shaders strategy:** Decide whether GLSL belongs in `shared/sibilant/` as `glsl/` or in a higher-level rendering service.
5. **Tooling cleanup:** Remove old `scripts/*.sibilant` in favor of Promethean’s standardized build system.

---

✅ This document can be updated iteratively as more ports are completed.
