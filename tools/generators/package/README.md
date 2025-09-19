# Package Generator

The package generator scaffolds new workspace packages. Pass a `preset` when you
want opinionated layouts:

```bash
pnpm nx g ./tools/generators/package --name my-service --preset fastify-service
```

## `fastify-service` preset

The `fastify-service` preset wires up a Fastify service with health and
diagnostics endpoints, static asset mounts, and Swagger plumbing. The template
expects the following environment knobs at runtime:

- `SERVICE_PORT` (preferred) or `PORT` defines the listen port. The first valid
  integer wins, otherwise the server falls back to `4500`.
- `SERVICE_STATIC_DIRS` augments static mounts. Provide a colon-separated list of
  `prefix=directory` pairs. Relative directories resolve from the generated
  package root. Directories that do not exist are ignored.

By default the service exposes:

- `/health` and `/diagnostics` backed by `@promethean/web-utils`.
- Static assets from `dist/frontend` at `/<service-name>/` and from `static/` at
  `/<service-name>/static/`.
- `/docs` serving Swagger UI and `/openapi.json` exposing the OpenAPI document.

### Defining Swagger schemas

Routes should declare Fastify `schema` objects for request and response shapes.
`@fastify/swagger` reads those schemas to materialize `/openapi.json`. Populate
`schema.operationId`, `schema.tags`, and the `schema.response` map on each route
so the generated document stays accurate. The template seeds an empty
`components.schemas` object—extend it with shared schema definitions as you add
endpoints.

## Follow-up work for humans

- [ ] Configure CI to exercise generated services (build + tests) so new
      scaffolds stay green.
