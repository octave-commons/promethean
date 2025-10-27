#!/bin/bash

# Pantheon Migration Script - Phase 3
# Update dependent packages and create compatibility shims

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

echo "🔗 Phase 3: Updating dependent packages and creating compatibility shims"
echo "=================================================================="

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

# Phase 1: Update dependent packages
echo "📦 Updating dependent packages..."

# List of packages that depend on agent packages
dependent_packages=(
    "packages/kanban/package.json"
    "packages/cephalon/package.json"
    "packages/discord/package.json"
    "packages/ai/nl-parser/package.json"
    "packages/mcp-kanban-bridge/package.json"
    "packages/enso/enso-agent-communication/package.json"
    "packages/docs-system/package.json"
    "packages/pantheon-core/package.json"
    "packages/pantheon/package.json"
)

for pkg_file in "${dependent_packages[@]}"; do
    if [[ -f "$pkg_file" ]]; then
        echo "  🔧 Updating $(basename $(dirname $pkg_file))/package.json"
        
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$pkg_file', 'utf8'));
        
        let updated = false;
        
        // Update dependencies
        if (pkg.dependencies) {
            Object.keys(pkg.dependencies).forEach(dep => {
                if (dep.startsWith('@promethean-os/agent-')) {
                    const newDep = dep.replace('@promethean-os/agent-', '@promethean-os/pantheon-');
                    if (newDep !== '@promethean-os/pantheon-agent') {  // Skip deprecated
                        pkg.dependencies[newDep] = pkg.dependencies[dep];
                        delete pkg.dependencies[dep];
                        updated = true;
                        console.log('    📝 ' + dep + ' → ' + newDep);
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
                        updated = true;
                        console.log('    📝 ' + dep + ' → ' + newDep + ' (peer)');
                    }
                }
            });
        }
        
        // Update devDependencies
        if (pkg.devDependencies) {
            Object.keys(pkg.devDependencies).forEach(dep => {
                if (dep.startsWith('@promethean-os/agent-')) {
                    const newDep = dep.replace('@promethean-os/agent-', '@promethean-os/pantheon-');
                    if (newDep !== '@promethean-os/pantheon-agent') {  // Skip deprecated
                        pkg.devDependencies[newDep] = pkg.devDependencies[dep];
                        delete pkg.devDependencies[dep];
                        updated = true;
                        console.log('    📝 ' + dep + ' → ' + newDep + ' (dev)');
                    }
                }
            });
        }
        
        if (updated) {
            fs.writeFileSync('$pkg_file', JSON.stringify(pkg, null, 2));
            console.log('  ✅ Updated $pkg_file');
        } else {
            console.log('  ⚠️  No agent dependencies found in $pkg_file');
        }
        "
    else
        echo "  ⚠️  Package file not found: $pkg_file"
    fi
done

# Phase 2: Update source code imports in dependent packages
echo ""
echo "🔄 Updating source code imports in dependent packages..."

source_dirs=(
    "packages/cephalon/src"
    "packages/kanban/src"
    "packages/discord/src"
    "packages/ai/nl-parser/src"
    "packages/mcp-kanban-bridge/src"
    "packages/enso/enso-agent-communication/src"
    "packages/docs-system/src"
)

for src_dir in "${source_dirs[@]}"; do
    if [[ -d "$src_dir" ]]; then
        echo "  🔧 Updating imports in $(basename $(dirname $src_dir))"
        
        find "$src_dir" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read file; do
            # Check if file contains agent imports
            if grep -q "@promethean-os/agent-" "$file"; then
                # Update import statements
                sed -i.bak \
                    -e "s/@promethean-os\/agent-\([^']*\)/@promethean-os\/pantheon-\1/g" \
                    -e "s/@promethean-os\/agents-workflow/@promethean-os\/pantheon-workflow/g" \
                    "$file"
                
                echo "    📝 Updated $(basename $file)"
                rm -f "$file.bak"
            fi
        done
    fi
done

# Phase 3: Create compatibility shims
echo ""
echo "🔄 Creating compatibility shims for backward compatibility..."

for agent_pkg in "${!PACKAGE_MAPPINGS[@]}"; do
    pantheon_pkg="${PACKAGE_MAPPINGS[$agent_pkg]}"
    
    if [[ "$agent_pkg" == "agent" ]]; then
        continue  # Skip deprecated agent package
    fi
    
    agent_dir="packages/agents/$agent_pkg"
    
    if [[ -d "$agent_dir" ]]; then
        echo "  🔄 Creating compatibility shim for $agent_pkg"
        
        # Create new package.json for compatibility shim
        cat > "$agent_dir/package.json" << EOF
{
  "name": "@promethean-os/$agent_pkg",
  "version": "0.0.1-deprecated",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "clean": "rimraf dist",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "ava",
    "lint": "pnpm exec eslint ."
  },
  "dependencies": {
    "@promethean-os/$pantheon_pkg": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ava": "^5.3.1",
    "typescript": "^5.3.3",
    "rimraf": "^6.0.1"
  },
  "license": "GPL-3.0-only",
  "deprecated": "This package is deprecated. Use @promethean-os/$pantheon_pkg instead."
}
EOF
        
        # Create index.ts that re-exports from pantheon package
        mkdir -p "$agent_dir/src"
        cat > "$agent_dir/src/index.ts" << EOF
// ⚠️  DEPRECATED: This package is deprecated
// Please use @promethean-os/$pantheon_pkg instead
// 
// This compatibility shim will be removed in a future version.

export * from '@promethean-os/$pantheon_pkg';

// Add deprecation warning for development
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  DEPRECATED: @promethean-os/$agent_pkg is deprecated. Use @promethean-os/$pantheon_pkg instead.');
}
EOF
        
        # Create tsconfig.json for compatibility shim
        cat > "$agent_dir/tsconfig.json" << EOF
{
  "extends": "../../config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts"]
}
EOF
        
        echo "    ✅ Created compatibility shim for $agent_pkg"
    fi
done

# Phase 4: Update main package.json
echo ""
echo "📝 Updating main package.json..."

if [[ -f "package.json" ]]; then
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    let updated = false;
    
    // Update dependencies
    if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach(dep => {
            if (dep.startsWith('@promethean-os/agent-')) {
                const newDep = dep.replace('@promethean-os/agent-', '@promethean-os/pantheon-');
                if (newDep !== '@promethean-os/pantheon-agent') {  // Skip deprecated
                    pkg.dependencies[newDep] = pkg.dependencies[dep];
                    delete pkg.dependencies[dep];
                    updated = true;
                    console.log('    📝 ' + dep + ' → ' + newDep);
                }
            }
        });
    }
    
    if (updated) {
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        console.log('  ✅ Updated main package.json');
    } else {
        console.log('  ⚠️  No agent dependencies found in main package.json');
    }
    "
fi

echo ""
echo "✅ Phase 3 completed: Dependencies updated and compatibility shims created"
echo ""
echo "🔄 Next steps:"
echo "   1. Update main documentation (README.md, docs/)"
echo "   2. Run 'pnpm install' to update workspace"
echo "   3. Build and test all packages"
echo "   4. Fix any remaining import issues"
echo "   5. Update CI/CD pipelines"
echo ""
echo "🚀 Run migration-phase4.sh to continue with documentation updates"