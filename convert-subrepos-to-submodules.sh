#!/bin/bash

set -e

# Array of subrepo directories
subrepos=(
    "./git-subrepo-source/ext/bashplus"
    "./git-subrepo-source/ext/test-more-bash"
    "./git-subrepo-source/ext/test-more-bash/ext/bashplus"
    "./git-subrepo-source/ext/test-more-bash/ext/test-tap-bash"
    "./packages/apply-patch"
    "./packages/auth-service"
    "./packages/autocommit"
    "./packages/kanban"
    "./packages/logger"
    "./packages/mcp"
    "./packages/naming"
    "./packages/persistence"
    "./packages/utils"
)

echo "Converting subrepos to submodules..."

for subrepo in "${subrepos[@]}"; do
    if [ -f "$subrepo/.gitrepo" ]; then
        echo "Processing: $subrepo"
        
        # Extract remote URL and commit from .gitrepo
        remote=$(grep "remote =" "$subrepo/.gitrepo" | sed 's/.*remote = //')
        commit=$(grep "commit =" "$subrepo/.gitrepo" | sed 's/.*commit = //')
        
        echo "  Remote: $remote"
        echo "  Commit: $commit"
        
        # Get the directory name relative to root
        dir_path=$(echo "$subrepo" | sed 's|^\./||')
        
        # Remove the subrepo directory
        rm -rf "$subrepo"
        
        # Add as submodule at specific commit
        git submodule add -b main "$remote" "$dir_path"
        cd "$dir_path"
        git checkout "$commit"
        cd ..
        
        # Remove the .gitrepo file
        rm -f "$subrepo/.gitrepo"
        
        echo "  Converted to submodule"
    else
        echo "Warning: $subrepo/.gitrepo not found, skipping"
    fi
done

echo "All subrepos converted to submodules!"
echo "Don't forget to commit the changes:"