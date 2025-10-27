```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/ds
```
**Folder:** `packages/ds`
```
```
**Version:** `0.0.1`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/ds"]
  R1["@promethean-os/agent-ecs"]
  R2["@promethean-os/fs"]
  R3["@promethean-os/kanban-processor"]
  R4["@promethean-os/worker"]
  R1["@promethean-os/agent-ecs"] --> A
  R2["@promethean-os/fs"] --> A
  R3["@promethean-os/kanban-processor"] --> A
  R4["@promethean-os/worker"] --> A
  click R1 "../agent-ecs/README.md" "@promethean-os/agent-ecs"
  click R2 "../fs/README.md" "@promethean-os/fs"
  click R3 "../kanban-processor/README.md" "@promethean-os/kanban-processor"
  click R4 "../worker/README.md" "@promethean-os/worker"
```
## Dependencies
- _None_
## Dependents
- @promethean-os/agent-ecs$../agent-ecs/README.md
- @promethean-os/fs$../fs/README.md
- @promethean-os/kanban-processor$../kanban-processor/README.md
- @promethean-os/worker$../worker/README.md
```
<!-- SYMPKG:PKG:END -->
```