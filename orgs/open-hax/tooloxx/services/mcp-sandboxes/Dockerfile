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
RUN printf 'packages:\n  - packages/hermes\n  - services/mcp-sandboxes\n' > pnpm-workspace.yaml

COPY packages/hermes/package.json packages/hermes/
COPY services/mcp-sandboxes/package.json services/mcp-sandboxes/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

COPY packages/hermes/ packages/hermes/
COPY services/mcp-sandboxes/ services/mcp-sandboxes/

RUN pnpm --filter @workspace/hermes run build
RUN cd services/mcp-sandboxes && pnpm run build
RUN pnpm --filter ./services/mcp-sandboxes deploy --legacy --prod /app

FROM node:22-bookworm-slim

WORKDIR /app
COPY --from=build /app .

ENV NODE_ENV=production
EXPOSE 4016

CMD ["node", "dist/main.js"]
