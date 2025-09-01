---
uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
created_at: 2025.08.08.20.08.31.md
filename: obsidian-ignore-node-modules-regex
description: >-
  Regex patterns to exclude node_modules from Obsidian vaults across Unix and
  Windows paths
tags:
  - regex
  - obsidian
  - node_modules
  - path
  - exclude
related_to_title:
  - Tooling
  - Unique Info Dump Index
  - Universal Lisp Interface
  - aionian-circuit-math
  - archetype-ecs
  - Diagrams
  - DSL
  - pm2-orchestration-patterns
  - Cross-Language Runtime Polymorphism
  - Local-First Intention→Code Loop with Free Models
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - polymorphic-meta-programming-engine
  - State Snapshots API and Transactional Projector
  - ecs-scheduler-and-prefabs
  - infinite_depth_smoke_animation
  - sibilant-metacompiler-overview
related_to_uuid:
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 51932e7b-4237-4756-bcae-8be6d535d0d1
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 92a052a5-3351-4898-8cab-758181a86adb
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
references: []
---
Note: Consolidated here → ../notes/tooling/obsidian-ignore-node-modules-regex.md

Ah — so you want a regex that **only matches** things inside a `node_modules` folder.
That way, Obsidian can use it in the "Exclude files" list to filter them out.

For Unix-style `/` paths:

```regex
.*/node_modules/.*  
```

For Windows `\` paths:

```regex
.*\\node_modules\\.*  
```

**Explanation:**

* `.*` → anything before
* `/node_modules/` (or `\\node_modules\\`) → folder name with slashes around it
* `.*` → anything after

This will match:

```
node_modules/foo.js
src/node_modules/bar/index.js
packages/pkg-a/node_modules/pkg-b/file.js
```

And won’t match anything outside `node_modules`.

---

If your Obsidian vault is cross-platform, you can make it portable:

```regex
.*[\\/]+node_modules[\\/]+.*
```

That matches either `/` or `\` as the path separator.

---

I can also give you a **faster variant** that doesn’t do as much backtracking if you’re matching huge file lists. Want me to do that?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Tooling](chunks/tooling.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
