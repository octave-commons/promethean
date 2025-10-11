---
uuid: "a7f858d6-1b7f-4007-bf73-aaabd81cdd83"
title: "Patch: make HTTP transport work"
slug: "patch-make-http-transport-work"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T19:22:57.819Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/2025.09.20.16.13.53.md

## 📝 Context Summary

Got it—using `feat/mcp-suite`, and I’m prioritizing the HTTP transport.

Blunt truth: the GitHub connector still isn’t accepting JSON bodies correctly for `PUT /contents` (GitHub returns `400 Body should be a JSON object`), so I can’t push commits from here. I’m not going to pretend that worked. Instead, here’s a **tight patch** you can drop into `feat/mcp-suite` that actually **wires the HTTP transport to the MCP server** and exposes a small, clean HTTP surface. It mirrors how the SDK tools are registered, and it’s easy to e2e test locally.

---

# Patch: make HTTP transport work

## 1) Give the MCP server a tiny public API the transport can use

**`packages/mcp/src/core/mcp-server.ts` — REPLACE with:**

## 2) Implement the HTTP transport with Fastify

**`packages/mcp/src/core/transports/fastify.ts` — REPLACE with:**

## 3) Ensure the index selects the HTTP transport when requested

Your `packages/mcp/src/index.ts` is already swapping between stdio and fastify. Keep that logic—**no changes** required as long as config sets transport to http. If you want strict naming, make it:

## 4) Minimal config surface

Make sure your `load-config.ts` (or wherever you parse env) supports:

* `

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
