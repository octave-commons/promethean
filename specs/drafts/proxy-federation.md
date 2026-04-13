# Proxy Federation

## Status
Draft

## Summary
Allow one Open Hax proxy to federate with other Open Hax proxies and/or remote OpenAI-compatible proxy peers, so routing can span multiple proxy clusters while preserving trust, tenancy, observability, and loop safety.

This is a focused companion to `specs/drafts/open-hax-openai-proxy-multitenancy-user-model.md`, which is the canonical draft for issuer identity, delegated/share keys, ATproto/DID trust, and proof-of-possession details.

## Why now
The proxy already has strong foundations for federation:
- multi-provider routing
- provider-scoped account rotation
- provider base URL maps
- OpenAI-compatible surface area
- telemetry and suitability views

However, there is no explicit federation design yet:
- no remote peer abstraction
- no tenant propagation contract
- no loop-prevention protocol
- no trust/auth handshake for proxy-to-proxy calls
- no peer capability advertisement

## Existing foundations
Relevant existing specs/features:
- `specs/drafts/endpoint-agnostic-routing.md`
- `specs/drafts/latency-health-routing-v1.md`
- `specs/drafts/provider-model-analytics-page.md`
- OpenAI-compatible routing and provider abstraction in current runtime

## Desired capabilities
- Treat a remote proxy as a routable provider/peer.
- Route requests across peer proxies when local providers are degraded or unavailable.
- Expose peer capabilities/health/model support.
- Preserve request provenance, observability, and model/provider suitability insight.
- Prevent recursive federation loops.
- Preserve tenant isolation end-to-end.

## Open questions
- Should federation peers be static config, dynamic registry, or both? Proposed v1: static config with health-checked peer registry.
- Is the remote surface raw OpenAI-compatible only, or should peers expose a richer control API? Proposed v1: both; OpenAI-compatible for data plane, control API for capability/health metadata.
- How many hops are allowed? Proposed v1: one federated hop by default.
- How is trust established? Proposed v1: mutual bearer/service credentials with explicit peer IDs and allowlists.

## Risks
- Recursive loops can create billing storms and request amplification.
- Federation without tenant scoping would leak data or credentials.
- Suitability/health scores can become misleading if peer-reported data is mixed with local observed data without provenance.

## Implementation phases

### Phase 1: Peer model and control plane
- Define peer config (`peer_id`, base URLs, auth, allowed tenants, allowed models).
- Add peer health/capability discovery endpoint and data model.
- Add explicit provenance headers and hop count headers.

### Phase 2: Data-plane federation
- Treat peers as provider routes for eligible models.
- Support remote OpenAI-compatible forwarding with peer auth.
- Add loop prevention (`x-open-hax-hop-count`, peer IDs, request IDs).

### Phase 3: Tenant propagation and trust
- Propagate tenant identity and authorization context safely.
- Enforce allowlists for which tenants/models can traverse which peers.
- Ensure remote analytics mark peer provenance distinctly.

### Phase 4: Federation-aware observability
- Show local vs peer-served performance.
- Track provider/peer/model suitability separately.
- Add peer-level analytics and failure visibility.

### Phase 5: Verification
- Add tests for loop prevention, peer fallback, tenant scoping, and provenance headers.
- Verify degraded peer behavior does not poison local routing decisions.

## Affected areas
- routing/provider abstractions
- request forwarding headers
- auth/service credential model
- analytics and request log provenance
- deployment config for peer registration

## Definition of done
- A proxy can route through an authorized remote peer safely.
- Federation preserves tenant boundaries and request provenance.
- Loop-prevention is enforced by protocol, not convention.
