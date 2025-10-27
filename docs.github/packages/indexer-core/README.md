```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/indexer-core
```
**Folder:** `packages/indexer-core`
```
```
**Version:** `0.0.1`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/indexer-core"]
  D1["@promethean-os/embedding"]
  D2["@promethean-os/file-indexer"]
  D3["@promethean-os/level-cache"]
  D4["@promethean-os/utils"]
  R1["@promethean-os/indexer-service"]
  R2["@promethean-os/smartgpt-bridge"]
  A --> D1["@promethean-os/embedding"]
  A --> D2["@promethean-os/file-indexer"]
  A --> D3["@promethean-os/level-cache"]
  A --> D4["@promethean-os/utils"]
  R1["@promethean-os/indexer-service"] --> A
  R2["@promethean-os/smartgpt-bridge"] --> A
  click D1 "../embedding/README.md" "@promethean-os/embedding"
  click D2 "../file-indexer/README.md" "@promethean-os/file-indexer"
  click D3 "../level-cache/README.md" "@promethean-os/level-cache"
  click D4 "../utils/README.md" "@promethean-os/utils"
  click R1 "../indexer-service/README.md" "@promethean-os/indexer-service"
  click R2 "../smartgpt-bridge/README.md" "@promethean-os/smartgpt-bridge"
```
## Dependencies
- @promethean-os/embedding$../embedding/README.md
- @promethean-os/file-indexer$../file-indexer/README.md
- @promethean-os/level-cache$../level-cache/README.md
- @promethean-os/utils$../utils/README.md
## Dependents
- @promethean-os/indexer-service$../indexer-service/README.md
- @promethean-os/smartgpt-bridge$../smartgpt-bridge/README.md
```
<!-- SYMPKG:PKG:END -->
```