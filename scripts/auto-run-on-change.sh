#!/bin/bash

# Auto-run script for pnpm workspaces
# Runs `pnpm --filter <packagename>` when src folders change

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default command to run
DEFAULT_COMMAND="build"
COMMAND="${1:-$DEFAULT_COMMAND}"

echo -e "${BLUE}🔍 Auto-run script started${NC}"
echo -e "${BLUE}Command: ${YELLOW}$COMMAND${NC}"
echo -e "${BLUE}Watching for changes in src/ folders...${NC}"

# Check if we're in a pnpm workspace
if ! [ -f "pnpm-workspace.yaml" ] && ! [ -f "package.json" ] && ! grep -q "workspaces" package.json; then
    echo -e "${RED}❌ Error: Not in a pnpm workspace${NC}"
    echo -e "${RED}Make sure you're in a directory with pnpm-workspace.yaml or workspaces in package.json${NC}"
    exit 1
fi

# Function to get package name from directory
get_package_name() {
    local dir="$1"
    local package_json="$dir/package.json"
    
    if [ -f "$package_json" ]; then
        # Extract name from package.json
        node -e "console.log(JSON.parse(require('fs').readFileSync('$package_json', 'utf8')).name || '')" 2>/dev/null || echo ""
    fi
}

# Function to run command for package
run_command() {
    local package_dir="$1"
    local package_name="$2"
    
    if [ -n "$package_name" ]; then
        echo -e "${GREEN}🚀 Running: pnpm --filter $package_name $COMMAND${NC}"
        if pnpm --filter "$package_name" "$COMMAND"; then
            echo -e "${GREEN}✅ Success: $package_name${NC}"
        else
            echo -e "${RED}❌ Failed: $package_name${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No package name found for $package_dir${NC}"
    fi
}

# Function to handle file change
handle_change() {
    local changed_file="$1"
    local package_dir
    
    # Find the package directory containing the changed file
    package_dir=$(find . -name "package.json" -exec dirname {} \; | while read dir; do
        if [[ "$changed_file" == "$dir"* ]]; then
            echo "$dir"
            break
        fi
    done)
    
    if [ -n "$package_dir" ]; then
        local package_name
        package_name=$(get_package_name "$package_dir")
        
        echo -e "${YELLOW}📝 Changed: $changed_file${NC}"
        echo -e "${YELLOW}📦 Package: $package_name ($package_dir)${NC}"
        
        run_command "$package_dir" "$package_name"
    else
        echo -e "${YELLOW}⚠️  No package found for changed file: $changed_file${NC}"
    fi
    
    echo -e "${BLUE}---${NC}"
}

# Initial run for all packages
echo -e "${BLUE}🏃 Initial run for all packages...${NC}"
find . -name "package.json" -not -path "./node_modules/*" | while read package_json; do
    package_dir=$(dirname "$package_json")
    package_name=$(get_package_name "$package_dir")
    
    if [ -n "$package_name" ]; then
        run_command "$package_dir" "$package_name"
    fi
done

echo -e "${BLUE}---${NC}"

# Watch for changes using inotifywait (Linux) or fswatch (macOS)
if command -v inotifywait >/dev/null 2>&1; then
    echo -e "${BLUE}👀 Watching with inotifywait...${NC}"
    echo -e "${BLUE}Press Ctrl+C to stop${NC}"
    
    # Watch all src/ directories recursively
    find . -type d -name "src" -not -path "./node_modules/*" | while read src_dir; do
        inotifywait -m -r -e modify,create,delete,move "$src_dir" --format '%w%f' |
        while read changed_file; do
            handle_change "$changed_file"
        done &
    done
    
    # Wait for all background processes
    wait
    
elif command -v fswatch >/dev/null 2>&1; then
    echo -e "${BLUE}👀 Watching with fswatch...${NC}"
    echo -e "${BLUE}Press Ctrl+C to stop${NC}"
    
    # Watch all src/ directories
    src_dirs=$(find . -type d -name "src" -not -path "./node_modules/*")
    fswatch -o $src_dirs |
    while read event; do
        # Find the most recently changed file
        changed_file=$(find . -type d -name "src" -not -path "./node_modules/*" -exec find {} -type f -newermt "1 second ago" \; | head -1)
        if [ -n "$changed_file" ]; then
            handle_change "$changed_file"
        fi
    done
    
else
    echo -e "${RED}❌ Error: Neither inotifywait nor fswatch found${NC}"
    echo -e "${RED}Install one of them:${NC}"
    echo -e "${RED}  Linux: sudo apt-get install inotify-tools${NC}"
    echo -e "${RED}  macOS: brew install fswatch${NC}"
    exit 1
fi