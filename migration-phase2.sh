#!/bin/bash

# Pantheon Migration Script - Phase 2
# Source code migration and import updates

set -e

echo "🔄 Phase 2: Migrating source code and updating imports"
echo "=================================================="

# Define package mappings
declare -A PACKAGE_MAPPINGS=(
    ["agent-ecs"]="pantheon-ecs"
    ["agent-state"]="pantheon-state"
    ["agent-protocol"]="pantheon-protocol"
    ["agents-workflow"]="pantheon-workflow"
    ["agent-coordination"]="pantheon-coordination"
    ["agent-generator"]="pantheon-generator"
    ["agent-orchestrator"]="pantheon-orchestrator"
    ["agent-management-ui"]="pantheon-ui"
)

# Phase 1: Copy source code
echo "📁 Copying source code from agent packages to pantheon packages..."

for agent_pkg in "${!PACKAGE_MAPPINGS[@]}"; do
    pantheon_pkg="${PACKAGE_MAPPINGS[$agent_pkg]}"
    
    agent_dir="packages/agents/$agent_pkg"
    pantheon_dir="packages/$pantheon_pkg"
    
    if [[ -d "$agent_dir/src" ]]; then
        echo "📋 Copying $agent_pkg/src → $pantheon_pkg/src"
        cp -r "$agent_dir/src"/* "$pantheon_dir/src/"
        
        # Copy other important files
        for file in README.md tsconfig.json ava.config.mjs project.json .prettierrc.json LICENSE.txt; do
            if [[ -f "$agent_dir/$file" ]]; then
                cp "$agent_dir/$file" "$pantheon_dir/"
                echo "  📄 Copied $file"
            fi
        done
    else
        echo "⚠️  No src directory found for $agent_pkg"
    fi
done

# Phase 2: Update import statements in source code
echo ""
echo "🔄 Updating import statements in pantheon packages..."

for pantheon_pkg in "${PACKAGE_MAPPINGS[@]}"; do
    pantheon_dir="packages/$pantheon_pkg"
    
    if [[ -d "$pantheon_dir/src" ]]; then
        echo "  🔧 Updating imports in $pantheon_pkg"
        
        # Update TypeScript and JavaScript files
        find "$pantheon_dir/src" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read file; do
            # Update import statements
            sed -i.bak \
                -e "s/@promethean-os\/agent-\([^']*\)/@promethean-os\/pantheon-\1/g" \
                -e "s/@promethean-os\/agents-workflow/@promethean-os\/pantheon-workflow/g" \
                -e "s/from ['\"]agent-/from ['\"]pantheon-/g" \
                "$file"
            
            # Remove backup files
            rm -f "$file.bak"
        done
        
        # Update package.json files (if any in subdirectories)
        find "$pantheon_dir" -name "package.json" | while read file; do
            if [[ "$file" != "$pantheon_dir/package.json" ]]; then
                node -e "
                const fs = require('fs');
                const pkg = JSON.parse(fs.readFileSync('$file', 'utf8'));
                
                if (pkg.dependencies) {
                    Object.keys(pkg.dependencies).forEach(dep => {
                        if (dep.startsWith('@promethean-os/agent-')) {
                            const newDep = dep.replace('@promethean-os/agent-', '@promethean-os/pantheon-');
                            if (newDep !== '@promethean-os/pantheon-agent') {
                                pkg.dependencies[newDep] = pkg.dependencies[dep];
                                delete pkg.dependencies[dep];
                            }
                        }
                    });
                }
                
                fs.writeFileSync('$file', JSON.stringify(pkg, null, 2));
                "
            fi
        done
    fi
done

# Phase 3: Handle special case - agent-os-protocol merge into pantheon-protocol
echo ""
echo "🔀 Merging agent-os-protocol into pantheon-protocol..."

if [[ -d "packages/agents/agent-os-protocol/src" ]]; then
    protocol_dir="packages/pantheon-protocol/src"
    
    echo "  📋 Merging agent-os-protocol source files"
    cp -r packages/agents/agent-os-protocol/src/* "$protocol_dir/"
    
    # Update imports in merged files
    find "$protocol_dir" -name "*.ts" -o -name "*.js" | while read file; do
        sed -i.bak \
            -e "s/@promethean-os\/agent-os-protocol/@promethean-os\/pantheon-protocol/g" \
            "$file"
        rm -f "$file.bak"
    done
fi

# Phase 4: Update README files
echo ""
echo "📖 Updating README files..."

for pantheon_pkg in "${PACKAGE_MAPPINGS[@]}"; do
    pantheon_dir="packages/$pantheon_pkg"
    readme_file="$pantheon_dir/README.md"
    
    if [[ -f "$readme_file" ]]; then
        echo "  📝 Updating README for $pantheon_pkg"
        
        sed -i.bak \
            -e "s/@promethean-os\/agent-\([^)]*\)/@promethean-os\/pantheon-\1/g" \
            -e "s/agent-\([a-zA-Z-]*\)/pantheon-\1/g" \
            -e "s/Agent \([a-zA-Z-]*\)/Pantheon \1/g" \
            -e "s/agent package/pantheon package/g" \
            "$readme_file"
        
        rm -f "$readme_file.bak"
    fi
done

echo ""
echo "✅ Phase 2 completed: Source code migrated and imports updated"
echo ""
echo "🔄 Next steps:"
echo "   1. Update dependent packages' package.json files"
echo "   2. Create compatibility shims for old packages"
echo "   3. Update main documentation"
echo "   4. Run tests and fix any issues"
echo ""
echo "🚀 Run migration-phase3.sh to continue with dependency updates"