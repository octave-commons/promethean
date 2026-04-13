FROM node:22-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:${PATH}

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
RUN pnpm add -g pm2

WORKDIR /app

COPY package.json tsconfig.json ./

RUN pnpm install --no-frozen-lockfile

COPY src ./src
COPY web ./web
COPY ecosystem.container.config.cjs ./ecosystem.container.config.cjs
COPY keys.example.json ./keys.example.json
COPY models.example.json ./models.example.json

RUN pnpm build && pnpm web:build

ENV NODE_ENV=production
ENV PROXY_HOST=0.0.0.0
ENV PROXY_PORT=8789

EXPOSE 8789
EXPOSE 5174

CMD ["pm2-runtime", "start", "ecosystem.container.config.cjs"]
