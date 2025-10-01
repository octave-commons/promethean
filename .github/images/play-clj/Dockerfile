# Base playwright image includes Node 20.x, browsers, and common tooling
# Keep the defaults aligned with config/images/playwright.env
ARG PLAYWRIGHT_IMAGE=mcr.microsoft.com/playwright
ARG PLAYWRIGHT_TAG=v1.55.0-jammy
FROM ${PLAYWRIGHT_IMAGE}:${PLAYWRIGHT_TAG}

ARG PLAYWRIGHT_IMAGE
ARG PLAYWRIGHT_TAG

ENV PLAYWRIGHT_IMAGE=${PLAYWRIGHT_IMAGE} \
    PLAYWRIGHT_TAG=${PLAYWRIGHT_TAG}

ENV DEBIAN_FRONTEND=noninteractive \
    CLOJURE_VERSION=latest

# Install Clojure CLI (tools-deps), Java runtime, build essentials, and utilities
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      curl \
      openjdk-21-jdk-headless \
      gnupg \
      ca-certificates \
      rlwrap \
      ripgrep \
      cmake \
      python3 \
      make \
      g++ \
      pkg-config \
      build-essential \
      libcairo2-dev \
      libpango1.0-dev \
      libjpeg-dev \
      libgif-dev \
      librsvg2-dev \
      libopus-dev \
      ffmpeg \
    && curl -fsSL https://download.clojure.org/install/linux-install.sh | bash \
    && npm install -g node-gyp@latest \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Basic smoke-check for key tooling
RUN node -v \
 && pnpm -v || true \
 && clojure -Sdescribe | head -n 5 \
 && rg --version
