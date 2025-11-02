# Model Context Protocol Interop

Enso integrates with the Model Context Protocol (MCP) so rooms can mount
external tool servers without leaving the Enso framing model.

## Capability Flags

During the `hello` handshake participants declare the following capabilities:

* `mcp.client` – participant can initiate MCP mounts.
* `mcp.server:<id>` – participant hosts an MCP server under the given ID.

These augment the standard `tool.call` and `tool.host` capabilities.

## Mounting Remote Servers

```json
{ "kind": "event", "type": "mcp.mount",
  "payload": {
    "serverId": "gitlab-prod",
    "transport": { "kind": "http-stream", "url": "https://mcp.acme.dev/gitlab" },
    "exposeTools": true,
    "exposeResources": ["repo/*"],
    "labels": { "env": "prod", "scope": "scm" }
  }}
```

The gateway establishes the JSON-RPC session, runs `tools/list` and
`resources/list`, and mirrors the results as tool advertisements inside the
room.

## Announcing Local Servers

```json
{ "kind": "event", "type": "mcp.announce",
  "payload": {
    "serverId": "fs-local",
    "tools": [ /* MCP tool descriptors */ ],
    "resources": [ /* MCP resource descriptors */ ]
  }}
```

Messages are mirrored as `tool.advertise` events so all participants can invoke
the mounted tools through standard Enso semantics.

## Tool Calls via MCP

```json
{ "kind": "event", "type": "tool.call",
  "payload": {
    "callId": "uuid",
    "provider": "mcp",
    "serverId": "gitlab-prod",
    "name": "gitlab.find_issue",
    "args": { "q": "login bug", "project": "app/web" },
    "ttlMs": 8000
  }}
```

Gateways translate this event into the MCP `tools/call` request, stream partial
results as `tool.partial` if available, and return the completion as
`tool.result`.

## Streaming Alignment

Long-running MCP calls can emit incremental output. Gateways map those
partials to `stream` envelopes e.g., `codec: "text/utf8"` so existing Enso
clients display consistent progress updates.

## Security Considerations

* Mount ACLs restrict who may expose remote MCP servers.
* Per-server scope manifests specify which tools and resources are visible to
  the room.
* MCP responses inherit Enso signatures and cache semantics, ensuring a single
  audit trail.
