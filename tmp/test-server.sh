#!/bin/bash
# Test if page refresh test server is running

echo "🔍 Checking page refresh test server..."

if node -e "const http = require('http'); http.get('http://localhost:8765/page-refresh-test.html', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));" 2>/dev/null; then
    echo "✅ Server is running!"
    echo ""
    echo "📄 Open in browser:"
    echo "   http://localhost:8765/page-refresh-test.html"
    echo ""
    echo "📚 Read the docs:"
    echo "   /app/workspace/devel/tmp/README.md"
    echo "   /app/workspace/devel/tmp/QUICKREF.md"
else
    echo "❌ Server not running"
    echo ""
    echo "🚀 Start server with:"
    echo "   cd /app/workspace/devel/tmp && node server.js"
fi
