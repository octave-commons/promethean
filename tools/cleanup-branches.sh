#!/bin/bash

# Branch Cleanup Tool
# Usage: ./tools/cleanup-branches.sh [--dry-run] [--days=N] [--pattern="regex"] [--force]

set -euo pipefail

# Default values
DRY_RUN=true
DAYS_THRESHOLD=30
BRANCH_PATTERN="^[0-9a-z]*-?(codex|feat|chore|docs|test|fix)\/.*$"
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-dry-run)
      DRY_RUN=false
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --days=*)
      DAYS_THRESHOLD="${1#*=}"
      shift
      ;;
    --days)
      DAYS_THRESHOLD="$2"
      shift 2
      ;;
    --pattern=*)
      BRANCH_PATTERN="${1#*=}"
      shift
      ;;
    --pattern)
      BRANCH_PATTERN="$2"
      shift 2
      ;;
    --help|-h)
      cat << EOF
Branch Cleanup Tool

Usage: $0 [OPTIONS]

OPTIONS:
    --dry-run       Preview what would be deleted (default)
    --no-dry-run    Actually delete branches
    --force         Skip confirmation prompts
    --days=N        Delete branches older than N days (default: 30)
    --pattern=REGEX Branch name pattern to match (default: codex/feat/chore/docs/test/fix branches)
    --help, -h      Show this help

EXAMPLES:
    $0 --dry-run --days=7                    # Preview branches older than 7 days
    $0 --no-dry-run --days=90 --force        # Delete branches older than 90 days
    $0 --pattern="^codex/.*$" --days=30      # Only clean up codex/ branches

