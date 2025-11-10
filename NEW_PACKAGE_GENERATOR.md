## Package scaffolding

- Use Nx to create new workspace packages:
  - Libraries: `nx g tools:package <name> --preset library`
  - Fastify services: `nx g tools:package <name> --preset service`
  - Frontends: `nx g tools:package <name> --preset frontend`
- The generator writes `src/` with functional TypeScript entry points, AVA stubs in `src/tests`, and `static/` for assets that should be served by `@fastify/static`.
- Service presets include an OpenAPI template under `static/openapi`, and you must expose it through `/openapi.json` using `@fastify/swagger` and `@fastify/swagger-ui`.
- Frontend presets emit `src/frontend/` alongside `dist/frontend/` targets; serve `dist/frontend` and `static` together from Fastify when deploying UI shells.
- All packages compile to `dist/` with ESM outputs that keep `.js` extensions in import statements.
- Every package stays GPL-3.0-only and follows our functional TypeScript conventions (pure functions, immutability, composition).
