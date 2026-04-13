# Vexx TypeScript Client

## Status
Draft

## Parent

- `specs/drafts/vexx-openapi-client-generation.md`
- `orgs/open-hax/vexx/openapi/v1.yaml`

## Purpose

Define the first generated `vexx` client most of the workspace will actually use.

Primary consumers:
- `orgs/open-hax/openplanner`
- `orgs/octave-commons/eros-eris-field-app`
- `orgs/octave-commons/cephalon/packages/cephalon-ts`
- future `eta-mu` semantic graph consumers

## Output location

- `orgs/open-hax/vexx/clients/typescript/`

## Recommended generation shape

Two-step output:

1. generated OpenAPI types
2. thin handwritten or generated wrapper over `fetch`

Why:
- `openapi-typescript` gives good TS type output
- a tiny wrapper preserves ergonomic call sites and auth/base-url config without bringing in a heavy runtime

## Recommended toolchain

1. `openapi-typescript`
2. small local wrapper module

Not recommended as the first path:
- large axios-based generated clients
- runtime-heavy OpenAPI client packages

## Proposed package surface

```ts
export type { Device, Attempt, HealthResponse, CosineMatrixRequest, CosineMatrixResponse, CosineTopKRequest, CosineTopKResponse } from "./generated/types";

export interface VexxClientOptions {
  baseUrl: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
}

export interface VexxClient {
  health(): Promise<HealthResponse>;
  cosineMatrix(request: CosineMatrixRequest): Promise<CosineMatrixResponse>;
  cosineTopK(request: CosineTopKRequest): Promise<CosineTopKResponse>;
}

export function createVexxClient(options: VexxClientOptions): VexxClient;
```

## Runtime behavior rules

1. bearer auth is optional
2. `baseUrl` should be normalized once
3. non-2xx responses should decode `ErrorEnvelope` when possible
4. raw `fetch` should stay injectable for tests and non-Node runtimes

## Consumer migration targets

### First wave
- OpenPlanner fallback top-k offload
- Eros-Eris field app edge scoring

### Second wave
- Cephalon TS memory/context scoring
- Eta-Mu semantic graph analysis

## Verification

The TypeScript client is done when:

1. types generate from `openapi/v1.yaml`
2. one smoke test calls `/v1/health`
3. one smoke test calls `/v1/cosine/matrix`
4. one smoke test calls `/v1/cosine/topk`
5. OpenPlanner and Eros-Eris can adopt it without hand-rolled `fetch` duplication

## Migration note

Once this client exists, these current ad hoc call sites should move to it:
- `orgs/open-hax/openplanner/src/lib/mongo-vectors.ts`
- `orgs/octave-commons/eros-eris-field/src/semantic.ts`

That keeps future auth/header/retry logic from drifting.
