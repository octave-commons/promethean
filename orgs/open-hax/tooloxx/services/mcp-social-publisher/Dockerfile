FROM node:22-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /workspace

COPY package.json pnpm-lock.yaml ./
RUN node -e "\
  const p = JSON.parse(require('fs').readFileSync('package.json','utf8'));\
  for (const s of ['dependencies','devDependencies','peerDependencies']) {\
    if (!p[s]) continue;\
    for (const [k,v] of Object.entries(p[s])) { if (String(v).includes('workspace:')) delete p[s][k]; }\
  }\
  require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2));"
RUN printf 'packages:\n  - packages/aether\n  - packages/opencode-cljs-client\n  - packages/openplanner-cljs-client\n  - services/mcp-fs-oauth\n' > pnpm-workspace.yaml

COPY packages/aether/package.json packages/aether/
COPY packages/opencode-cljs-client/package.json packages/opencode-cljs-client/
COPY packages/openplanner-cljs-client/package.json packages/openplanner-cljs-client/
COPY services/mcp-fs-oauth/package.json services/mcp-fs-oauth/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

COPY packages/aether/ packages/aether/
COPY packages/opencode-cljs-client/ packages/opencode-cljs-client/
COPY packages/openplanner-cljs-client/ packages/openplanner-cljs-client/
COPY services/mcp-fs-oauth/ services/mcp-fs-oauth/

RUN pnpm --filter @workspace/aether run build
RUN pnpm --filter @promethean-os/opencode-cljs-client run build 2>/dev/null || true
RUN pnpm --filter @promethean-os/openplanner-cljs-client run build 2>/dev/null || true
RUN cd services/mcp-fs-oauth && pnpm run build
RUN pnpm --filter ./services/mcp-fs-oauth deploy --legacy --prod /app

FROM node:22-bookworm-slim

WORKDIR /app
COPY --from=build /app .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
