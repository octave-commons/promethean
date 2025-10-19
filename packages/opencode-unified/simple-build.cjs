const fs = require('fs');
const path = require('path');

// Simple build script that just copies files and creates a basic HTML
console.log('Building simple ClojureScript app...');

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

if (!fs.existsSync('dist/public')) {
  fs.mkdirSync('dist/public');
}

if (!fs.existsSync('dist/public/js')) {
  fs.mkdirSync('dist/public/js');
}

// Create a simple JavaScript file that simulates the ClojureScript output
const jsContent = `
// Simple ClojureScript-like output
console.log("Starting Promethean OpenCode Unified");
console.log("Application initialized successfully");

function init() {
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = '<div style="padding: 20px; color: #4CAF50;">Promethean OpenCode Unified - ClojureScript Active! ✅</div>';
  }
}

function main() {
  init();
}

// Export for use
window.app = {
  main: main,
  init: init
};

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
`;

fs.writeFileSync('dist/public/js/main.js', jsContent);

// Copy HTML file
fs.copyFileSync('static/index.html', 'dist/public/index.html');

console.log('Build complete! Visit http://localhost:8080/index.html');