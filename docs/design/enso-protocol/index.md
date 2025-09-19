# Enso Protocol Design Set

The Enso Protocol (ENSO-1) enables rooms of humans and agents to exchange
events, media streams, and shared context with strong guarantees around
causality, privacy, and capability negotiation. This design set replaces the
former `docs/design/enso.md` monolith with focused references that track the
state of the protocol and its supporting packages.

## Reading Map

1. [Overview and Goals](01-overview.md)
2. [Transport and Envelope Framing](02-transport-and-framing.md)
3. [Rooms, Sessions, and Capability Handshake](03-rooms-and-capabilities.md)
4. [Flow Control and Reliability](04-flow-control-and-reliability.md)
5. [Tools, Voice, and Stream Semantics](05-tools-and-streams.md)
6. [Security, Signatures, and Guardrails](06-security-and-guardrails.md)
7. [SDK Surface and Implementation Notes](07-sdk-and-implementation.md)
8. [Model Context Protocol Interop](08-mcp-integration.md)
9. [Assets, Derivations, and Messaging](09-assets-and-derivations.md)
10. [Caching and Content Addressing](10-caching.md)
11. [Privacy Profiles and Retention Policy](11-privacy-and-retention.md)
12. [Context Management and Data Curation](12-context-management.md)
13. [Package Roadmap and Demo Plan](13-package-roadmap.md)

## Conventions

* All TypeScript examples assume native ESM, strict type checking, and
  immutable data handling.
* JSON examples show canonical wire messages. Omitted properties follow the
  relevant schema defaults.
* Mermaid diagrams illustrate message flow and room topology.
* Each document is scoped so it can be used as a standalone reference as well
  as part of this set.

## Human Follow-up Task

*Validate the reorganised protocol docs with the wider team.* Share this bundle
with a human operator to confirm the structure works for their workflows and to
collect any missing requirements before locking the v0.1 draft.
