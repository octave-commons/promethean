Archetype-based ECS in TS with 64-bit component masks, SoA columns, O(1) add/remove via archetype graph edges, changed-flags per component, queries with all/any/none/changed, and a CommandBuffer for safe structural edits during ticks.

Suggested path: `shared/js/prom-lib/ds/ecs.ts`.

Highlights:
- Entities: versioned indices; alive checks
- Components: define with defaults and onAdd/onRemove hooks
- Archetypes: mask → table with SoA columns; fast move between tables
- Queries: `makeQuery({ all, any, none, changed })` + `world.iter(...)`
- Ticking: `beginTick()/endTick()` clears changed flags; `CommandBuffer.flush()`

Related: [graph-ds] [../../unique/index|unique/index]

#tags: #js #ecs #soa #performance

