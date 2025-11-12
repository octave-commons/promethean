#!/bin/bash

# Array of packages to process
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

# Function to create .gitignore
create_gitignore() {
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
lib/
*.tsbuildinfo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Environment files
.env
.env.local
.env.*.local

# Coverage
coverage/
.nyc_output/

# Cache
.cache/
.parcel-cache/

# Temporary files
*.tmp
*.temp

# Clojure specific
.cpcache/
.nrepl-port/
.pom.xml
*.jar
target/
classes/

# Shadow-cljs
.shadow-cljs/
EOF
}

# Function to process a single package
process_package() {
    local pkg=$1
    echo "Processing $pkg..."
    
    cd "/home/err/devel/orgs/riatzukiza/promethean/packages/$pkg"
    
    # Create .gitignore
    create_gitignore
    
    # Clean and add files
    rm -rf node_modules dist build lib target classes .cpcache .shadow-cljs .nrepl-port 2>/dev/null
    git add .
    
    # Commit
    git commit -m "Initial commit for $pkg package"
    
    # Create branch
    git branch -M device/yoga
    
    echo "Completed $pkg"
}

# Process all packages
for pkg in "${packages[@]}"; do
    process_package "$pkg"
done

echo "All packages processed!"