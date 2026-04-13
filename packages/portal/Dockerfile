FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json ./
COPY src/ ./src/
COPY index.html ./

EXPOSE 8799

CMD ["node", "src/server.mjs"]
