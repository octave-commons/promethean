# Cephalon Hive Dockerfile
#
# Uses standalone bundle with all dependencies inlined

FROM node:22-bookworm-slim

ENV NODE_ENV=production

# Install system dependencies for ffmpeg, screenshot tools, and Playwright
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    git \
    openssh-client \
    rsync \
    ffmpeg \
    scrot \
    imagemagick \
    xdotool \
    wmctrl \
    pulseaudio-utils \
    libpulse0 \
    # Playwright dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libxshmfence1 \
    libglu1-mesa \
    fonts-liberation \
    libappindicator3-1 \
    libdbus-1-3 \
    libxss1 \
    xdg-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy standalone bundle (all deps inlined, no node_modules needed)
COPY dist/cli.cjs ./dist/cli.cjs
COPY dist/index.cjs ./dist/index.cjs
COPY dist/public ./dist/public

# Copy runtime files
COPY entrypoint.sh ./

RUN chmod +x ./entrypoint.sh

# Install Playwright browsers (chromium only for smaller image)
# This is a temporary workaround - the browsers are ~150MB
RUN npx playwright@1.50.0 install chromium

ENV CEPHALON_NAME=DUCK
ENV MEMORY_UI_PORT=3000
EXPOSE 3000

CMD ["./entrypoint.sh"]
