# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

EXPOSE 9999
ENV PORT=9999

CMD ["node", "index.js"]
