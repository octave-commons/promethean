FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json ./
COPY src ./src
COPY ui ./ui

ENV HOST_FLEET_DASHBOARD_HOST=0.0.0.0 \
    HOST_FLEET_DASHBOARD_PORT=8791 \
    HOST_FLEET_DOCKER_SOCKET_PATH=/var/run/docker.sock

EXPOSE 8791

CMD ["node", "src/index.js"]
