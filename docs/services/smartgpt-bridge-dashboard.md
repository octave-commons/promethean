# SmartGPT Bridge Dashboard $OpenAPI-driven$

The dashboard at `/` is now generated from the live OpenAPI spec exposed by the bridge at `/openapi.json`. It renders all documented endpoints and lets you execute requests without writing code.

## Highlights

- Reads `/openapi.json` and renders every path/method.
- Auto-generates request forms from JSON Schema (strings, numbers, booleans, arrays, enums, and objects).
- Shows JSON responses with pretty-printing.
- Respects your auth token (Bearer) saved in the UI.
- Detects SSE responses and shows a live stream with a Stop button $e.g., `/agent/stream`$.
- Groups endpoints by tag (or first path segment) and supports quick filtering.
- Favorites: star endpoints to pin them at the top.
- Examples: pick from `requestBody.examples` to prefill forms; defaults respected.

## Usage

1. Start the service:
    - `pnpm -C services/ts/smartgpt-bridge start`
2. Start the proxy service:
    - `pnpm -C services/js/proxy start`
3. Start the frontend service:
    - `pnpm --filter @promethean/frontend-service dev`
4. Open the dashboard:
$$
    -
$$http://localhost:4500/smartgpt-dashboard/
5. (Optional) Paste your bearer token and click Save to enable protected routes.
6. Browse the endpoint cards and submit requests.
    - Use the filter box or tag picker to narrow what you see.
    - Click the star to favorite frequently used endpoints.

## Notes

- Agent endpoints $e.g., `/agent/start`$ provide request/response examples in the OpenAPI; the dashboard shows those fields by default.
- SSE streaming endpoints display response headers but not a live stream yet; for live logs, use the existing `/agent/stream` with curl or your browser.
    - The dashboard now renders live SSE output for endpoints that advertise `text/event-stream` in the spec.

## Contributing

The dashboard is implemented as Web Components (Lit) in:

- `sites/smartgpt-dashboard/wc/components.js`
- `sites/smartgpt-dashboard/index.html`

Keep the OpenAPI spec $`src/spec.js`$ accurate—UI updates automatically.
