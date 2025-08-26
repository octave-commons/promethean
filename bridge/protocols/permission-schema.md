# Permission Schema

Defines how agents declare allowed actions and resource access.

## Fields

- **default**: `allow` or `deny` applied when no rule matches.
- **rules**: list of permission entries, each with:
  - **action**: action identifier (e.g., `file.read`, `network.request`).
  - **scope**: resource pattern or path (`"docs/**"`, `"*"`).

## YAML Example
```yaml
default: deny
rules:
  - action: file.read
    scope: docs/**
```

## JSON Example
```json
{
  "default": "allow",
  "rules": [
    {"action": "*", "scope": "*"}
  ]
}
```

See [[aionian-pulse-rhythm-model.md|docs/notes/math/aionian-pulse-rhythm-model.md]] for related mathematical reasoning.
