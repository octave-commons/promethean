---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Repo structure design"
conversation_id: 68b483eb-35d8-8328-894e-8aece8aeab8d
create_time: 08/31/2025 at 12:18 PM
update_time: 08/31/2025 at 12:34 PM
---

# Title: Repo structure design

Created: 08/31/2025 at 12:18 PM
Last Updated: 08/31/2025 at 12:34 PM
Chat URL: https://chat.openai.com/c/68b483eb-35d8-8328-894e-8aece8aeab8d


>[!nexus_user] **User** - 08/31/2025 at 12:18 PM
> we are flattening and simplifying our source code organization to just packages/
> We are nuking python entirely. Don't care. Everything I might "need" it for, I can use existing docker images. It simplifies everything. if I absolutely *have* to use python, I will use clojure to tap into it.
<!-- UID: be762259-72d4-4321-b432-ea09a630a556 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 12:18 PM
> Heard. Flat monorepo under `packages/`, zero Python in-tree, containers for any Python you *must* touch, and Clojure can bridge to Py when needed. Here’s a tight, ready-to-apply baseline that matches your constraints.
> 
> # Repo shape (lean + predictable)
> 
> ```
> .
> ├─ packages/
> │ ├─ api-gateway/ # Fastify + Zod, versioned routes, OpenAPI/Swagger
> │ ├─ cephalon/ # core stream router libs (ts)
> │ ├─ heartbeat/ # your liveness client/server (ts)
> │ ├─ agents/ # agent definitions, prompts, runner (ts)
> │ ├─ core/ # shared utils (no side effects)
> │ └─ ui/ # optional: web ui (vite/next), can add later
> ├─ images/
> │ └─ ts-service.docker # single generic Dockerfile for all TS services
> ├─ compose/
> │ └─ stack.yaml # local stack; no SaaS tokens; you own it
> ├─ config/
> │ ├─ .env.example
> │ └─ nginx/ # (optional) keep NGINX config here if you use it
> ├─ docs/
> │ └─ architecture.md
> ├─ package.json
> ├─ pnpm-workspace.yaml
> ├─ tsconfig.base.json
> ├─ eslint.config.mjs
> ├─ .editorconfig
> └─ .gitignore
> ```
> 
> # Root workspace
> 
> ```yaml
> # pnpm-workspace.yaml
> packages:
>  - "packages/*"
> ```
> 
> ```json
> // package.json
> {
>  "name": "promethean",
>  "private": true,
>  "packageManager": "pnpm@9",
>  "scripts": {
>  "build": "pnpm -r build",
>  "dev": "pnpm -r --parallel dev",
>  "lint": "pnpm -r lint",
>  "typecheck": "pnpm -r typecheck",
>  "test": "pnpm -r test"
>  }
> }
> ```
> 
> ```json
> // tsconfig.base.json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "lib": ["ES2023"],
>  "module": "ESNext",
>  "moduleResolution": "Bundler",
>  "types": ["node"],
>  "allowSyntheticDefaultImports": true,
>  "esModuleInterop": true,
>  "forceConsistentCasingInFileNames": true,
>  "skipLibCheck": true,
>  "strict": true,
>  "noEmit": true,
>  "baseUrl": ".",
>  "paths": {
>  "@prom/*": ["packages/*/src"]
>  }
>  }
> }
> ```
> 
> ```js
> // eslint.config.mjs (flat config)
> import ts from "typescript-eslint";
> export default [
>  ...ts.configs.recommendedTypeChecked,
>  {
>  rules: {
>  "@typescript-eslint/consistent-type-imports": "error"
>  },
>  languageOptions: { parserOptions: { projectService: true } }
>  }
> ];
> ```
> 
> # Generic Dockerfile (kept out of code)
> 
> ```dockerfile
> # images/ts-service.docker
> FROM node:22-alpine AS deps
> WORKDIR /app
> COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
> COPY packages ./packages
> RUN corepack enable && pnpm -r install --frozen-lockfile
> 
> FROM node:22-alpine AS runner
> WORKDIR /app
> ENV NODE_ENV=production
> COPY --from=deps /app /app
> USER node
> CMD ["pnpm","-r","--filter","${SERVICE}", "start"]
> ```
> 
> # Compose (minimal, local-only, no SaaS)
> 
> ```yaml
> # compose/stack.yaml
> version: "3.9"
> services:
>  api:
>  build:
>  context: ..
>  dockerfile: images/ts-service.docker
>  args: { }
>  environment:
>  SERVICE: api-gateway
>  NODE_ENV: production
>  working_dir: /app
>  command: ["pnpm","--filter","api-gateway","start"]
>  ports:
>  - "127.0.0.1:8080:8080"
>  networks: [prom]
> networks:
>  prom: {}
> ```
> 
> # Example: versioned API + OpenAPI/Swagger (Fastify + Zod)
> 
> ```json
> // packages/api-gateway/package.json
> {
>  "name": "@prom/api-gateway",
>  "type": "module",
>  "version": "0.1.0",
>  "scripts": {
>  "dev": "tsx src/server.ts",
>  "start": "node --enable-source-maps --no-warnings=ExperimentalWarning dist/server.js",
>  "build": "tsc -p tsconfig.json",
>  "typecheck": "tsc -p tsconfig.json --noEmit",
>  "lint": "eslint .",
>  "openapi": "curl -s http://localhost:8080/openapi.json | jq . > openapi.v1.json"
>  },
>  "dependencies": {
>  "fastify": "^5.0.0",
>  "@fastify/swagger": "^9.3.0",
>  "@fastify/swagger-ui": "^3.0.0",
>  "zod": "^3.23.8",
>  "fastify-type-provider-zod": "^1.0.0"
>  },
>  "devDependencies": {
>  "typescript": "^5.6.3",
>  "tsx": "^4.19.1",
>  "typescript-eslint": "^8.8.1",
>  "eslint": "^9.10.0"
>  }
> }
> ```
> 
> ```json
> // packages/api-gateway/tsconfig.json
> {
>  "extends": "../../tsconfig.base.json",
>  "compilerOptions": {
>  "outDir": "dist"
>  },
>  "include": ["src"]
> }
> ```
> 
> ```ts
> // packages/api-gateway/src/server.ts
> import Fastify from "fastify";
> import swagger from "@fastify/swagger";
> import swaggerUI from "@fastify/swagger-ui";
> import { ZodTypeProvider, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
> import { z } from "zod";
> 
> const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
> app.setValidatorCompiler(validatorCompiler);
> app.setSerializerCompiler(serializerCompiler);
> 
> await app.register(swagger, {
>  openapi: {
>  info: { title: "Promethean API", version: "1.0.0" },
>  servers: [{ url: "/v1" }]
>  }
> });
> await app.register(swaggerUI, { routePrefix: "/docs" });
> 
> const v1 = async (instance: typeof app) => {
>  instance.get(
>  "/health",
>  {
>  schema: {
>  response: {
>  200: z.object({ ok: z.literal(true), name: z.string(), ts: z.string() })
>  }
>  }
>  },
>  async () => ({ ok: true, name: "api-gateway", ts: new Date().toISOString() })
>  );
> 
>  instance.get(
>  "/echo/:msg",
>  {
>  schema: {
>  params: z.object({ msg: z.string() }),
>  response: { 200: z.object({ echoed: z.string() }) }
>  }
>  },
>  async (req) => ({ echoed: req.params.msg })
>  );
> };
> 
> app.register(v1, { prefix: "/v1" });
> 
> app.get("/openapi.json", async () => app.swagger());
> app.listen({ port: 8080, host: "0.0.0.0" });
> ```
> 
> This gives you:
> - Versioned routes (`/v1/*`)
> - `/openapi.json` (machine-readable)
> - `/docs` (Swagger UI)
> - No external providers/tokens
> 
> # Shared lib skeleton
> 
> ```json
> // packages/core/package.json
> {
>  "name": "@prom/core",
>  "version": "0.1.0",
>  "type": "module",
>  "exports": "./src/index.ts",
>  "scripts": { "build": "tsc -p tsconfig.json", "typecheck":"tsc -p tsconfig.json --noEmit", "lint":"eslint ." },
>  "devDependencies": { "typescript":"^5.6.3", "eslint":"^9.10.0", "typescript-eslint":"^8.8.1" }
> }
> ```
> 
> ```ts
> // packages/core/src/index.ts
> export const ok = () => true;
> ```
> 
> # Git hooks (no Python, no pre-commit jank)
> 
> ```bash
> # .git/hooks/pre-commit (make executable)
> #!/usr/bin/env bash
> set -euo pipefail
> pnpm -r lint
> pnpm -r typecheck
> ```
> 
> # Minimal `.gitignore`
> 
> ```
> node_modules
> dist
> .env
> .DS_Store
> ```
> 
> # (Optional) Clojure → Python bridge when absolutely necessary
> 
> ```clj
> ; deps.edn
> {:deps {clj-python/libpython-clj2 {:mvn/version "2.026"}}}
> ```
> 
> ```clj
> (ns py.bridge
>  (:require [libpython-clj2.python :as py]))
> (py/initialize!)
> (def np (py/import-module "numpy"))
> (-> (py/call-attr np "array" [1 2 3]) (py/call-attr "tolist")) ; => [1 2 3]
> ```
> 
> Run that inside a disposable Python container if you don’t even want Python on host.
> 
> # Migration checklist (fast + safe)
> 
> 1. Move TS services/libs into `packages/<name>/` 
>  - `git mv services/ts/<svc> packages/<svc>`
> 2. Kill all Python dirs & configs from repo (keep Docker images for Py elsewhere). 
>  - `git rm -r services/py */requirements*.txt Pipfile* .pre-commit-config.yaml`
> 3. Drop the root `tsconfig.base.json`, `pnpm-workspace.yaml`, `eslint.config.mjs` above.
> 4. Fix imports to `@prom/*` or relative (the `paths` mapping covers `@prom/*/src`).
> 5. `pnpm i && pnpm -r typecheck && pnpm -r build`
> 6. `docker compose -f compose/stack.yaml up --build`
> 
> If you want, I can also spit out a tiny scaffold script (`scripts/new-package.mjs`) to generate `packages/<name>` with these templates.
<!-- UID: d0c68963-f24b-4b86-b0e3-7c423e1c743b -->

