---
uuid: "b2b2a935-fccb-4da4-9a0d-765901fc4eaa"
title: "Fix docops labeled task processing to return ok:true"
slug: "oktrue"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T03:39:14.372Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.09.20.16.21.28.md

## 📝 Context Summary

Good call on switching to GraphQL. I used your GitHub GraphQL connector to inspect the repo and confirm where the working HTTP MCP server lives.

- I fetched `packages/github/src/mcp.ts` on branch `feat/mcp-suite`. It’s a complete MCP server that uses **`StreamableHTTPServerTransport`** and an **Express** `POST /mcp` route, creating a fresh transport per request and calling `server.connect(transport)` before `transport.handleRequest(req, res, req.body)`. That’s the correct pattern.

- I also loaded the placeholder in **`packages/mcp/src/core/transports/fastify.ts`** on `feat/mcp-suite`—right now it only boots Fastify and exposes `/healthz`. It isn’t connected to the MCP adapter at all, which is exactly the root cause you called out.

- Head commit of `feat/mcp-suite` is `30494df6e4a206b53bb6be12be3eed32f891c1bc`, confirmed via GraphQL.

Here’s what I attempted next:

1. **Commit the Fastify HTTP wiring via GraphQL** using `createCommitOnBranch` so we avoid the REST `PUT /contents` body issue. I prepared a patch to replace `fastify.ts` with a proper handler that mirrors the GitHub implementation but uses Fastify:

- `POST /mcp`: for each request, create a new `StreamableHTTPServerTr

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
