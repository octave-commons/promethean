#!/bin/bash

# Pantheon Migration Script
# Phase 1: Create new Pantheon packages from agent packages

set -e

# Backup function
create_backup() {
    local backup_name="migration-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    echo "💾 Creating backup: $backup_name"
    tar -czf "$backup_name" packages/cephalon packages/agents packages/pantheon-* 2>/dev/null || true
    echo "✅ Backup created: $backup_name"
}

# Rollback function
rollback() {
    local backup_name="$1"
    if [[ -z "$backup_name" ]]; then
        echo "❌ Error: No backup file specified for rollback"
        exit 1
    fi
    
    if [[ ! -f "$backup_name" ]]; then
        echo "❌ Error: Backup file $backup_name not found"
        exit 1
    fi
    
    echo "🔄 Rolling back to: $backup_name"
    tar -xzf "$backup_name"
    echo "✅ Rollback completed"
}

# Check for rollback command
if [[ "$1" == "rollback" ]]; then
    if [[ -z "$2" ]]; then
        echo "Usage: $0 rollback <backup-file>"
        exit 1
    fi
    rollback "$2"
    exit 0
fi

# Create backup before starting
create_backup

echo "🏛️  Starting Pantheon Migration: Agent Packages Consolidation"
echo "=========================================================="

# Define package mappings
declare -A PACKAGE_MAPPINGS=(
    ["agent-ecs"]="pantheon-ecs"
    ["agent-state"]="pantheon-state"
    ["agent-protocol"]="pantheon-protocol"
    ["agent-os-protocol"]="pantheon-protocol"  # Merge with agent-protocol
    ["agents-workflow"]="pantheon-workflow"
    ["agent-coordination"]="pantheon-coordination"
    ["agent-generator"]="pantheon-generator"
    ["agent-orchestrator"]="pantheon-orchestrator"
    ["agent-management-ui"]="pantheon-ui"
    ["agent"]="DEPRECATED"  # Minimal functionality, will be deprecated
)

# Phase 1: Create new package directories
echo "📁 Phase 1: Creating new Pantheon package directories..."

for agent_pkg in "${!PACKAGE_MAPPINGS[@]}"; do
    pantheon_pkg="${PACKAGE_MAPPINGS[$agent_pkg]}"
    
    if [[ "$pantheon_pkg" == "DEPRECATED" ]]; then
        echo "⚠️  Skipping $agent_pkg (will be deprecated)"
        continue
    fi
    
    if [[ "$agent_pkg" == "agent-os-protocol" ]]; then
        echo "🔄 Skipping $agent_pkg (will be merged into $pantheon_pkg)"
        continue
    fi
    
    pkg_dir="packages/$pantheon_pkg"
    
    if [[ -d "$pkg_dir" ]]; then
        echo "⚠️  Package $pantheon_pkg already exists, skipping creation"
    else
        echo "📦 Creating $pantheon_pkg package..."
        mkdir -p "$pkg_dir/src"
        echo "Created $pkg_dir"
    fi
done

# Phase 2: Copy package.json files with updated names
echo ""
echo "📋 Phase 2: Creating updated package.json files..."

for agent_pkg in "${!PACKAGE_MAPPINGS[@]}"; do
    pantheon_pkg="${PACKAGE_MAPPINGS[$agent_pkg]}"
    
    if [[ "$pantheon_pkg" == "DEPRECATED" ]] || [[ "$agent_pkg" == "agent-os-protocol" ]]; then
        continue
    fi
    
    agent_dir="packages/agents/$agent_pkg"
    pantheon_dir="packages/$pantheon_pkg"
    
    if [[ -f "$agent_dir/package.json" ]]; then
        echo "🔄 Converting $agent_pkg → $pantheon_pkg"
        
        # Read and transform package.json
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$agent_dir/package.json', 'utf8'));
        
        // Update package name
        pkg.name = '@promethean-os/$pantheon_pkg';
        
        // Update description
        if (pkg.description) {
            pkg.description = pkg.description.replace(/agent/gi, 'Pantheon agent');
        }
        
        // Update dependencies
        if (pkg.dependencies) {
            Object.keys(pkg.dependencies).forEach(dep => {
                if (dep.startsWith('@promethean-os/agent-')) {
                    const newDep = dep.replace('@promethean-os/agent-', '@promethean-os/pantheon-');
                    if (newDep !== '@promethean-os/pantheon-agent') {  // Skip deprecated
                        pkg.dependencies[newDep] = pkg.dependencies[dep];
                        delete pkg.dependencies[dep];
                    }
                }
            });
        }
        
        // Update peerDependencies
        if (pkg.peerDependencies) {
            Object.keys(pkg.peerDependencies).forEach(dep => {
                if (dep.startsWith('@promethean-os/agent-')) {
                    const newDep = dep.replace('@promethean-os/agent-', '@promethean-os/pantheon-');
                    if (newDep !== '@promethean-os/pantheon-agent') {  // Skip deprecated
                        pkg.peerDependencies[newDep] = pkg.peerDependencies[dep];
                        delete pkg.peerDependencies[dep];
                    }
                }
            });
        }
        
        // Write new package.json
        fs.writeFileSync('$pantheon_dir/package.json', JSON.stringify(pkg, null, 2));
        console.log('✅ Updated package.json for $pantheon_pkg');
        "
    else
        echo "⚠️  No package.json found for $agent_pkg"
    fi
done

echo ""
echo "✅ Phase 1 & 2 completed: Package structure created"
echo ""
echo "🔄 Next steps:"
echo "   1. Copy source code from agent packages to pantheon packages"
echo "   2. Update import statements in source code"
echo "   3. Update dependent packages' package.json files"
echo "   4. Create compatibility shims for old packages"
echo "   5. Update documentation"
echo ""
echo "🚀 Run migration-phase2.sh to continue with source code migration"