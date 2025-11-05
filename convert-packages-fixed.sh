#!/bin/bash

set -e

echo "Converting package subrepos to submodules..."

# List of package names
packages=(
    "apply-patch"
    "autocommit"
    "kanban"
    "logger"
    "mcp"
    "naming"
    "persistence"
    "utils"
)

for name in "${packages[@]}"; do
    if [ -f "packages/$name/.gitrepo" ]; then
        echo "Processing packages/$name"
        
        # Extract remote and commit from .gitrepo
        remote=$(grep "remote =" "packages/$name/.gitrepo" | sed 's/.*remote = //')
        commit=$(grep "commit =" "packages/$name/.gitrepo" | sed 's/.*commit = //')
        
        echo "  Remote: $remote"
        echo "  Commit: $commit"
        
        # Remove the subrepo directory
        rm -rf "packages/$name"
        
        # Add as submodule
        git submodule add "$remote" "packages/$name"
        
        # Checkout specific commit
        cd "packages/$name"
        git checkout "$commit"
        cd ..
        
        # Remove the .gitrepo file
        rm -f "packages/$name/.gitrepo"
        
        echo "  Converted to submodule"
    else
        echo "Warning: packages/$name/.gitrepo not found, skipping"
    fi
done

echo "All package subrepos converted to submodules!"