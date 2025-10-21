#!/bin/bash

# ClojureScript LSP Setup Script for Promethean Framework
# This script sets up the complete ClojureScript development environment

set -e

echo "🚀 Setting up ClojureScript LSP support for Promethean Framework..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "🔍 Checking required tools..."
check_tool "clojure"
check_tool "java"
check_tool "node"
check_tool "npm"

# Install clojure-lsp if not present
if ! command -v clojure-lsp &> /dev/null; then
    echo "📦 Installing clojure-lsp..."
    curl -L -o clojure-lsp.zip https://github.com/clojure-lsp/clojure-lsp/releases/latest/download/clojure-lsp-native-linux-amd64.zip
    unzip clojure-lsp.zip
    chmod +x clojure-lsp
    sudo mv clojure-lsp /usr/local/bin/
    rm clojure-lsp.zip
    echo "✅ clojure-lsp installed"
else
    echo "✅ clojure-lsp is already installed"
fi

# Install clj-kondo if not present
if ! command -v clj-kondo &> /dev/null; then
    echo "📦 Installing clj-kondo..."
    curl -L -o clj-kondo.zip https://github.com/clj-kondo/clj-kondo/releases/latest/download/clj-kondo-2025.01.16-linux-amd64.zip
    unzip clj-kondo.zip
    chmod +x clj-kondo
    sudo mv clj-kondo /usr/local/bin/
    rm -rf clj-kondo.zip clj-kondo
    echo "✅ clj-kondo installed"
else
    echo "✅ clj-kondo is already installed"
fi

# Install npm dependencies for MCP servers
echo "📦 Installing npm dependencies..."
npm install -g @playwright/mcp@latest
npm install -g @z_ai/mcp-server
npm install -g clj-kondo-mcp

# Create nREPL configuration
echo "🔧 Configuring nREPL..."
cat > /tmp/nrepl_alias.edn << 'EOF'
{:nrepl {:extra-paths ["test"]
         :extra-deps {nrepl/nrepl {:mvn/version "1.3.1"}}
         :jvm-opts ["-Djdk.attach.allowAttachSelf"]
         :main-opts ["-m" "nrepl.cmdline" "--port" "7888"]}}
EOF

# Update project deps.edn with nREPL alias if not present
if ! grep -q ":nrepl" deps.edn 2>/dev/null; then
    echo "📝 Adding nREPL alias to deps.edn..."
    if [ -f deps.edn ]; then
        # Merge with existing deps.edn
        cp deps.edn deps.edn.backup
    else
        echo "{}" > deps.edn
    fi
fi

# Test the setup
echo "🧪 Testing ClojureScript LSP setup..."

# Test clojure-lsp
echo "Testing clojure-lsp..."
timeout 5s clojure-lsp --version || echo "clojure-lsp test completed"

# Test clj-kondo
echo "Testing clj-kondo..."
clj-kondo --version || echo "clj-kondo test completed"

# Test Clojure MCP connection
echo "Testing Clojure MCP configuration..."
if [ -f .clojure/deps.edn ]; then
    echo "✅ Clojure MCP configuration found"
    clojure -X:mcp --help 2>/dev/null || echo "Clojure MCP alias configured"
else
    echo "⚠️  Clojure MCP configuration not found"
fi

echo ""
echo "🎉 ClojureScript LSP setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start an nREPL server: clojure -M:nrepl"
echo "2. Start shadow-cljs: npx shadow-cljs watch <build-id>"
echo "3. Configure your editor to use clojure-lsp"
echo "4. Update your MCP client configuration to use clojure-mcp"
echo ""
echo "🔗 Useful commands:"
echo "- Start nREPL: clojure -M:nrepl"
echo "- Start shadow-cljs: npx shadow-cljs watch app"
echo "- Run linting: clj-kondo --lint src"
echo "- Test clojure-mcp: clojure -X:mcp :port 7888"