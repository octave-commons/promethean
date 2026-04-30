# riatzukiza-portfolio service image
#
# Designed for dev: bind-mount the workspace at /workspace.
# Includes Graphviz so the Quartz Garden generator can render DOT -> SVG/PNG.

FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    graphviz \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace/services/riatzukiza-portfolio

ENV NODE_ENV=production

CMD ["node", "src/server.mjs"]
