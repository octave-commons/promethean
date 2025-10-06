<!-- SYMPKG:PKG:BEGIN -->
# @promethean/dev
**Folder:** `packages/dev`  
**Version:** `0.0.1`  
**Domain:** `_root`
```mermaid
graph LR
  A["@promethean/dev"]
  D1["@promethean/event"]
  D2["@promethean/examples"]
  D3["@promethean/http"]
  D4["@promethean/ws"]
  R1["@promethean/tests"]
  A --> D1["@promethean/event"]
  A --> D2["@promethean/examples"]
  A --> D3["@promethean/http"]
  A --> D4["@promethean/ws"]
  R1["@promethean/tests"] --> A
  click D1 "../event/README.md" "@promethean/event"
  click D2 "../examples/README.md" "@promethean/examples"
  click D3 "../http/README.md" "@promethean/http"
  click D4 "../ws/README.md" "@promethean/ws"
  click R1 "../tests/README.md" "@promethean/tests"
```
## Dependencies
- [@promethean/event](../event/README.md)
- [@promethean/examples](../examples/README.md)
- [@promethean/http](../http/README.md)
- [@promethean/ws](../ws/README.md)
## Dependents
- [@promethean/tests](../tests/README.md)
<!-- SYMPKG:PKG:END -->