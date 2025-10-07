---
$$
uuid: f7e50ece-c8c6-417a-98fb-61254084a9b7
$$
$$
created_at: '2025-09-04T17:17:25Z'
$$
filename: Promethean Package Structure
title: Promethean Package Structure
$$
description: >-
$$
  Defines the standardized directory structure and build commands for Promethean
  packages. Each package must include specific files like README.md, AGENTS.md,
  and a package.json with predefined build and test commands. The structure
  ensures consistent TypeScript compilation and testing workflows.
tags:
  - package structure
  - build commands
  - typeScript
  - standardization
$$
related_to_uuid:
$$
  - 9540bac6-310e-49be-ab72-98401ba13115
$$
related_to_title:
$$
  - Promethean Package Structure
references:
  - uuid: 9540bac6-310e-49be-ab72-98401ba13115
    line: 10
    col: 0
    score: 1
  - uuid: 9540bac6-310e-49be-ab72-98401ba13115
    line: 11
    col: 0
    score: 1
  - uuid: 9540bac6-310e-49be-ab72-98401ba13115
    line: 15
    col: 0
    score: 0.88
---
# Promethean constitution
- Every package in ./packages has a/an: ^ref-9540bac6-2-0 ^ref-33f8d3f5-2-0
  - `README.md`
  - `AGENTS.md`
  - `src/` which will always contain the following sub folders:
    - `tests`
    - `dist`
  - `package.json`with the commands: ^ref-9540bac6-8-0 ^ref-33f8d3f5-8-0
    - `build` compiles the typescript to `dist/`
    - `test` builds the package, then runs tests located in `dist/tests` ^ref-9540bac6-10-0
    - `clean` removes all build and installation artifacts related to the package. ^ref-9540bac6-11-0
    - `typecheck` validates the package conforms to the tsconfig files rules.
    - `lint` validates the package meets the projects linting standards
    - `format` Fixes automaticlly fixable issues with lint.
  - `tsconfig.json` A boiler plate tsconfig which ^ref-9540bac6-15-0
    - **Only** includes `./src/**/*`
    - extends `/config/tsconfig.*.json`
    - sets `rootDir` to `src`
    - sets `outDir` to `dist/`

Packages may also have:
- `static/` files served directly by a file server.
- `src/frontend` Frontend typescript code.
$$
ly** includes `./src/**/*`
$$
    - extends `/config/tsconfig.*.json`
    - sets `rootDir` to `src`
    - sets `outDir` to `dist/`

Packages may also have:
- `static/` files served directly by a file server.
- `src/frontend` Frontend typescript code.

## Package generator presets
- Use `nx g tools:package <name> --preset web-frontend` to scaffold a web component-ready frontend package. The preset mirrors the `dist/frontend` layout used by existing frontends and wires Nx targets for `build`, `test`, `lint`, and `typecheck`.
- Static assets should live under the generated `static/` directory so they can be mounted alongside `dist/frontend` by Fastify's static file handler or equivalent servers.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Package Structure](2025.09.04.17.17.25.md)
## Sources
- [Promethean Package Structure — L10]$2025.09.04.17.17.25.md#^ref-9540bac6-10-0$ (line 10, col 0, score 1)
- [Promethean Package Structure — L11]$2025.09.04.17.17.25.md#^ref-9540bac6-11-0$ (line 11, col 0, score 1)
- [Promethean Package Structure — L15]$2025.09.04.17.17.25.md#^ref-9540bac6-15-0$ (line 15, col 0, score 0.88)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
