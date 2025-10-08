```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean/security
```
**Folder:** `packages/security`
```
```
**Version:** `0.0.1`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean/security"]
  D1["@promethean/platform"]
  R1["@promethean/agent"]
  R2["@promethean/cephalon"]
  R3["@promethean/discord"]
  A --> D1["@promethean/platform"]
  R1["@promethean/agent"] --> A
  R2["@promethean/cephalon"] --> A
  R3["@promethean/discord"] --> A
  click D1 "../platform/README.md" "@promethean/platform"
  click R1 "../agent/README.md" "@promethean/agent"
  click R2 "../cephalon/README.md" "@promethean/cephalon"
  click R3 "../discord/README.md" "@promethean/discord"
```
## Dependencies
- @promethean/platform$../platform/README.md
## Dependents
- @promethean/agent$../agent/README.md
- @promethean/cephalon$../cephalon/README.md
- @promethean/discord$../discord/README.md
```
<!-- SYMPKG:PKG:END -->
```