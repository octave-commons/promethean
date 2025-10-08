#!/bin/bash

# Convenience script for updating PRs targeting dev/stealth
# Usage: ./update-stealth-prs.sh [--dry-run] [--preset name]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY_RUN=""
PRESET="stealth-updates"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN="--dry-run"
      shift
      ;;
    --preset)
      PRESET="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Load config
if [[ -f "$SCRIPT_DIR/pr-sync-config.json" ]]; then
  CONFIG=$(cat "$SCRIPT_DIR/pr-sync-config.json")
  BASE_BRANCH=$(echo "$CONFIG" | jq -r ".presets[\"$PRESET\"].baseBranch // \"dev/stealth\"")
  RESOLUTION=$(echo "$CONFIG" | jq -r ".presets[\"$PRESET\"].conflictResolution // \"llm\"")
  MODEL=$(echo "$CONFIG" | jq -r ".presets[\"$PRESET\"].llmModel // \"qwen2.5-coder:7b\"")
  GATHER_CONTEXT=$(echo "$CONFIG" | jq -r ".presets[\"$PRESET\"].gatherContext // true")
else
  BASE_BRANCH="dev/stealth"
  RESOLUTION="llm"
  MODEL="qwen2.5-coder:7b"
  GATHER_CONTEXT="true"
fi

echo "🚀 Updating PRs targeting $BASE_BRANCH"
echo "Preset: $PRESET"
echo "Resolution: $RESOLUTION"
if [[ -n "$DRY_RUN" ]]; then
  echo "Mode: DRY RUN"
fi
echo ""

# Get PRs and pipe them to the sync tool
gh pr list --base "$BASE_BRANCH" --limit 100 --json number,headRefName | \
node "$SCRIPT_DIR/pr-sync-tool.mjs" \
  --base "$BASE_BRANCH" \
  --resolution "$RESOLUTION" \
  --model "$MODEL" \
  $([[ "$GATHER_CONTEXT" == "true" ]] || echo "--no-context") \
  $DRY_RUN