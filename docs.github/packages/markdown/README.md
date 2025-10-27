```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/markdown
```
**Folder:** `packages/markdown`
```
```
**Version:** `0.0.1`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/markdown"]
  D1["@promethean-os/fs"]
  R1["@promethean-os/boardrev"]
  R2["@promethean-os/docops"]
  R3["@promethean-os/kanban"]
  R4["@promethean-os/kanban-processor"]
  R5["@promethean-os/tests"]
  A --> D1["@promethean-os/fs"]
  R1["@promethean-os/boardrev"] --> A
  R2["@promethean-os/docops"] --> A
  R3["@promethean-os/kanban"] --> A
  R4["@promethean-os/kanban-processor"] --> A
  R5["@promethean-os/tests"] --> A
  click D1 "../fs/README.md" "@promethean-os/fs"
  click R1 "../boardrev/README.md" "@promethean-os/boardrev"
  click R2 "../docops/README.md" "@promethean-os/docops"
  click R3 "../kanban/README.md" "@promethean-os/kanban"
  click R4 "../kanban-processor/README.md" "@promethean-os/kanban-processor"
  click R5 "../tests/README.md" "@promethean-os/tests"
```
## Dependencies
- @promethean-os/fs$../fs/README.md
## Dependents
- @promethean-os/boardrev$../boardrev/README.md
- @promethean-os/docops$../docops/README.md
- @promethean-os/kanban$../kanban/README.md
- @promethean-os/kanban-processor$../kanban-processor/README.md
- @promethean-os/tests$../tests/README.md
```
<!-- SYMPKG:PKG:END -->
```