PROTECTED BRANCHES:
    - main, dev/testing, staging (never deleted)
    - dev/* (workspace branches, never deleted)
    - Branches with associated PRs (never deleted)
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Branch Cleanup Tool${NC}"
echo -e "${BLUE}================================${NC}"
echo
echo "Configuration:"
echo -e "  • Dry run: ${DRY_RUN:+${GREEN}YES${NC}}${DRY_RUN:-${RED}NO${NC}}"
echo -e "  • Age threshold: ${DAYS_THRESHOLD} days"
echo -e "  • Branch pattern: ${BRANCH_PATTERN}"
echo -e "  • Force mode: ${FORCE:+${RED}YES${NC}}${FORCE:-${GREEN}NO${NC}}"
echo

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
  echo -e "${RED}❌ GitHub CLI (gh) is required but not installed${NC}"
  echo "Install it from: https://cli.github.com/"
  exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
  echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
  echo "Run: gh auth login"
  exit 1
fi

# Get all remote branches
echo -e "${BLUE}📋 Fetching remote branches...${NC}"
git fetch --all --quiet || {
  echo -e "${YELLOW}⚠️  Warning: Some fetch operations failed, continuing with available data${NC}"
}

# Get branches matching pattern
ALL_BRANCHES=$(git branch -r --no-color 2>/dev/null | grep -v HEAD | grep -v 'origin/main$' | grep -v 'origin/dev/testing$' | grep -v 'origin/staging$' | sed 's/^[ ]*origin\///' | grep -E "$BRANCH_PATTERN" || true)

if [[ -z "$ALL_BRANCHES" ]]; then
  echo -e "${GREEN}✅ No branches found matching pattern: $BRANCH_PATTERN${NC}"
  exit 0
fi

TOTAL_BRANCHES=$(echo "$ALL_BRANCHES" | wc -l)
echo -e "${BLUE}🔍 Found ${TOTAL_BRANCHES} branches matching pattern${NC}"

# Get all branches that have PRs
echo -e "${BLUE}📋 Fetching PR information...${NC}"
PR_BRANCHES=$(gh pr list --state all --limit 1000 --json headRefName | jq -r '.[].headRefName' 2>/dev/null | sort -u || true)

# Find eligible branches for cleanup
BRANCHES_TO_CHECK=""
PROTECTED_COUNT=0

while IFS= read -r branch; do
  if [[ -n "$branch" ]]; then
    # Skip if branch has a PR
    if echo "$PR_BRANCHES" | grep -q "^${branch}$"; then
      ((PROTECTED_COUNT++))
      continue
    fi

    # Skip dev/* workspace branches
    if [[ "$branch" =~ ^dev/ ]]; then
      ((PROTECTED_COUNT++))
      continue
    fi

    BRANCHES_TO_CHECK="$BRANCHES_TO_CHECK$branch"$'\n'
  fi
done <<< "$ALL_BRANCHES"

if [[ -z "$BRANCHES_TO_CHECK" ]]; then
  echo -e "${GREEN}✅ All branches are protected (have PRs or are workspace branches)${NC}"
  exit 0
fi

ELIGIBLE_COUNT=$(echo "$BRANCHES_TO_CHECK" | grep -c .)
echo -e "${BLUE}🎯 Found ${ELIGIBLE_COUNT} branches without PRs to check${NC}"
echo -e "${BLUE}🛡️  Protected ${PROTECTED_COUNT} branches (have PRs or are workspace branches)${NC}"
echo

# Check branch ages and find candidates for deletion
BRANCHES_TO_DELETE=""
TOTAL_CHECKED=0
CURRENT_DATE=$(date +%s)

echo -e "${BLUE}📅 Checking branch ages...${NC}"
echo

while IFS= read -r branch; do
  if [[ -n "$branch" ]]; then
    ((TOTAL_CHECKED++))

    # Get last commit date
    LAST_COMMIT_DATE=$(git log -1 --format="%ct" "origin/$branch" 2>/dev/null || echo "0")
    AGE_DAYS=$(( (CURRENT_DATE - LAST_COMMIT_DATE) / 86400 ))

    if [[ $AGE_DAYS -ge $DAYS_THRESHOLD ]]; then
      BRANCHES_TO_DELETE="$BRANCHES_TO_DELETE$branch"$'\n'
      printf "%-40s ${RED}%s days old${NC}\n" "$branch" "$AGE_DAYS"
    else
      printf "%-40s ${GREEN}%s days old${NC} (too recent)\n" "$branch" "$AGE_DAYS"
    fi
  fi
done <<< "$BRANCHES_TO_CHECK"

if [[ -z "$BRANCHES_TO_DELETE" ]]; then
  echo
  echo -e "${GREEN}✅ No branches meet the age threshold for deletion${NC}"
  exit 0
fi

DELETE_COUNT=$(echo "$BRANCHES_TO_DELETE" | grep -c .)
echo
echo -e "${YELLOW}📊 Summary:${NC}"
echo -e "  • Total branches checked: ${TOTAL_CHECKED}"
echo -e "  • Branches marked for deletion: ${RED}${DELETE_COUNT}${NC}"
echo -e "  • Protected branches: ${PROTECTED_COUNT}"
echo

if [[ "$DRY_RUN" == "true" ]]; then
  echo -e "${YELLOW}🔍 DRY RUN MODE - No branches will be deleted${NC}"
  echo -e "${BLUE}💡 To actually delete branches, run: $0 --no-dry-run --days=${DAYS_THRESHOLD}${NC}"
else
  echo -e "${RED}⚠️  DELETION MODE${NC}"
  echo

  if [[ "$FORCE" != "true" ]]; then
    echo -e "${YELLOW}Branches to be deleted:${NC}"
    echo "$BRANCHES_TO_DELETE" | sed 's/^/   • /'
    echo
    read -p "Are you sure you want to delete these ${DELETE_COUNT} branches? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${YELLOW}❌ Cancelled${NC}"
      exit 0
    fi
  fi

  echo -e "${BLUE}🗑️  Deleting ${DELETE_COUNT} branches...${NC}"

  DELETED=0
  FAILED=0

  while IFS= read -r branch; do
    if [[ -n "$branch" ]]; then
      echo -n "   Deleting $branch... "
      if git push origin --delete "$branch" 2>/dev/null; then
        echo -e "${GREEN}✅ Deleted${NC}"
        ((DELETED++))
      else
        echo -e "${RED}❌ Failed${NC}"
        ((FAILED++))
      fi
    fi
  done <<< "$BRANCHES_TO_DELETE"

  echo
  echo -e "${BLUE}🎉 Cleanup completed!${NC}"
  echo -e "  • Successfully deleted: ${GREEN}${DELETED}${NC}"
  echo -e "  • Failed to delete: ${RED}${FAILED}${NC}"
fi

echo
echo -e "${GREEN}✨ Done!${NC}"