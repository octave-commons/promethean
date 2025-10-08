```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean/ds
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
  A["@promethean/ds"]
  R1["@promethean/agent-ecs"]
  R2["@promethean/fs"]
  R3["@promethean/kanban-processor"]
  R4["@promethean/worker"]
  R1["@promethean/agent-ecs"] --> A
  R2["@promethean/fs"] --> A
  R3["@promethean/kanban-processor"] --> A
  R4["@promethean/worker"] --> A
  click R1 "../agent-ecs/README.md" "@promethean/agent-ecs"
  click R2 "../fs/README.md" "@promethean/fs"
  click R3 "../kanban-processor/README.md" "@promethean/kanban-processor"
  click R4 "../worker/README.md" "@promethean/worker"
```
## Dependencies
- _None_
## Dependents
- @promethean/agent-ecs$../agent-ecs/README.md
- @promethean/fs$../fs/README.md
- @promethean/kanban-processor$../kanban-processor/README.md
- @promethean/worker$../worker/README.md
```
<!-- SYMPKG:PKG:END -->
```