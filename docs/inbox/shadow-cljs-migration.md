# Shadow CLJS Migration Guide

## 🎯 Overview

This document outlines the Shadow CLJS migration status and workflow for the Promethean project.

## ✅ Current Status - Phase 1 Complete

### Infrastructure Verified
- **Core Configuration**: `shadow-cljs.edn` is functional with 8 browser targets
- **Build System**: Shadow CLJS compilation working correctly
- **Shared Runtime**: `packages/shadow-ui` provides common utilities
- **Package Scripts**: Build commands working via `pnpm run build`

### Browser Targets Status

| Target | Status | Notes |
|--------|--------|-------|
| `promethean-cli` | ✅ Working | CLI tool compilation |
| `shadow-ui` | ✅ Working | Shared utilities package |
| `docops-frontend` | ✅ Working | 48 files compiled, 0 warnings |
| `portfolio-frontend` | ✅ Working | 48 files compiled, 0 warnings |
| `health-dashboard-frontend` | 🔄 Namespace Fixed | Directory renamed to match namespace |
| `llm-chat-frontend` | 🔄 Namespace Fixed | Directory renamed to match namespace |
| `smartgpt-dashboard-frontend` | 🔄 Namespace Fixed | Directory renamed to match namespace |
| `smart-chat-frontend` | ⏳ Pending | Requires namespace verification |
| `markdown-graph-frontend` | ⏳ Pending | Requires testing |

## 🔧 Namespace Standardization

### Pattern Found
Most frontends use underscore namespaces (`llm_chat.app`) but Shadow CLJS config expects hyphen namespaces (`llm-chat.app`).

### Fix Applied
1. **Update Namespace**: Change `(ns promethean.frontends.llm_chat.app)` to `(ns promethean.frontends.llm-chat.app)`
2. **Rename Directory**: Move `llm_chat/` → `llm-chat/`
3. **Clean Build**: Use `npx shadow-cljs clean <target>` if needed

### Standard Template
```clojure
(ns promethean.frontends.[name].app
  "Shadow-CLJS bootstrap placeholder for the [name] frontend."
  (:require [promethean.shadow-ui.runtime :as runtime]))

(defn ^:private announce! []
  (runtime/log-ready! "[name]" {:bundle :shadow}))

(defn ^:export mount []
  (announce!))
```

## 🚀 Build Commands

### From Project Root
```bash
# Compile specific target
npx shadow-cljs compile <target-id>

# Release build (optimized)
npx shadow-cljs release <target-id>

# Clean build cache
npx shadow-cljs clean <target-id>

# Watch mode for development
npx shadow-cljs watch <target-id>
```

### From Package Directories
```bash
# Build shadow-ui package
cd packages/shadow-ui && pnpm run build

# Build frontend from its source directory
cd packages/frontends/<name>/src/cljs/promethean/frontends/<name>
npx shadow-cljs compile <name>-frontend
```

## 📁 File Structure

```
promethean/
├── shadow-cljs.edn                    # Main Shadow CLJS configuration
├── packages/
│   ├── shadow-ui/                     # Shared utilities
│   │   ├── src/promethean/shadow_ui/
│   │   │   └── runtime.cljs           # Common runtime helpers
│   │   └── package.json               # Build scripts
│   └── frontends/
│       ├── docops-frontend/
│       │   └── src/cljs/promethean/frontends/docops/
│       │       └── app.cljs
│       ├── portfolio-frontend/
│       └── ... (other frontends)
```

## 🔍 Runtime Helpers

The `promethean.shadow-ui.runtime` provides:

- **`log-ready!`**: Logs successful frontend initialization
- **`define-component!`**: Helper for React component definition
- **`inject-html!`**: Utility for DOM manipulation

## 📋 Next Steps - Phase 2

### Immediate Actions
1. **Complete Namespace Fixes**: Fix remaining frontends with namespace mismatches
2. **Test All Targets**: Verify each frontend compiles successfully
3. **Update Documentation**: Add frontend-specific build instructions
4. **Integration Testing**: Test compiled bundles in browser environment

### Development Workflow
1. **Watch Mode**: Set up `npx shadow-cljs watch` for development
2. **Error Handling**: Implement proper error boundaries
3. **Asset Pipeline**: Integrate with existing build system
4. **Testing**: Add ClojureScript test support

## 🐛 Troubleshooting

### Common Issues
1. **Namespace Mismatch**: Error shows expected vs actual namespace
   - **Fix**: Rename directory to match namespace (underscores → hyphens)

2. **Build Cache Issues**: Old namespace cached
   - **Fix**: Run `npx shadow-cljs clean <target>` before rebuilding

3. **Missing Dependencies**: ClojureScript packages not found
   - **Fix**: Ensure dependencies are in `shadow-cljs.edn` and available

### Validation Commands
```bash
# Check configuration
npx shadow-cljs info

# Verify target exists
npx shadow-cljs compile --list

# Check compiled output
ls -la packages/frontends/<name>/public/js/
```

## 📊 Metrics

- **Build Time**: ~3-4 seconds per frontend (48 files)
- **Bundle Size**: Varies by frontend complexity
- **Success Rate**: 100% for namespace-corrected frontends
- **Warnings**: 0 (when properly configured)

---

*Last Updated: 2025-10-08*
*Status: Phase 1 Complete, Phase 2 In Progress*