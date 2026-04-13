#!/bin/bash
# Cephalon Hive Launcher
# Spawns multiple cephalons with ZAI API
#
# Usage:
#   ./scripts/start-hive.sh              # Start all cephalons
#   CEPHALONS=DUCK,OPENSKULL ./scripts/start-hive.sh  # Start specific ones
#
# Environment:
#   ZAI_API_KEY          - Zukijourney API key (required)
#   DUCK_DISCORD_TOKEN   - Duck's Discord bot token
#   OPENHAX_DISCORD_TOKEN - OpenHax Discord bot token
#   OPEN_SKULL_DISCORD_TOKEN - OpenSkull Discord bot token
#   DISCORD_ERROR_BOT_TOKEN - Error bot's Discord token

set -e

cd "$(dirname "$0")/.."

# Check ZAI_API_KEY
if [ -z "$ZAI_API_KEY" ]; then
    echo "Error: ZAI_API_KEY not set"
    echo "Get your key from https://zukijourney.com"
    exit 1
fi

# Count available tokens
TOKENS=0
[ -n "$DUCK_DISCORD_TOKEN" ] && TOKENS=$((TOKENS + 1)) && echo "✓ DUCK_DISCORD_TOKEN found"
[ -n "$OPENHAX_DISCORD_TOKEN" ] && TOKENS=$((TOKENS + 1)) && echo "✓ OPENHAX_DISCORD_TOKEN found"
[ -n "$OPEN_SKULL_DISCORD_TOKEN" ] && TOKENS=$((TOKENS + 1)) && echo "✓ OPEN_SKULL_DISCORD_TOKEN found"
[ -n "$DISCORD_ERROR_BOT_TOKEN" ] && TOKENS=$((TOKENS + 1)) && echo "✓ DISCORD_ERROR_BOT_TOKEN found"

if [ $TOKENS -eq 0 ]; then
    echo "Error: No Discord tokens found"
    echo "Set at least one: DUCK_DISCORD_TOKEN, OPENHAX_DISCORD_TOKEN, OPEN_SKULL_DISCORD_TOKEN, DISCORD_ERROR_BOT_TOKEN"
    exit 1
fi

echo ""
echo "Starting Cephalon Hive with $TOKENS cephalon(s)..."
echo ""

# Run the hive
pnpm hive
