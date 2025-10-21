# Multi-platform base image for Promethean framework
# Supports amd64 and arm64 architectures
FROM --platform=$BUILDPLATFORM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for all platforms
RUN apk add --no-cache \
    git \
    curl \
    bash \
    python3 \
    make \
    g++ \
    linux-headers \
    libgcc \
    libstdc++ \
    && rm -rf /var/cache/apk/*

# Install pnpm globally
RUN npm install -g pnpm@10.16.1

# Install Clojure tools (for ClojureScript support)
RUN apk add --no-cache \
    openjdk17-jre \
    curl \
    && curl -L -o /usr/local/bin/clojure https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh \
    && chmod +x /usr/local/bin/clojure \
    && mkdir -p ~/.clojure \
    && mkdir -p ~/.gitlibs \
    && mkdir -p ~/.cpcache

# Set environment variables
ENV NODE_ENV=development
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CLOJURE_VERSION=1.11.1.1419

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development

# Install additional development tools
RUN apk add --no-cache \
    vim \
    nano \
    htop \
    procps \
    net-tools \
    openssh-client

# Expose common ports
EXPOSE 3000 8080 8081 3210

# Set up development user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S promethean -u 1001

# Change ownership of app directory
RUN chown -R promethean:nodejs /app
USER promethean

# Default command for development
CMD ["pnpm", "dev:all"]

# Build stage
FROM base AS build

# Copy source code
COPY . .

# Build all packages
RUN pnpm build:all

# Production stage
FROM node:20-alpine AS production

# Install only production dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from build stage
COPY --from=build /app/packages ./packages
COPY --from=build /app/services ./services

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S promethean -u 1001

# Change ownership
RUN chown -R promethean:nodejs /app
USER promethean

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8081/health || exit 1

# Default command for production
CMD ["node", "packages/cephalon/dist/index.js"]