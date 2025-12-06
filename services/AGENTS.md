# Folder Guide: services/

Purpose: Deployable runtimes and daemons (HTTP/MCP/worker services) with their own configs and operational docs.

What belongs

- Service codebases, PM2/ecosystem configs, Docker/shadow-cljs setups.
- Service-specific docs, migration notes, and environment samples.
- Integration tests that exercise service boundaries.

Keep out

- Pure libraries (see packages/).
- Ad-hoc scripts or tooling (see tools/ or scripts/).
- Experimental prototypes (see experimental/).

Notes

- Document service env vars and ports in each service README.
- Prefer adapters/ports pattern; keep business logic in packages/ where possible.
- Several services are git submodules (e.g., `openai-server/`, `frontend-service/`); push changes to their upstream repos when present.
- Current services in repo: `autocommit/`, `frontend-service/`, `knowledge-graph/`, `openai-server/`.
