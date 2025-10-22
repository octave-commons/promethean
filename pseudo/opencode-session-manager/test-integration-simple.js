/**
 * Simple Integration Test for OpenCode Session Manager
 * Tests the basic functionality without Playwright dependencies
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function createTestServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Serve the demo.html file
      if (req.url === '/' || req.url === '/demo.html') {
        try {
          const html = fs.readFileSync(path.join(__dirname, 'demo.html'), 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading demo.html');
        }
      } else if (req.url.startsWith('/public/')) {
        // Serve static files
        try {
          const filePath = path.join(__dirname, req.url);
          const content = fs.readFileSync(filePath);
          const ext = path.extname(filePath);
          const contentType = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html'
          }[ext] || 'text/plain';
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        } catch (error) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });

    server.listen(3000, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('🌐 Test server running on http://localhost:3000');
        resolve(server);
      }
    });
  });
}

async function runSimpleTests() {
  console.log('🧪 Starting Simple Integration Tests...');
  
  let server;
  try {
    // Start test server
    server = await createTestServer();
    
    // Basic file checks
    console.log('📁 Checking required files...');
    
    const requiredFiles = [
      'demo.html',
      'public/js/main.js',
      'public/js/opencode-wrapper.js',
      'public/css/styles.css'
    ];
    
    for (const file of requiredFiles) {
      if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file} exists`);
      } else {
        throw new Error(`❌ Required file missing: ${file}`);
      }
    }
    
    // Check if main.js is compiled
    const mainJsPath = path.join(__dirname, 'public/js/main.js');
    const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    
    if (mainJsContent.includes('app.core.init') || mainJsContent.includes('enhanced-session-manager')) {
      console.log('✅ ClojureScript compilation successful');
    } else {
      console.log('⚠️  ClojureScript compilation may have issues');
    }
    
    // Check demo.html content
    const demoHtmlPath = path.join(__dirname, 'demo.html');
    const demoHtmlContent = fs.readFileSync(demoHtmlPath, 'utf8');
    
    if (demoHtmlContent.includes('enhanced-session-manager')) {
      console.log('✅ Demo HTML includes enhanced session manager');
    } else {
      throw new Error('❌ Demo HTML missing enhanced session manager');
    }
    
    if (demoHtmlContent.includes('opencode-wrapper.js')) {
      console.log('✅ Demo HTML includes OpenCode wrapper');
    } else {
      throw new Error('❌ Demo HTML missing OpenCode wrapper');
    }
    
    // Check package.json dependencies
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies && packageJson.dependencies['@opencode-ai/sdk']) {
      console.log('✅ OpenCode SDK dependency found');
    } else {
      console.log('⚠️  OpenCode SDK dependency not found in package.json');
    }
    
    console.log('\n🎉 Simple integration tests passed!');
    console.log('\n📋 Manual Testing Instructions:');
    console.log('1. Start the test server: node test-integration-simple.js');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Verify the enhanced session manager loads');
    console.log('4. Test creating a session');
    console.log('5. Test starting a code review');
    console.log('6. Check browser console for any errors');
    
  } catch (error) {
    console.error('❌ Simple integration test failed:', error.message);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSimpleTests()
    .then(() => {
      console.log('\n✅ All tests completed. Server is running for manual testing.');
      console.log('Press Ctrl+C to stop the server.');
      
      // Keep server running for manual testing
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down test server...');
        process.exit(0);
      });
    })
    .catch((error) => {
      console.error('❌ Tests failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestServer, runSimpleTests };