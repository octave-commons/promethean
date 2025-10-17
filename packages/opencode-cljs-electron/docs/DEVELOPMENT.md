# Development Setup Guide

This guide provides comprehensive instructions for setting up a development environment for the Opencode ClojureScript Electron application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Build System](#build-system)
- [Debugging](#debugging)
- [Testing](#testing)
- [Plugin Development](#plugin-development)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 16.0 or higher
- **Java**: Version 11 or higher (for ClojureScript compilation)
- **Git**: For version control
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: 2GB free disk space

### Required Tools

#### Node.js and npm

```bash
# Install Node.js (includes npm)
# Download from https://nodejs.org/ or use version manager

# Verify installation
node --version  # Should be v16.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

#### Clojure CLI Tools

```bash
# Install Clojure CLI
# Download from https://clojure.org/guides/getting_started

# Verify installation
clojure --version
```

#### Java Development Kit

```bash
# Install OpenJDK 11 or higher
# On macOS with Homebrew:
brew install openjdk@11

# On Ubuntu:
sudo apt update
sudo apt install openjdk-11-jdk

# Verify installation
java -version  # Should be Java 11 or higher
```

#### Git

```bash
# Install Git (if not already installed)
# On macOS with Homebrew:
brew install git

# On Ubuntu:
sudo apt install git

# Verify installation
git --version
```

### Optional Development Tools

#### VS Code with Extensions

```bash
# Recommended VS Code extensions:
# - Calva: Clojure & ClojureScript IDE
# - Shadow-CLJS: ClojureScript development
# - ESLint: JavaScript linting
# - Prettier: Code formatting
```

#### Emacs with CIDER

```bash
# For Emacs users, install CIDER for ClojureScript development
# M-x package-install RET cider RET
```

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/your-org/promethean.git
cd promethean

# Navigate to the opencode-cljs-electron package
cd packages/opencode-cljs-electron
```

### 2. Install Node.js Dependencies

```bash
# Install production and development dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Install Clojure Dependencies

```bash
# Install Clojure dependencies
clojure -P -M:dev

# This will download and cache all required Clojure libraries
```

### 4. Verify Setup

```bash
# Check that all tools are working
npm run --help
npx shadow-cljs --version
```

### 5. Environment Configuration

```bash
# Create environment file if needed
cp .env.example .env

# Edit .env with your configuration
# NODE_ENV=development
# PORT=3000
# HOST=localhost
```

---

## Development Workflow

### Development Modes

#### 1. Electron Development (Primary)

```bash
# Start development with hot reload for Electron
npm run dev

# In a separate terminal, start Electron
npm run electron

# Or start both in parallel (recommended)
npm start
```

This will:

- Compile ClojureScript with hot reload
- Start shadow-cljs watch process
- Launch Electron with development tools
- Enable live reloading on file changes

#### 2. Web Server Development

```bash
# Start web development server
npm run dev:server

# In a separate terminal, start Node.js server
npm run server

# Or start both in parallel
npm run start:server
```

This will:

- Compile for web browser target
- Start development HTTP server
- Enable hot reload in browser
- Open browser at http://localhost:8080

### File Structure for Development

```
packages/opencode-cljs-electron/
├── src/                    # ClojureScript source code
│   ├── main.cljs          # Application entry point
│   └── app/               # Application modules
├── electron/              # Electron-specific code
│   ├── main.cljs          # Main process
│   ├── preload.cljs       # Preload script
│   └── server.cljs        # HTTP server
├── public/                # Static assets
│   ├── index.html         # Main HTML file
│   └── renderer/          # Compiled JS output
├── dist/                  # Compiled output
├── docs/                  # Documentation
├── shadow-cljs.edn        # Shadow-CLJS configuration
├── package.json           # Node.js configuration
└── deps.edn              # Clojure dependencies
```

### Making Changes

#### 1. ClojureScript Changes

```clojure
;; Edit any .cljs file in src/ or electron/
;; Changes will be automatically recompiled
;; Electron will reload automatically
```

#### 2. CSS/Styling Changes

```css
/* Edit styles in app/ui.cljs or layout.cljs */
/* Changes will hot reload automatically */
```

#### 3. Configuration Changes

```clojure
;; Edit shadow-cljs.edn for build configuration
;; Restart shadow-cljs after changes:
npm run dev
```

---

## Build System

### Shadow-CLJS Configuration

The build system is configured in `shadow-cljs.edn`:

```clojure
{:source-paths ["src" "electron"]
 :dependencies [[reagent/reagent "1.2.0"]
                [re-frame/re-frame "1.4.3"]]
 :builds
 {:renderer {:target :browser
             :output-dir "public/renderer"
             :modules {:main {:init-fn main/init}}
             :devtools {:http-root "public" :http-port 8080}}
  :main     {:target :node-script
             :output-to "dist/main.js"
             :main electron.main/start}
  :preload  {:target :node-script
             :output-to "dist/preload.js"
             :main electron.preload/start}
  :server   {:target :node-script
             :output-to "dist/server.js"
             :main electron.server/start}}}
```

### Build Commands

#### Development Builds

```bash
# Watch and compile all targets
npx shadow-cljs watch renderer preload main server

# Watch specific targets
npx shadow-cljs watch renderer
npx shadow-cljs watch main preload

# Compile once
npx shadow-cljs compile renderer
```

#### Production Builds

```bash
# Build for Electron app
npm run build:app

# Build for web deployment
npm run build:server

# Build all targets
npx shadow-cljs release renderer preload main server
```

### Build Optimization

#### Advanced Compilation

```clojure
;; In shadow-cljs.edn, for production:
:release {:compiler-options {:optimizations :advanced
                            :infer-externs true}}
```

#### Source Maps

```clojure
;; Enable source maps for debugging
:devtools {:source-map true
           :source-map-timestamp true}
```

---

## Debugging

### Electron Debugging

#### 1. Developer Tools

```bash
# Open developer tools automatically
# In electron/main.cljs, uncomment:
# (.openDevTools (.-webContents w))

# Or open via menu: View -> Toggle Developer Tools
```

#### 2. Console Logging

```clojure
;; Add console logging for debugging
(println "Debug info:" data)

;; Use console.group for grouped logging
(.group js/console "Buffer operations")
(println "Opening buffer:" buffer-id)
(.groupEnd js/console)
```

#### 3. REPL Debugging

```bash
# Connect to Shadow-CLJS REPL
# In terminal running shadow-cljs, look for:
# shadow-cljs - REPL - see: http://localhost:9630

# Connect with:
# - VS Code: Calva "Connect to a running REPL Server"
# - Emacs: M-x cider-connect
# - Browser: Open http://localhost:9630
```

### ClojureScript Debugging

#### 1. REPL Integration

```clojure
;; In the REPL, you can:
(require '[app.state :as state])
@state/app-state  ; View current state
(state/set-evil-mode! :insert)  ; Execute functions
```

#### 2. Component Debugging

```clojure
;; Add debug metadata to components
(defn my-component []
  ^{:debug true}
  [:div "Content"])

;; Use React DevTools for component inspection
```

#### 3. State Debugging

```clojure
;; Add watchers for state changes
(add-watch state/app-state :debug
  (fn [key ref old new]
    (println "State changed:" old " -> " new)))
```

### Common Debugging Scenarios

#### Hot Reload Not Working

```bash
# Check shadow-cljs is running
ps aux | grep shadow-cljs

# Restart shadow-cljs
npm run dev

# Clear cache
rm -rf .shadow-cljs/
npm run dev
```

#### Electron Won't Start

```bash
# Check compiled files exist
ls -la dist/

# Rebuild main process
npx shadow-cljs release main

# Check Electron installation
npm list electron
```

#### Opencode Connection Issues

```bash
# Check if Opencode server is running
curl http://localhost:3000/api/status

# Check network connectivity
# In browser console:
fetch('http://localhost:3000/api/status')
  .then(r => r.json())
  .then(console.log)
```

---

## Testing

### Unit Testing

#### 1. ClojureScript Tests

```clojure
;; Create test file: test/app/state_test.cljs
(ns app.state-test
  (:require [cljs.test :refer-macros [deftest testing is]]
            [app.state :as state]))

(deftest buffer-creation
  (testing "Buffer creation works"
    (let [buffer (state/create-buffer 1 "content")]
      (is (= (:id buffer) 1))
      (is (= (:content buffer) "content")))))
```

#### 2. Running Tests

```bash
# Run tests with shadow-cljs
npx shadow-cljs compile test
node out/test.js

# Or use karma for browser testing
npm test
```

### Integration Testing

#### 1. Electron Integration Tests

```javascript
// test/integration/electron.test.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

describe('Electron App', () => {
  let window;

  beforeAll(async () => {
    await app.whenReady();
    window = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  });

  afterAll(async () => {
    if (window) {
      window.close();
    }
    await app.quit();
  });

  test('window loads', async () => {
    await window.loadFile('public/index.html');
    expect(window.webContents.getURL()).toContain('index.html');
  });
});
```

#### 2. Running Integration Tests

```bash
# Run Electron integration tests
npm run test:integration

# Run web integration tests
npm run test:web
```

### End-to-End Testing

#### 1. Playwright Tests

```javascript
// test/e2e/editor.spec.js
const { test, expect } = require('@playwright/test');

test('editor basic functionality', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Test Evil mode
  await page.keyboard.press('i');
  await page.keyboard.type('Hello World');
  await page.keyboard.press('Escape');

  // Test movement
  await page.keyboard.press('0');
  const cursorPos = await page.evaluate(() => document.querySelector('.editor').selectionStart);

  expect(cursorPos).toBe(0);
});
```

#### 2. Running E2E Tests

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

---

## Plugin Development

### Creating a New Plugin

#### 1. Plugin Structure

```bash
# Create plugin directory
mkdir plugins/my-plugin
cd plugins/my-plugin

# Create plugin structure
mkdir -p src dist
touch manifest.json src/main.js
```

#### 2. Plugin Manifest

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "main": "src/main.js",
  "entry": "dist/index.js",
  "permissions": ["fs", "network"],
  "contributes": {
    "commands": [
      {
        "command": "my-plugin.hello",
        "title": "Hello World"
      }
    ]
  }
}
```

#### 3. Plugin Implementation

```javascript
// src/main.js
class MyPlugin {
  constructor(api) {
    this.api = api;
  }

  async activate() {
    console.log('My plugin activated');

    // Register command
    this.api.registerCommand('my-plugin.hello', () => {
      this.api.showNotification('Hello from my plugin!');
    });
  }

  async deactivate() {
    console.log('My plugin deactivated');
  }
}

module.exports = MyPlugin;
```

#### 4. Plugin Build

```bash
# Compile plugin
npm run build:plugin

# Or use webpack for complex plugins
npx webpack --config webpack.config.js
```

### Plugin Development Workflow

#### 1. Local Development

```bash
# Create symlink to plugin directory
ln -s /path/to/my-plugin plugins/my-plugin

# Restart Electron to load plugin
npm run electron
```

#### 2. Debugging Plugins

```javascript
// In plugin code
console.log('Plugin debug:', data);

// Use Electron developer tools to inspect plugin
```

#### 3. Testing Plugins

```javascript
// test/plugins/my-plugin.test.js
const MyPlugin = require('../../plugins/my-plugin/src/main.js');

describe('MyPlugin', () => {
  test('activates correctly', async () => {
    const mockApi = {
      registerCommand: jest.fn(),
      showNotification: jest.fn(),
    };

    const plugin = new MyPlugin(mockApi);
    await plugin.activate();

    expect(mockApi.registerCommand).toHaveBeenCalled();
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Clojure cache
rm -rf ~/.m2/repository/clojure
```

#### 2. Compilation Errors

```bash
# Check Java version
java -version

# Check Clojure version
clojure --version

# Recompile from scratch
rm -rf .shadow-cljs/ out/ dist/
npm run dev
```

#### 3. Electron Issues

```bash
# Check Electron installation
npm list electron

# Rebuild native modules
npm rebuild

# Check system dependencies
# On Linux: sudo apt-get install libgtk-3-dev libgconf-2-4
```

#### 4. Performance Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Use production build for testing
npm run build:app
npm run electron
```

### Getting Help

#### 1. Log Files

```bash
# Check Electron logs
# macOS: ~/Library/Logs/{app-name}/
# Linux: ~/.config/{app-name}/logs/
# Windows: %USERPROFILE%\AppData\Roaming\{app-name}\logs\

# Check shadow-cljs logs
# Look in terminal running shadow-cljs
```

#### 2. Community Resources

- GitHub Issues: Report bugs and request features
- Documentation: Check docs/ directory
- Community Forums: Ask questions and share knowledge

#### 3. Debug Information

```bash
# Collect system information
npm run env-info

# Generate bug report
npm run bug-report

# Check dependencies
npm ls
clojure -Stree
```

### Performance Optimization

#### 1. Development Performance

```bash
# Use faster compilation
# In shadow-cljs.edn:
:devtools {:autoload true}

# Exclude unnecessary dependencies
# In deps.edn:
:deps {org.clojure/clojure {:mvn/version "1.11.1"}
       org.clojure/clojurescript {:mvn/version "1.11.60"}}
```

#### 2. Memory Usage

```bash
# Monitor memory usage
# In Chrome DevTools: Performance tab
# Record performance profile and analyze

# Optimize Reagent renders
# Use shouldComponentUpdate or memoization
```

#### 3. Build Size

```bash
# Analyze bundle size
npm run analyze

# Optimize imports
# Use tree-shaking and dead code elimination
```

This development setup provides a comprehensive environment for building, testing, and debugging the Opencode ClojureScript Electron application.
