#!/usr/bin/env bash
set -euo pipefail
source "$HOME/.promethean/mcp/.env"
exec uvx mcp-obsidian
