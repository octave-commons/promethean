---
uuid: "a36ca331-c7e6-4d24-beb1-b0a36c8a4007"
title: "Verify Ollama Handler"
slug: "verify-openai-server-deployment"
status: "incoming"
priority: "P2"
labels: ["task"]
created_at: "2025-10-23T00:00:00.000Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Description

Set up a staging deployment for `@promethean-os/openai-server` and validate it
behind the shared Fastify gateway. The automated tests cover the queue and API
shape, but we still need human confirmation that the Swagger UI renders and the
web component dashboard behaves correctly in a browser.

## 📦 Requirements
- Provision the service using the new package and expose `/v1/chat/completions`,
  `/queue/snapshot`, `/docs`, and `/openapi.json`.
- Confirm that `/queue/snapshot` updates live while posting chat completion
  requests.
- Capture screenshots of the Swagger UI and dashboard for docs.

## ✅ Acceptance Criteria
- Deployment URL circulated in `#promethean-platform`.
- Screenshots archived under `docs/ui` with descriptive filenames.
- Manual validation notes stored alongside the deployment checklist.
```
#infrastructure #manual-validation
```
