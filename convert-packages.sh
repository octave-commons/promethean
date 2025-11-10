#!/bin/bash

set -e

# Process packages subrepos
packages=(
    "apply-patch:git@github.com:riatzukiza/apply-patch.git:$(grep 'commit =' packages/apply-patch/.gitrepo | sed 's/.*commit = //')"
    "autocommit:git@github.com:riatzukiza/autocommit.git:$(grep 'commit =' packages/autocommit/.gitrepo | sed 's/.*commit = //')"
    "kanban:https://github.com/riatzukiza/kanban.git:$(grep 'commit =' packages/kanban/.gitrepo | sed 's/.*commit = //')"
    "logger:git@github.com:riatzukiza/logger.git:$(grep 'commit =' packages/logger/.gitrepo | sed 's/.*commit = //')"
    "mcp:git@github.com:riatzukiza/mcp.git:$(grep 'commit =' packages/mcp/.gitrepo | sed 's/.*commit = //')"
    "naming:git@github.com:riatzukiza/naming.git:$(grep 'commit =' packages/naming/.gitrepo | sed 's/.*commit = //')"
    "persistence:git@github.com:riatzukiza/persistence.git:$(grep 'commit =' packages/persistence/.gitrepo | sed 's/.*commit = //')"
    "utils:git@github.com:riatzukiza/utils.git:$(grep 'commit =' packages/utils/.gitrepo | sed 's/.*commit = //')"
)

echo "Converting package subrepos to submodules..."

for package_info in "${packages[@]}"; do
    IFS=':' read -r name remote commit <<< "$package_info"
    
    if [ -f "packages/$name/.gitrepo" ]; then
        echo "Processing packages/$name"
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