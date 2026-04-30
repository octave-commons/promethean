# Vexx OpenAPI And Client Generation

## Status
Draft

## Purpose

Define a canonical OpenAPI contract for `vexx` and a generation strategy for the languages we actually use:

- Clojure
- TypeScript
- Go
- Rust
- Python
- C
- C++
- Lua

The goal is not "one generator to rule them all."
The goal is:

1. one canonical wire contract
2. one repeatable generation workflow
3. thin idiomatic clients for each language
4. no drift between service behavior and SDK behavior

## Current vexx surface

Current live endpoints:
- `GET /v1/health`
- `POST /v1/cosine/matrix`
- `POST /v1/cosine/topk`

Current semantics:
- explicit `device` selection (`AUTO|CPU|GPU|NPU`)
- explicit `requireAccel`
- explicit degraded/fallback reporting
- stable JSON response envelopes

## Canonical artifact

The canonical contract should live in:

- `orgs/open-hax/vexx/openapi/v1.yaml`

Adjacent generated artifacts:

- `orgs/open-hax/vexx/clients/typescript/`
- `orgs/open-hax/vexx/clients/go/`
- `orgs/open-hax/vexx/clients/rust/`
- `orgs/open-hax/vexx/clients/python/`
- `orgs/open-hax/vexx/clients/c/`
- `orgs/open-hax/vexx/clients/cpp/`
- `orgs/open-hax/vexx/clients/clojure/`
- `orgs/open-hax/vexx/clients/lua/`

## OpenAPI scope

## V1 operations

### `GET /v1/health`
Response should include:
- default device
- auto order
- require-accel default
- model path

### `POST /v1/cosine/matrix`
Request:
- `left: number[][]`
- `right: number[][]`
- `device?: AUTO|CPU|GPU|NPU`
- `requireAccel?: boolean`

Response:
- `ok`
- `service`
- `device`
- `provider`
- `requestedDevice`
- `degraded`
- `rows`
- `cols`
- `matrix: number[]`
- `attempts: Attempt[]`
- `model-path`

### `POST /v1/cosine/topk`
Request:
- `query: number[]`
- `candidates: { id: string; embedding: number[] }[]`
- `k: number`
- `device?: AUTO|CPU|GPU|NPU`
- `requireAccel?: boolean`

Response:
- `ok`
- `service`
- `device`
- `provider`
- `requestedDevice`
- `degraded`
- `matches: { id: string; rank: number; score: number }[]`
- `inputCount`
- `attempts: Attempt[]`
- `model-path`

## Shared schemas

Required components:
- `Device`
- `Attempt`
- `ErrorEnvelope`
- `HealthResponse`
- `CosineMatrixRequest`
- `CosineMatrixResponse`
- `CosineTopKCandidate`
- `CosineTopKRequest`
- `CosineTopKMatch`
- `CosineTopKResponse`

## Contract rules

1. Error responses must be schema-defined.
2. `attempts` must be preserved in the schema, even when empty.
3. `requestedDevice` must be preserved, even when `AUTO` resolves to another device.
4. Responses must not hide degraded fallback behavior.
5. Auth should be modeled as optional bearer auth.

## Generation strategy

We should not pretend all languages have equally good off-the-shelf OpenAPI generators.

So the strategy is two-tier:

### Tier A - direct OpenAPI generation where the ecosystem is decent
- TypeScript
- Go
- Rust
- Python
- C
- C++

### Tier B - thin generated wrappers from the canonical operation/schema model
- Clojure
- Lua

This keeps OpenAPI canonical without forcing bad generated code in languages where support is weak.

## Recommended tooling by language

### TypeScript
Preferred output:
- typed fetch client
- minimal dependency footprint

Recommended approach:
- `openapi-typescript` for types
- small generated wrapper over `fetch`

Reason:
- we want ergonomic TS clients in `openplanner`, `cephalon-ts`, `eros-eris-field-app`, and similar runtimes

### Go
Recommended approach:
- `oapi-codegen`

Reason:
- solid ecosystem fit
- good typed request/response generation

### Rust
Recommended approach:
- `openapi-generator` rust client or equivalent generator with `reqwest`

Reason:
- enough for a first SDK; can be hand-tuned later if one consumer becomes serious

### Python
Recommended approach:
- `openapi-python-client`

Reason:
- acceptable for ecosystem completeness
- should remain optional and not become the canonical runtime path

### C
Recommended approach:
- `openapi-generator` C client

Reason:
- useful as the lowest common denominator when a native integration wants raw HTTP calls

### C++
Recommended approach:
- generate from OpenAPI where viable, or build a thin wrapper over the generated C client

Reason:
- direct C++ OpenAPI generator quality varies
- a C core plus thin C++ wrapper is more stable than bespoke hand-rolled HTTP for each consumer

### Clojure
Recommended approach:
- generate EDN/JSON schema artifacts plus a thin idiomatic client namespace

Preferred output:
- `vexx.client`
- small `health`, `cosine-matrix`, `cosine-topk` functions
- data-in/data-out maps

Reason:
- mainstream OpenAPI generators do not produce good Clojure clients
- a thin generated wrapper around canonical operation definitions is the pragmatic path

### Lua
Recommended approach:
- generate a minimal Lua HTTP client from the canonical operation manifest rather than relying on OpenAPI generator support directly

Preferred output:
- one module
- explicit request builders
- explicit JSON encode/decode contract

Reason:
- generator support is weak
- our Lua consumers are likely to value a tiny deterministic client over large generated scaffolding

## Build pipeline

## Source of truth
1. hand-maintained `openapi/v1.yaml`

## Generated artifacts
2. typed clients under `clients/*`

## Verification
3. each generated client must pass:
- schema validation
- one health call smoke test
- one cosine-matrix smoke test
- one cosine-topk smoke test

## Regeneration contract

Add one command in `orgs/open-hax/vexx`:

- `pnpm gen:clients` or equivalent repo-local generation script

That command should:
1. validate the OpenAPI spec
2. regenerate all supported clients
3. run minimal smoke validation against a live local `vexx`

## Repo layout proposal

```text
orgs/open-hax/vexx/
  openapi/
    v1.yaml
  clients/
    typescript/
    go/
    rust/
    python/
    c/
    cpp/
    clojure/
    lua/
  scripts/
    generate-clients.*
```

## Language-specific output expectations

### Must-have first wave
- TypeScript
- Clojure
- Go
- Rust

These cover the languages most likely to touch `vexx` soon.

### Second wave
- Python
- C
- C++
- Lua

These should still be specified now so the OpenAPI contract does not accidentally become TS-only.

## Consumer mapping

### Clojure
- `orgs/open-hax/vexx` itself
- future Clojure callers

### TypeScript
- `orgs/open-hax/openplanner`
- `orgs/octave-commons/eros-eris-field-app`
- future `cephalon-ts` migration

### Go / Rust / C / C++ / Lua / Python
- not all immediate,
- but the spec should make them first-class possible clients instead of afterthoughts

## Definition of done

This spec is successful when:

1. `openapi/v1.yaml` exists and validates
2. `vexx` has at least TypeScript and Clojure clients generated from the canonical contract
3. generation for Go, Rust, Python, C, C++, and Lua is specified with real output locations and smoke-test expectations
4. no consumer needs to hand-roll another ad hoc `fetch` wrapper once the generated clients exist
