# Vexx Clojure Client

## Status
Draft

## Parent

- `specs/drafts/vexx-openapi-client-generation.md`
- `orgs/open-hax/vexx/openapi/v1.yaml`

## Purpose

Define the idiomatic Clojure client for `vexx`.

This should not be a giant generated Java-style SDK.
It should be a thin map-in/map-out client derived from the canonical OpenAPI contract.

## Output location

- `orgs/open-hax/vexx/clients/clojure/`

## Design rule

The Clojure client should be generated from the canonical operation/schema model,
but the final public API should still look like Clojure.

That means:
- kebab-case public functions
- Clojure maps in and out
- thin HTTP layer
- optional auth
- no class-heavy wrapper nonsense

## Proposed namespace surface

```clojure
(ns vexx.client)

(defn create-client [opts])
(defn health [client])
(defn cosine-matrix [client request])
(defn cosine-topk [client request])
```

## Proposed client options

```clojure
{:base-url "http://127.0.0.1:8788"
 :api-key  "..."}
```

## Request/response style

### Requests
- plain Clojure maps using JSON-compatible keys
- wrapper may accept kebab-case and normalize to wire format

### Responses
- plain Clojure maps
- preserve wire fields like `requestedDevice` and `model-path`
- optionally provide a normalized kebab-case variant later, but not at the expense of wire-trace clarity

## Recommended implementation strategy

1. generate schema/operation metadata from `openapi/v1.yaml`
2. generate a tiny wrapper namespace from that metadata
3. keep HTTP implementation minimal and replaceable

Why not rely on generic OpenAPI generators directly:
- Clojure generator support is weak
- generated clients often ignore idiomatic map-first design

## Suggested internals

Public namespace:
- `vexx.client`

Generated support data:
- `vexx.client.spec` or EDN/JSON operation metadata

HTTP adapter:
- small function over the chosen HTTP client

## Expected consumers

Near-term:
- future Clojure callers of `vexx`
- possible Knoxx/ingestion-side use if a direct Clojure cosine client becomes useful

Later:
- service wrappers or orchestration code that wants explicit device-targeted cosine scoring without touching TypeScript

## Verification

The Clojure client is done when:

1. it can call `/v1/health`
2. it can call `/v1/cosine/matrix`
3. it can call `/v1/cosine/topk`
4. auth/no-auth both work as expected
5. the public interface stays small and map-oriented

## Non-goal

Do not turn the Clojure client into a second copy of `vexx` internals.

It is a wire client, not another runtime backend.
