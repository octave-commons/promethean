#!/bin/bash

# Centralized Clojure MCP Server Launcher
# Usage: ./mcp-server.sh [unified|jvm|cljs|dev] [port]

set -e

MODE=${1:-"unified"}
PORT=${2:-7890}

echo "🚀 Starting Centralized Clojure MCP Server"
echo "Mode: $MODE"
echo "Port: $PORT"

# Function to start unified MCP server
start_unified() {
    echo "📦 Starting unified MCP server for all Clojure runtimes..."
    clojure -X:mcp-central :port $PORT
}

# Function to start JVM-specific MCP server
start_jvm() {
    echo "☕ Starting JVM-specific MCP server..."
    clojure -X:mcp-jvm :port $PORT
}

# Function to start ClojureScript-specific MCP server
start_cljs() {
    echo "🌐 Starting ClojureScript-specific MCP server..."
    clojure -X:mcp-cljs :port $PORT
}

# Function to start development MCP server
start_dev() {
    echo "🔧 Starting development MCP server with logging..."
    clojure -X:mcp-dev :port $PORT
}

# Function to test MCP server
start_test() {
    echo "🧪 Starting test MCP server..."
    clojure -X:mcp-test :port $PORT
}

# Main execution
case $MODE in
    "unified")
        start_unified
        ;;
    "jvm")
        start_jvm
        ;;
    "cljs")
        start_cljs
        ;;
    "dev")
        start_dev
        ;;
    "test")
        start_test
        ;;
    *)
        echo "❌ Unknown mode: $MODE"
        echo "Usage: $0 [unified|jvm|cljs|dev|test] [port]"
        echo ""
        echo "Modes:"
        echo "  unified - Support all Clojure runtimes (default)"
        echo "  jvm     - JVM Clojure only"
        echo "  cljs    - ClojureScript only"
        echo "  dev     - Development mode with logging"
        echo "  test    - Test mode"
        exit 1
        ;;
esac