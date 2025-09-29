# Browsers + system deps preinstalled
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

# Install Clojure CLI (tools-deps), Java, and ripgrep
# - Playwright image already has Node 20.x and common tools.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl openjdk-21-jdk-headless gnupg ca-certificates rlwrap ripgrep cmake \
    python3 make g++ pkg-config build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    libopus-dev ffmpeg \
    && curl -fsSL https://download.clojure.org/install/linux-install.sh | bash \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    npm i -g node-gyp@latest

# Verify basics
RUN node -v && pnpm -v || true; clojure -Sdescribe | head -n 5; rg --version
