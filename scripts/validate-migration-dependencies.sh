#!/bin/bash

# Dependency Validation Script for Pantheon Migration
# Finds all agent package dependencies across the codebase

set -e

echo "🔍 Scanning for agent package dependencies..."

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Agent packages to search for
AGENT_PACKAGES=(
    "@promethean-os/agent"
    "@promethean-os/agent-core"
    "@promethean-os/agent-ecs"
    "@promethean-os/agent-state"
    "@promethean-os/agent-protocol"
    "@promethean-os/agent-workflow"
    "@promethean-os/agent-coordination"
    "@promethean-os/agent-orchestrator"
    "@promethean-os/agent-generator"
    "@promethean-os/agent-management-ui"
)

# Pantheon packages (for validation)
PANTHEON_PACKAGES=(
    "@promethean-os/pantheon-core"
    "@promethean-os/pantheon-ecs"
    "@promethean-os/pantheon-state"
    "@promethean-os/pantheon-protocol"
    "@promethean-os/pantheon-workflow"
    "@promethean-os/pantheon-coordination"
    "@promethean-os/pantheon-orchestrator"
    "@promethean-os/pantheon-generator"
    "@promethean-os/pantheon-ui"
    "@promethean-os/pantheon-persistence"
    "@promethean-os/pantheon-mcp"
    "@promethean-os/pantheon-llm-openai"
    "@promethean-os/pantheon-llm-claude"
    "@promethean-os/pantheon-llm-opencode"
)

# Function to search for package usage
search_package_usage() {
    local package_name="$1"
    local search_pattern="$2"
    
    echo "🔍 Searching for ${package_name}..."
    
    # Search in source files
    local source_files=$(find packages/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist)
    local found_in_source=false
    
    for file in $source_files; do
        if grep -q "$search_pattern" "$file" 2>/dev/null; then
            if [ "$found_in_source" = false ]; then
                echo -e "${YELLOW}  Found in source files:${NC}"
                found_in_source=true
            fi
            echo "    $file"
            grep -n "$search_pattern" "$file" | sed 's/^/      /'
        fi
    done
    
    # Search in package.json files
    local package_files=$(find packages/ -name "package.json" | grep -v node_modules)
    local found_in_packages=false
    
    for file in $package_files; do
        if grep -q "$search_pattern" "$file" 2>/dev/null; then
            if [ "$found_in_packages" = false ]; then
                echo -e "${YELLOW}  Found in package.json:${NC}"
                found_in_packages=true
            fi
            echo "    $file"
            grep -n "$search_pattern" "$file" | sed 's/^/      /'
        fi
    done
    
    if [ "$found_in_source" = false ] && [ "$found_in_packages" = false ]; then
        echo -e "${GREEN}  ✅ No usage found${NC}"
    fi
    
    echo ""
}

# Function to validate pantheon package exports
validate_pantheon_exports() {
    echo "🔍 Validating pantheon package exports..."
    
    for package in "${PANTHEON_PACKAGES[@]}"; do
        local package_path="packages/${package#*@promethean-os/}"
        
        if [ -d "$package_path" ]; then
            # Check if package has proper exports
            if [ -f "$package_path/package.json" ]; then
                local has_exports=$(jq -e '.exports' "$package_path/package.json" >/dev/null 2>&1 && echo "true" || echo "false")
                if [ "$has_exports" = "true" ]; then
                    echo -e "${GREEN}  ✅ $package has exports${NC}"
                else
                    echo -e "${YELLOW}  ⚠️  $package missing exports${NC}"
                fi
            else
                echo -e "${RED}  ❌ $package missing package.json${NC}"
            fi
        else
            echo -e "${RED}  ❌ $package directory not found${NC}"
        fi
    done
    
    echo ""
}

# Function to check for circular dependencies
check_circular_deps() {
    echo "🔍 Checking for potential circular dependencies..."
    
    # Simple check: look for packages that depend on each other
    for agent_pkg in "${AGENT_PACKAGES[@]}"; do
        for pantheon_pkg in "${PANTHEON_PACKAGES[@]}"; do
            local agent_pattern="$agent_pkg"
            local pantheon_pattern="$pantheon_pkg"
            
            # Check if any package references both agent and pantheon versions
            local mixed_deps=$(find packages/ -name "package.json" -exec grep -l "$agent_pattern" {} \; | xargs -I {} grep -l "$pantheon_pattern" {} 2>/dev/null || true)
            
            if [ -n "$mixed_deps" ]; then
                echo -e "${YELLOW}  ⚠️  Mixed dependencies found:${NC}"
                echo "$mixed_deps" | sed 's/^/    /'
            fi
        done
    done
    
    echo ""
}

# Function to generate migration report
generate_report() {
    echo "📊 Generating migration report..."
    
    local report_file="migration-dependency-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# Pantheon Migration Dependency Report

Generated: $(date)

## Agent Package Dependencies Found

EOF
    
    for package in "${AGENT_PACKAGES[@]}"; do
        echo "### $package" >> "$report_file"
        echo "" >> "$report_file"
        
        local search_pattern="$package"
        local findings=$(find packages/ -name "*.ts" -o -name "*.js" -o -name "package.json" | grep -v node_modules | grep -v dist | xargs grep -l "$search_pattern" 2>/dev/null || true)
        
        if [ -n "$findings" ]; then
            echo "$findings" | sed 's/^/- /' >> "$report_file"
        else
            echo "- No usage found ✅" >> "$report_file"
        fi
        
        echo "" >> "$report_file"
    done
    
    cat >> "$report_file" << EOF
## Pantheon Package Status

EOF
    
    for package in "${PANTHEON_PACKAGES[@]}"; do
        local package_path="packages/${package#*@promethean-os/}"
        echo "### $package" >> "$report_file"
        echo "" >> "$report_file"
        
        if [ -d "$package_path" ]; then
            echo "- ✅ Package exists" >> "$report_file"
            if [ -f "$package_path/package.json" ]; then
                echo "- ✅ package.json exists" >> "$report_file"
                local has_exports=$(jq -e '.exports' "$package_path/package.json" >/dev/null 2>&1 && echo "true" || echo "false")
                if [ "$has_exports" = "true" ]; then
                    echo "- ✅ Exports configured" >> "$report_file"
                else
                    echo "- ⚠️ Missing exports" >> "$report_file"
                fi
            else
                echo "- ❌ Missing package.json" >> "$report_file"
            fi
        else
            echo "- ❌ Package not found" >> "$report_file"
        fi
        
        echo "" >> "$report_file"
    done
    
    echo "📄 Report saved to: $report_file"
}

# Main execution
main() {
    echo "🚀 Starting Pantheon Migration Dependency Validation"
    echo "=================================================="
    echo ""
    
    # Search for agent package usage
    echo "📦 Agent Package Usage Analysis"
    echo "==============================="
    echo ""
    
    for package in "${AGENT_PACKAGES[@]}"; do
        search_package_usage "$package" "$package"
    done
    
    # Validate pantheon packages
    echo "📦 Pantheon Package Validation"
    echo "==============================="
    echo ""
    validate_pantheon_exports
    
    # Check for circular dependencies
    check_circular_deps
    
    # Generate report
    generate_report
    
    echo "✅ Dependency validation complete!"
    echo ""
    echo "Next steps:"
    echo "1. Review the generated report"
    echo "2. Update any remaining agent package dependencies"
    echo "3. Validate pantheon package exports"
    echo "4. Test migration scripts"
}

# Run main function
main "$@"