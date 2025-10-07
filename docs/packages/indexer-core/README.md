<!-- SYMPKG:PKG:BEGIN -->
# @promethean/indexer-core
**Folder:** `packages/indexer-core`  
**Version:** `0.0.1`  
**Domain:** `_root`
```mermaid
graph LR
  A["@promethean/indexer-core"]
  D1["@promethean/embedding"]
  D2["@promethean/file-indexer"]
  D3["@promethean/level-cache"]
  D4["@promethean/utils"]
  R1["@promethean/indexer-service"]
  R2["@promethean/smartgpt-bridge"]
  A --> D1["@promethean/embedding"]
  A --> D2["@promethean/file-indexer"]
  A --> D3["@promethean/level-cache"]
  A --> D4["@promethean/utils"]
  R1["@promethean/indexer-service"] --> A
  R2["@promethean/smartgpt-bridge"] --> A
  click D1 "../embedding/README.md" "@promethean/embedding"
  click D2 "../file-indexer/README.md" "@promethean/file-indexer"
  click D3 "../level-cache/README.md" "@promethean/level-cache"
  click D4 "../utils/README.md" "@promethean/utils"
  click R1 "../indexer-service/README.md" "@promethean/indexer-service"
  click R2 "../smartgpt-bridge/README.md" "@promethean/smartgpt-bridge"
```
## Dependencies
- [@promethean/embedding](../embedding/README.md)
- [@promethean/file-indexer](../file-indexer/README.md)
- [@promethean/level-cache](../level-cache/README.md)
- [@promethean/utils](../utils/README.md)
## Dependents
- [@promethean/indexer-service](../indexer-service/README.md)
- [@promethean/smartgpt-bridge](../smartgpt-bridge/README.md)
<!-- SYMPKG:PKG:END -->