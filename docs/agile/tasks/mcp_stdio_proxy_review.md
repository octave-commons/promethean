---
uuid: "3c3a6f8b-2a8d-4b3e-8d63-2b7d1e8f7a91"
title: "MCP stdio proxy: code review + minimal hardening"
slug: "mcp_stdio_proxy_review"
status: "in_progress"
priority: "P2"
labels: ["mcp", "proxy", "stdio", "bugfix"]
created_at: "2025-10-11T01:03:32.222Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




















## 🛠️ Scope
Review MCP stdio proxy (`packages/mcp/src/proxy/*`, `src/bin/proxy.ts`) and land low-risk fixes.

## Findings
- **Fragile init sequence** in `StdioHttpProxy.initializeMcpServer()` (fixed sleeps, special-case for `serena`).
- **SDK path likely broken**: `SdkStdioProxy.start()` calls `client.connect(this.stdio)` which will own `stdio.onmessage`; our own handler set in ctor will be overwritten ⇒ HTTP never sees responses.
- **PATH resolution on Windows**: `isExecutableFile` checks POSIX exec bit which is meaningless on Windows; `resolveCommandPath` may fail to detect candidates.
- **Routing**: exact-match only; `/path` works but `/path/...` 404s.

## Changes shipped (small, auditable)
- **Longest-prefix routing** in `packages/mcp/src/bin/proxy.ts` so subpaths like `/serena/mcp/tools` resolve to the proxy route.

## Proposed next fixes (not yet applied)
- Make `isExecutableFile()` treat existence as executable on Windows; pass `platform` through to avoid relying on POSIX bits.
- Either (A) remove `SdkStdioProxy` until it’s properly bridged, or (B) rework to forward via the SDK client rather than the raw transport.
- Replace hardcoded sleeps with request/response handshake + timeout.
- Add auto-restart/backoff if a stdio server exits unexpectedly.

## Acceptance Criteria
- [x] Route prefix handling fixed.
- [ ] Windows PATH resolution fixed.
- [ ] SDK path validated or disabled behind config (`:proxy "manual"`).
- [ ] Init handshake robust (no magic sleeps).

## Links
- `packages/mcp/src/bin/proxy.ts`
- `packages/mcp/src/proxy/stdio-proxy.ts`
- `packages/mcp/src/proxy/sdk-stdio-proxy.ts`
- `packages/mcp/src/proxy/proxy-factory.ts`
- `packages/mcp/src/proxy/config.ts`

#in-progress



















