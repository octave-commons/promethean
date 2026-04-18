#!/usr/bin/env bash
set -euo pipefail

SERVICES=(
  "mcp-devtools:4014"
  "mcp-exec:4018"
  "mcp-github:4012"
  "mcp-ollama:4017"
  "mcp-process:4013"
  "mcp-sandboxes:4016"
  "mcp-tdd:4015"
)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

for entry in "${SERVICES[@]}"; do
  SVC="${entry%%:*}"
  PORT="${entry##*:}"
  PKG_NAME=$(node -e "console.log(require('$ROOT_DIR/services/$SVC/package.json').name)")
  DEST="$ROOT_DIR/services/$SVC/Dockerfile"

  echo "Generating $DEST ($PKG_NAME @ :$PORT)"

  cat > "$DEST" <<DOCKERFILE
FROM node:22-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:\$PATH
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

WORKDIR /workspace

COPY package.json pnpm-lock.yaml ./
RUN node -e "\\
  const p = JSON.parse(require('fs').readFileSync('package.json','utf8'));\\
  for (const s of ['dependencies','devDependencies','peerDependencies']) {\\
    if (!p[s]) continue;\\
    for (const [k,v] of Object.entries(p[s])) { if (String(v).includes('workspace:')) delete p[s][k]; }\\
  }\\
  require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2));"
RUN printf 'packages:\\n  - packages/hermes\\n  - services/$SVC\\n' > pnpm-workspace.yaml

COPY packages/hermes/package.json packages/hermes/
COPY services/$SVC/package.json services/$SVC/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \\
    pnpm install --no-frozen-lockfile

COPY packages/hermes/ packages/hermes/
COPY services/$SVC/ services/$SVC/

RUN pnpm --filter @workspace/hermes run build
RUN cd services/$SVC && pnpm run build
RUN pnpm --filter ./services/$SVC deploy --legacy --prod /app

FROM node:22-bookworm-slim

WORKDIR /app
COPY --from=build /app .

ENV NODE_ENV=production
EXPOSE $PORT

CMD ["node", "dist/main.js"]
DOCKERFILE

done

echo "Done. Generated ${#SERVICES[@]} Dockerfiles."
