# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Set working directory and install dependencies
WORKDIR /app

# Install pnpm and build essentials
RUN npm install -g pnpm@latest && \
    apk add --no-cache \
        git \
        python3 \
        make \
        g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages/omni-service/package.json ./packages/omni-service/
COPY packages/omni-protocol/package.json ./packages/omni-protocol/
COPY packages/persistence/package.json ./packages/persistence/
COPY packages/security/package.json ./packages/security/
COPY packages/legacy/package.json ./packages/legacy/
COPY packages/utils/package.json ./packages/utils/
COPY packages/test-utils/package.json ./packages/test-utils/

# Install dependencies
RUN pnpm install --frozen-lockfile --prefer-frozen-lockfile

# Copy workspace config and source files
COPY packages/omni-service/tsconfig.json ./packages/omni-service/
COPY packages/omni-service/ava.config.mjs ./packages/omni-service/
COPY packages/omni-protocol/tsconfig.json ./packages/omni-protocol/
COPY packages/persistence/tsconfig.json ./packages/persistence/
COPY packages/security/tsconfig.json ./packages/security/
COPY packages/legacy/tsconfig.json ./packages/legacy/
COPY packages/utils/tsconfig.json ./packages/utils/
COPY packages/test-utils/tsconfig.json ./packages/test-utils/
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY nx.json ./nx/

# Build dependencies first
RUN pnpm --filter @promethean/omni-protocol build
RUN pnpm --filter @promethean/persistence build
RUN pnpm --filter @promethean/security build
RUN pnpm --filter @promethean/legacy build
RUN pnpm --filter @promethean/utils build
RUN pnpm --filter @promethean/test-utils build

# Build the application
FROM base AS builder
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml ./
COPY packages/omni-service/package.json ./packages/omni-service/
COPY packages/omni-protocol/package.json ./packages/omni-protocol/
COPY packages/persistence/package.json ./packages/persistence/
COPY packages/security/package.json ./packages/security/
COPY packages/legacy/package.json ./packages/legacy/
COPY packages/utils/package.json ./packages/utils/
COPY packages/test-utils/package.json ./packages/test-utils/
COPY packages/omni-service/tsconfig.json ./packages/omni-service/
COPY packages/omni-protocol/tsconfig.json ./packages/omni-protocol/
COPY packages/persistence/tsconfig.json ./packages/persistence/
COPY packages/security/tsconfig.json ./packages/security/
COPY packages/legacy/tsconfig.json ./packages/legacy/
COPY packages/utils/tsconfig.json ./packages/utils/
COPY packages/test-utils/tsconfig.json ./packages/test-utils/
COPY packages/omni-service/ava.config.mjs ./packages/omni-service/
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY nx.json ./

# Install dependencies (will use cache if unchanged)
RUN pnpm install --frozen-lockfile --prefer-frozen-lockfile

# Copy source files
COPY packages/omni-service/src/ ./packages/omni-service/src/
COPY packages/omni-protocol/src/ ./packages/omni-protocol/src/
COPY packages/persistence/src/ ./packages/persistence/src/
COPY packages/security/src/ ./packages/security/src/
COPY packages/legacy/src/ ./packages/legacy/src/
COPY packages/utils/src/ ./packages/utils/src/
COPY packages/test-utils/src/ ./packages/test-utils/src/
COPY packages/omni-protocol/dist ./packages/omni-protocol/dist/
COPY packages/persistence/dist ./packages/persistence/dist/
COPY packages/security/dist ./packages/security/dist/
COPY packages/legacy/dist ./packages/legacy/dist/
COPY packages/utils/dist ./packages/utils/dist/
COPY packages/test-utils/dist ./packages/test-utils/dist/

# Build the application
RUN pnpm --filter @promethean/omni-service build

# Production image
FROM node:18-alpine AS production

# Install only production dependencies
RUN npm install -g pnpm@latest && \
    apk add --no-cache \
 dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -G nodejs -u 1001 nodejs

WORKDIR /app

# Copy package files
COPY packages/omni-service/package.json ./packages/omni-service/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/packages/omni-service/dist ./dist
COPY --from=builder /app/packages/omni-service/examples ./examples

# Copy static files if any
RUN mkdir -p /app/static
COPY --from=builder /app/packages/omni-service/static ./static

# Set proper permissions
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD pnpm health || curl -f http://localhost:3000/health || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "start"]

# Development image with hot reload
FROM base AS development
WORKDIR /app

# Copy development files
COPY packages/omni-service/package.json ./packages/omni-service/
COPY packages/omni-service/tsconfig.json ./packages/omni-service/
COPY packages/omni-service/ava.config.mjs ./packages/omni-service/
COPY packages/omni-service/src/ ./packages/omni-service/src/
COPY packages/omni-service/examples ./packages/omni-service/examples/
COPY packages/omni-service/static ./packages/omni-service/static/
COPY packages/omni-service/docker ./packages/omni-service/docker/
COPY packages/omni-service/k8s ./packages/omni-service/k8s/
COPY packages/omni-service/changelog.d ./packages/omni-service/changelog.d/

# Install all dependencies for development
RUN pnpm install

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["pnpm", "start:dev"]

# Testing image
FROM base AS testing
WORKDIR /app

# Copy all files for testing
COPY packages/omni-service/package.json ./packages/omni-service/
COPY packages/omni-service/tsconfig.json ./packages/omni-service/
COPY packages/omni-service/ava.config.mjs ./packages/omni-service/
COPY packages/omni-service/src/ ./packages/omni-service/src/
COPY packages/omni-service/examples ./packages/omni-service/examples/
COPY packages/omni-service/static ./packages/omni-service/static/
COPY packages/omni-service/changelog.d ./packages/omni-service/changelog.d/

# Install all dependencies
RUN pnpm install

# Run tests
CMD ["pnpm", "test"]