#!/bin/bash

# Quick Branch Analysis Tool
# Provides a fast overview of branch status without detailed processing

set -euo pipefail

echo "📊 Branch Analysis Overview"
echo "========================="
echo

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is required"
  exit 1
fi

echo "🔍 Fetching branch information..."
git fetch --all --quiet 2>/dev/null || echo "⚠️  Some fetch operations failed"

# Count different types of branches
TOTAL_BRANCHES=$(git branch -r --no-color 2>/dev/null | grep -v HEAD | wc -l)
MAIN_BRANCHES=$(git branch -r --no-color 2>/dev/null | grep -E "(origin/main$|origin/dev/testing$|origin/staging$)" | wc -l)
WORKSPACE_BRANCHES=$(git branch -r --no-color 2>/dev/null | grep "origin/dev/" | wc -l)
CODEX_BRANCHES=$(git branch -r --no-color 2>/dev/null | grep "codex" | wc -l)

echo "📈 Branch Statistics:"
echo "  • Total remote branches: $TOTAL_BRANCHES"
echo "  • Main branches (main, dev/testing, staging): $MAIN_BRANCHES"
echo "  • Workspace branches (dev/*): $WORKSPACE_BRANCHES"
echo "  • Codex branches: $CODEX_BRANCHES"
echo

# Get PR information
echo "📋 Pull Request Information..."
PR_COUNT=$(gh pr list --state all --limit 1 --json number | jq length 2>/dev/null || echo "0")
echo "  • Total PRs (all time): $PR_COUNT"

# Get open PRs
OPEN_PRS=$(gh pr list --state open --limit 100 --json number,headRefName 2>/dev/null || echo "[]")
OPEN_PR_COUNT=$(echo "$OPEN_PRS" | jq length 2>/dev/null || echo "0")
echo "  • Open PRs: $OPEN_PR_COUNT"

if [[ $OPEN_PR_COUNT -gt 0 ]]; then
  echo "  • Open PR branches:"
  echo "$OPEN_PRS" | jq -r '.[] | "    - #" + (.number|tostring) + ": " + .headRefName' 2>/dev/null || echo "    (Unable to fetch details)"
fi
echo

# Sample old branches
echo "🕒 Sample of potentially old branches:"
git branch -r --no-color 2>/dev/null | grep -v HEAD | grep -v "origin/main$" | grep -v "origin/dev/testing$" | grep -v "origin/staging$" | sed 's/^[ ]*origin\///' | head -10 | while read -r branch; do
  if [[ -n "$branch" ]]; then
    # Try to get last commit date
    LAST_DATE=$(git log -1 --format="%ci" "origin/$branch" 2>/dev/null | cut -d'-' -f1,2,3 || echo "unknown")
    echo "    - $branch ($LAST_DATE)"
  fi
done
echo

# Quick recommendations
echo "💡 Recommendations:"
if [[ $CODEX_BRANCHES -gt 100 ]]; then
  echo "  • Consider running codex branch cleanup (found $CODEX_BRANCHES codex branches)"
fi

if [[ $OPEN_PR_COUNT -gt 20 ]]; then
  echo "  • Review and merge open PRs (found $OPEN_PR_COUNT open PRs)"
fi

echo "  • Run './tools/cleanup-branches.sh --dry-run --days=30' to see cleanup candidates"
echo "  • Check GitHub Actions → Branch Cleanup for automated reports"
echo

echo "✅ Analysis complete!"