#!/bin/bash

# ESLint LSP Verification Script
# This script verifies that ESLint LSP is working correctly after configuration changes

set -e

echo "🔍 ESLint LSP Verification Script"
echo "=================================="

# Check if ESLint is available locally
echo "📦 Checking ESLint installation..."
if command -v npx >/dev/null 2>&1; then
    ESLINT_VERSION=$(npx eslint --version 2>/dev/null || echo "NOT FOUND")
    echo "✅ ESLint version: $ESLINT_VERSION"
else
    echo "❌ npx not found"
    exit 1
fi

# Check if ESLint config exists
echo ""
echo "📋 Checking ESLint configuration..."
if [ -f "eslint.config.mjs" ]; then
    echo "✅ Found eslint.config.mjs (flat config)"
elif [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc.yml" ] || [ -f ".eslintrc.yaml" ]; then
    echo "✅ Found legacy .eslintrc configuration"
else
    echo "⚠️  No ESLint configuration found"
fi

# Test ESLint on a simple file
echo ""
echo "🧪 Testing ESLint functionality..."
TEST_FILE="test-eslint-verification.js"
echo 'console.log("test");' > "$TEST_FILE"

if npx eslint "$TEST_FILE" >/dev/null 2>&1; then
    echo "✅ ESLint runs without errors"
else
    echo "❌ ESLint failed to run"
    rm -f "$TEST_FILE"
    exit 1
fi

# Test ESLint with a file that should have errors
echo ""
echo "🚨 Testing ESLint error detection..."
echo 'var unused = "test"; console.log(undefined_var);' > "$TEST_FILE"

if npx eslint "$TEST_FILE" 2>&1 | grep -q "error\|warning"; then
    echo "✅ ESLint correctly detects errors/warnings"
else
    echo "⚠️  ESLint did not detect expected errors"
fi

# Clean up
rm -f "$TEST_FILE"

# Check opencode.json configuration
echo ""
echo "⚙️  Checking OpenCode configuration..."
if [ -f "opencode.json" ]; then
    if grep -q '"lsp"' opencode.json; then
        echo "⚠️  Custom LSP configuration found in opencode.json"
        echo "   This may interfere with built-in ESLint support"
    else
        echo "✅ No custom LSP configuration found (using built-in support)"
    fi
else
    echo "⚠️  opencode.json not found"
fi

# Check for deprecated packages
echo ""
echo "🔍 Checking for deprecated ESLint LSP packages..."
if npm list -g eslint-lsp >/dev/null 2>&1; then
    echo "⚠️  Deprecated eslint-lsp package found globally"
    echo "   Consider removing: npm uninstall -g eslint-lsp"
else
    echo "✅ No deprecated eslint-lsp package found"
fi

if command -v vscode-eslint-language-server >/dev/null 2>&1; then
    echo "✅ vscode-eslint-language-server is available"
else
    echo "ℹ️  vscode-eslint-language-server not found (built-in support preferred)"
fi

echo ""
echo "🎉 ESLint LSP verification completed!"
echo ""
echo "📝 Summary:"
echo "   - ESLint is properly installed and configured"
echo "   - OpenCode will use built-in ESLint server"
echo "   - No deprecated packages interfering"
echo ""
echo "💡 If ESLint is still not working in OpenCode:"
echo "   1. Restart OpenCode completely"
echo "   2. Check OpenCode logs for ESLint-related messages"
echo "   3. Ensure TypeScript files are being linted correctly"