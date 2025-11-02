# Sites

This directory collects all frontend code for Promethean. Each subfolder contains a standalone HTML/JS frontend served by the `frontend-service`.

Current frontends:

- `smartgpt-dashboard` – OpenAPI-driven dashboard for SmartGPT Bridge.
- `llm-chat` – Minimal chat interface for the LLM service with simple tool calls via SmartGPT Bridge.
- `markdown-graph` – Force-directed visualization of markdown link graphs.
- `health-dashboard` – Realtime viewer of heartbeat metrics from Promethean services.

Run `pnpm --filter @promethean-os/frontend-service dev` from the repo root and visit `http://localhost:4500/<site>/` to view a frontend. Future agents should place any web UI or dashboard code here.

All network requests from these frontends are routed through the proxy service at `http://localhost:8080`. For example:

- LLM Chat calls `/llm/*` which the proxy forwards to the LLM service.
- SmartGPT Dashboard calls `/bridge/*` which the proxy forwards to the SmartGPT Bridge service.
