---
uuid: "5fb47630-6822-4ecf-a035-625ed0e733bf"
title: "Assemble unified @promethean/omni-service host"
slug: "assemble-omni-service-host"
status: "blocked"
priority: "P2"
labels: ["omni", "service"]
created_at: "2025-10-11T19:22:57.819Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🎯 Outcome

Stand up `@promethean/omni-service`, a Fastify application that mounts REST, GraphQL, WebSocket, and MCP adapters on a single server/port with shared auth, RBAC, and lifecycle hooks.

## 📥 Inputs

- [docs/architecture/omni/omni-service-roadmap.md]
- [docs/agile/tasks/author-omni-protocol-package.md]
- [docs/agile/tasks/extract-omni-core-services.md]

## ✅ Definition of Done

- [ ] Service package created with bootstrapping entrypoint and configuration docs.
- [ ] Auth/RBAC registered once; adapters compose via plugins.
- [ ] `/rest`, `/graphql`, `/ws`, `/mcp` routes respond to smoke tests.
- [ ] Nginx example config updated to proxy all interfaces through one domain/port.
- [ ] Automated smoke tests covering each interface executed in CI.

## 🪜 Steps

1. Wire Fastify app with shared context builder + lifecycle hooks.
2. Mount Omni REST/GraphQL/WebSocket adapters; embed MCP HTTP transport.
3. Provide start scripts + environment configuration examples.
4. Write integration smoke tests hitting all endpoints.
5. Document deployment guidance and update changelog.

## 🔗 Dependencies

- Omni protocol + core packages must be published.



