#!/bin/bash

# Array of packages to add as submodules
packages=(
    "build-monitoring"
    "compliance-monitor" 
    "dlq"
    "enso-agent-communication"
    "mcp-dev-ui-frontend"
    "obsidian-export"
    "plugin-hooks"
    "report-forge"
    "snapshots"
    "worker"
    "ds"
    "omni-tools"
    "security"
)

# Function to add package as submodule
add_submodule() {
    local pkg=$1
    echo "Adding $pkg as submodule..."
    
    cd "/home/err/devel/orgs/riatzukiza/promethean"
    
    # Remove from main repo tracking
    git rm -r --cached "packages/$pkg" 2>/dev/null || echo "Package $pkg not tracked in main repo"
    
    # Add as submodule
    git submodule add "git@github.com:riatzukiza/$pkg.git" "packages/$pkg"
    
    echo "Completed $pkg"
}

# Add all packages as submodules
for pkg in "${packages[@]}"; do
    add_submodule "$pkg"
done

echo "All packages added as submodules!"