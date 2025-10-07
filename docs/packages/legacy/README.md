$$
<!-- SYMPKG:PKG:BEGIN -->
$$
# @promethean/legacy
$$
**Folder:** `packages/legacy`
$$
$$
**Version:** `0.0.0`
$$
$$
**Domain:** `_root`
$$
```mermaid
graph LR
  A["@promethean/legacy"]
  D1["@promethean/apply-patch"]
  D2["@promethean/test-utils"]
  R1["@promethean/agent-ecs"]
  R2["@promethean/cephalon"]
  R3["@promethean/discord"]
  R4["@promethean/embedding"]
  R5["@promethean/file-watcher"]
  R6["@promethean/kanban-processor"]
  R7["@promethean/persistence"]
  A --> D1["@promethean/apply-patch"]
  A --> D2["@promethean/test-utils"]
  R1["@promethean/agent-ecs"] --> A
  R2["@promethean/cephalon"] --> A
  R3["@promethean/discord"] --> A
  R4["@promethean/embedding"] --> A
  R5["@promethean/file-watcher"] --> A
  R6["@promethean/kanban-processor"] --> A
  R7["@promethean/persistence"] --> A
  click D1 "../apply-patch/README.md" "@promethean/apply-patch"
  click D2 "../test-utils/README.md" "@promethean/test-utils"
  click R1 "../agent-ecs/README.md" "@promethean/agent-ecs"
  click R2 "../cephalon/README.md" "@promethean/cephalon"
  click R3 "../discord/README.md" "@promethean/discord"
  click R4 "../embedding/README.md" "@promethean/embedding"
  click R5 "../file-watcher/README.md" "@promethean/file-watcher"
  click R6 "../kanban-processor/README.md" "@promethean/kanban-processor"
  click R7 "../persistence/README.md" "@promethean/persistence"
```
## Dependencies
- $@promethean/apply-patch$$../apply-patch/README.md$
- $@promethean/test-utils$$../test-utils/README.md$
## Dependents
- $@promethean/agent-ecs$$../agent-ecs/README.md$
- $@promethean/cephalon$$../cephalon/README.md$
- $@promethean/discord$$../discord/README.md$
- $@promethean/embedding$$../embedding/README.md$
- $@promethean/file-watcher$$../file-watcher/README.md$
- $@promethean/kanban-processor$$../kanban-processor/README.md$
- $@promethean/persistence$$../persistence/README.md$
$$
<!-- SYMPKG:PKG:END -->
$$