---




>[!nexus_user] **User** - 08/31/2025 at 12:22 PM
> promeathean. the namespace is `@promethean` because we're not in the 80s, worried about every single byte of data. We are now. This is for AI. AI understand language. The more descriptive everything is, the better. So we don't use hacky short names.
<!-- UID: 235cd756-3e45-46aa-956e-3402bc141c6d -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 12:22 PM
> Got it—scope is `@promethean` everywhere. Here’s the tightened, ready-to-drop-in delta.
> 
> # Root config tweaks
> 
> ```json
> // tsconfig.base.json
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "lib": ["ES2023"],
>  "module": "ESNext",
>  "moduleResolution": "Bundler",
>  "types": ["node"],
>  "allowSyntheticDefaultImports": true,
>  "esModuleInterop": true,
>  "forceConsistentCasingInFileNames": true,
>  "skipLibCheck": true,
>  "strict": true,
>  "noEmit": true,
>  "baseUrl": ".",
>  "paths": {
>  "@promethean/*": ["packages/*/src"]
>  }
>  }
> }
> ```
> 
> ```js
> // eslint.config.mjs — ban legacy @prom/* and enforce @promethean/*
> import ts from "typescript-eslint";
> export default [
>  ...ts.configs.recommendedTypeChecked,
>  {
>  rules: {
>  "@typescript-eslint/consistent-type-imports": "error",
>  "no-restricted-imports": ["error", { "paths": [{ "name": "@prom/*", "message": "Use @promethean/*" }] }]
>  },
>  languageOptions: { parserOptions: { projectService: true } }
>  }
> ];
> ```
> 
> # Package names & imports
> 
> ```json
> // packages/core/package.json
> {
>  "name": "@promethean/core",
>  "version": "0.1.0",
>  "type": "module",
>  "exports": "./src/index.ts",
>  "scripts": { "build":"tsc -p tsconfig.json", "typecheck":"tsc -p tsconfig.json --noEmit", "lint":"eslint ." },
>  "devDependencies": { "typescript":"^5.6.3", "eslint":"^9.10.0", "typescript-eslint":"^8.8.1" }
> }
> ```
> 
> ```json
> // packages/api-gateway/package.json
> {
>  "name": "@promethean/api-gateway",
>  "type": "module",
>  "version": "0.1.0",
>  "scripts": {
>  "dev": "tsx src/server.ts",
>  "start": "node --enable-source-maps --no-warnings=ExperimentalWarning dist/server.js",
>  "build": "tsc -p tsconfig.json",
>  "typecheck": "tsc -p tsconfig.json --noEmit",
>  "lint": "eslint .",
>  "openapi": "curl -s http://localhost:8080/openapi.json | jq . > openapi.v1.json"
>  },
>  "dependencies": {
>  "fastify": "^5.0.0",
>  "@fastify/swagger": "^9.3.0",
>  "@fastify/swagger-ui": "^3.0.0",
>  "zod": "^3.23.8",
>  "fastify-type-provider-zod": "^1.0.0",
>  "@promethean/core": "workspace:*"
>  },
>  "devDependencies": {
>  "typescript": "^5.6.3",
>  "tsx": "^4.19.1",
>  "typescript-eslint": "^8.8.1",
>  "eslint": "^9.10.0"
>  }
> }
> ```
> 
> ```ts
> // packages/api-gateway/src/server.ts
> import Fastify from "fastify";
> import swagger from "@fastify/swagger";
> import swaggerUI from "@fastify/swagger-ui";
> import { ZodTypeProvider, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
> import { z } from "zod";
> import { ok } from "@promethean/core";
> 
> const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
> app.setValidatorCompiler(validatorCompiler);
> app.setSerializerCompiler(serializerCompiler);
> 
> await app.register(swagger, {
>  openapi: { info: { title: "Promethean API", version: "1.0.0" }, servers: [{ url: "/v1" }] }
> });
> await app.register(swaggerUI, { routePrefix: "/docs" });
> 
> app.get("/v1/health", { schema: { response: { 200: z.object({ ok: z.boolean() }) } } }, async () => ({ ok: ok() }));
> app.get("/openapi.json", async () => app.swagger());
> app.listen({ port: 8080, host: "0.0.0.0" });
> ```
> 
> # Compose/Docker update
> 
> ```dockerfile
> # images/ts-service.docker (unchanged flow, just note SERVICE is full package name)
> FROM node:22-alpine AS deps
> WORKDIR /app
> COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
> COPY packages ./packages
> RUN corepack enable && pnpm -r install --frozen-lockfile
> 
> FROM node:22-alpine AS runner
> WORKDIR /app
> ENV NODE_ENV=production
> COPY --from=deps /app /app
> USER node
> # Use full-scoped package filter, e.g. @promethean/api-gateway
> CMD ["pnpm","-r","--filter","${SERVICE}","start"]
> ```
> 
> ```yaml
> # compose/stack.yaml
> version: "3.9"
> services:
>  api:
>  build:
>  context: ..
>  dockerfile: images/ts-service.docker
>  environment:
>  SERVICE: "@promethean/api-gateway"
>  NODE_ENV: production
>  working_dir: /app
>  command: ["pnpm","--filter","@promethean/api-gateway","start"]
>  ports: ["127.0.0.1:8080:8080"]
>  networks: [prom]
> networks: { prom: {} }
> ```
> 
> # One-shot codemod to migrate `@prom/*` → `@promethean/*`
> 
> ```js
> // scripts/migrate-scope.mjs
> import { readFileSync, writeFileSync } from "node:fs";
> import { glob } from "node:fs/promises";
> const files = [
>  ...(await glob("**/*.{ts,tsx,mjs,cjs,js,json,md}", { dot: true })),
> ].filter(p => !p.includes("node_modules/") && !p.startsWith(".git/"));
> 
> for (const f of files) {
>  const s = readFileSync(f, "utf8");
>  const r = s
>  .replaceAll(/["@']@prom\//g, '"@promethean/')
>  .replaceAll(/'@prom\//g, "'@promethean/");
>  if (r !== s) writeFileSync(f, r);
> }
> console.log("✅ migrated @prom/* → @promethean/*");
> ```
> 
> Run:
> ```bash
> pnpm dlx tsx scripts/migrate-scope.mjs
> ```
> 
> # Diagram (current minimal deps)
> 
> ```mermaid
> graph LR
>  core["@promethean/core"]
>  api["@promethean/api-gateway"]
>  ceph["@promethean/cephalon"]
>  hb["@promethean/heartbeat"]
>  agents["@promethean/agents"]
> 
>  api --> core
>  ceph --> core
>  hb --> core
>  agents --> core
> ```
> 
> # Quick checklist
> 
> - Set `"name"` of every package to `@promethean/<pkg>`.
> - Update imports to `@promethean/*` (codemod above).
> - Replace compose filter/env `SERVICE` with full `@promethean/<pkg>` names.
> - Keep `paths` alias only for `@promethean/*`.
> 
> If you want, I’ll also throw in a tiny `scripts/new-package.mjs` that scaffolds a new `@promethean/<name>` with this setup.
<!-- UID: 578b56f4-eaa4-4705-bbfe-ceb5ca707038 -->

---


