#!/usr/bin/env bash
set -euo pipefail
source "$HOME/devel/promethean/.env"
export OBSIDIAN_API_KEY="$OBSIDIAN_API_KEY"
uvx mcp-obsidian
