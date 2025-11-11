#!/bin/bash

# Array of packages and their descriptions
declare -A packages=(
    ["build-monitoring"]="Build monitoring utilities for Promethean OS"
    ["compliance-monitor"]="Compliance monitoring for Promethean OS" 
    ["dlq"]="Dead Letter Queue handling for Promethean OS"
    ["enso-agent-communication"]="Agent communication utilities for Promethean OS"
    ["mcp-dev-ui-frontend"]="MCP development UI frontend for Promethean OS"
    ["obsidian-export"]="Obsidian export utilities for Promethean OS"
    ["plugin-hooks"]="Plugin hook system for Promethean OS"
    ["report-forge"]="Report generation utilities for Promethean OS"
    ["snapshots"]="Snapshot management for Promethean OS"
    ["worker"]="Worker utilities for Promethean OS"
    ["ds"]="Data structures for Promethean OS"
    ["omni-tools"]="Omni tools for Promethean OS"
    ["security"]="Security utilities for Promethean OS"
)

# Create repos and push packages
for pkg in "${!packages[@]}"; do
    echo "Creating repo and pushing $pkg..."
    
    cd "/home/err/devel/orgs/riatzukiza/promethean/packages/$pkg"
    
    # Create repo (check if exists first)
    gh repo create "$pkg" --public --description "${packages[$pkg]}" 2>/dev/null || echo "Repo $pkg might already exist"
    
    # Add remote and push
    git remote add origin "git@github.com:riatzukiza/$pkg.git" 2>/dev/null || git remote set-url origin "git@github.com:riatzukiza/$pkg.git"
    git push -u origin device/yoga
    
    echo "Completed $pkg"
done

echo "All repos created and pushed!"