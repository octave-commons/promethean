FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm ci

COPY src ./src
COPY .env.example ./.env.example

RUN npm run build

ENV NODE_ENV=production
ENV OPENPLANNER_HOST=0.0.0.0
ENV OPENPLANNER_PORT=7777

EXPOSE 7777

CMD ["node", "dist/main.js"]
