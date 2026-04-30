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
RUN printf 'packages:\n  - packages/mcp-foundation\n  - packages/radar-core\n  - packages/signal-atproto\n  - orgs/riatzukiza/threat-radar-mcp\n' > pnpm-workspace.yaml

COPY packages/mcp-foundation/package.json packages/mcp-foundation/
COPY packages/radar-core/package.json packages/radar-core/
COPY packages/signal-atproto/package.json packages/signal-atproto/
COPY orgs/riatzukiza/threat-radar-mcp/package.json orgs/riatzukiza/threat-radar-mcp/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

COPY packages/mcp-foundation/ packages/mcp-foundation/
COPY packages/radar-core/ packages/radar-core/
COPY packages/signal-atproto/ packages/signal-atproto/
COPY orgs/riatzukiza/threat-radar-mcp/ orgs/riatzukiza/threat-radar-mcp/

RUN pnpm --filter @workspace/radar-core run build
RUN pnpm --filter @workspace/signal-atproto run build
RUN pnpm --filter @workspace/mcp-foundation run build
RUN cd orgs/riatzukiza/threat-radar-mcp && pnpm run build
RUN pnpm --filter ./orgs/riatzukiza/threat-radar-mcp deploy --legacy --prod /app

FROM node:22-bookworm-slim

WORKDIR /app
COPY --from=build /app .

ENV NODE_ENV=production
ENV PORT=10002
EXPOSE 10002

CMD ["node", "dist/main.js"]
