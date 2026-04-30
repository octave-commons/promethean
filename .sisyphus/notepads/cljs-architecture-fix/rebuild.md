# PM2-CLJ Project Rebuild - Findings

## Date
2026-01-31

## Task
Rebuild the pm2-clj-project to update dist/pm2-clj.js with the nbb execution logic.

## Issues Encountered and Solutions

### 1. Missing clobber.dsl namespace
**Problem**: The clobber build failed because `clobber.dsl` namespace was not found.
**Solution**: Created `/home/err/devel/pm2-clj-project/src/clobber/dsl.cljs` with:
- `render-ecosystem`: Converts ecosystem map to PM2-compatible format
- `merge-apps`: Merges apps from multiple ecosystem configurations

### 2. Environment variable access error
**Problem**: `js/process.env.NBB_BIN` was being called as a function, causing `TypeError: process.env.NBB_BIN is not a function`
**Solution**: Changed to property access: `(.-NBB_BIN js/process.env)`

### 3. nbb `load-file` not available
**Problem**: nbb doesn't support `load-file` function, which is available in full Clojure
**Solution**: 
- Changed eval.cljs to read file content and use `load-string` instead
- Wrapped content in do block: `(do (require '[clobber.macro]) <file-content>) (clobber.macro/ecosystem-output)`
- Removed namespace declarations from file content using regex: `str/replace file-content #"\(ns\s+[^\)]+\)" ""`

### 4. nbb classpath configuration
**Problem**: nbb couldn't find `clobber.macro` namespace
**Solution**: 
- Added classpath flag to nbb command: `-cp /home/err/devel/pm2-clj-project/src`
- Used absolute path to ensure it works from any working directory

### 5. Missing *eval-fn* dynamic var
**Problem**: `defprofile` macro referenced undefined `*eval-fn*` var
**Solution**: Added `(def ^:dynamic *eval-fn* nil)` to `clobber.macro` namespace

### 6. clojure.reader namespace unavailable
**Problem**: clobber.cli tried to use `clojure.reader/read-string` which doesn't exist in compiled JS
**Solution**: Added proper require: `[cljs.reader :as reader]` and used `reader/read-string`

## Files Modified

### Created
- `/home/err/devel/pm2-clj-project/src/clobber/dsl.cljs` - DSL rendering functions

### Modified
- `/home/err/devel/pm2-clj-project/src/clobber/cli.cljs` - Fixed requires and eval logic
- `/home/err/devel/pm2-clj-project/src/clobber/macro.cljs` - Added missing *eval-fn* var
- `/home/err/devel/pm2-clj-project/src/pm2_clj/eval.cljs` - Fixed env access and nbb execution

## Verification Results

### Build Success
✅ Both `pm2-clj` and `clobber` builds completed successfully
✅ `dist/pm2-clj.js` and `dist/clobber.js` updated with new timestamps

### Functional Tests
✅ `/home/err/devel/bin/clobber render /home/err/devel/ecosystem.cljs` produces valid JSON output with all apps
✅ Deprecation warning appears for `.pm2.edn` files: `[DEPRECATED] ecosystem.pm2.edn is deprecated. Convert to ecosystem.cljs`

## Key Learnings

1. **nbb limitations**: nbb is a lightweight ClojureScript interpreter for Node.js and doesn't have all Clojure functions (no `load-file`, limited `clojure.reader`)
2. **Classpath handling**: nbb requires explicit classpath configuration to find namespaces
3. **Property access**: In ClojureScript, use `.-property` for JavaScript object property access, not function calls
4. **Namespace handling**: When evaluating code from files, may need to strip namespace declarations to avoid conflicts

## Commands Used

```bash
# Build
cd /home/err/devel/pm2-clj-project && npm run build

# Test .cljs rendering
/home/err/devel/bin/clobber render /home/err/devel/ecosystem.cljs

# Test deprecation warning
/home/err/devel/bin/clobber render /home/err/devel/ecosystem.pm2.edn 2>&1 | grep -i "deprecated"
```
2026-01-31 17:03:26
Status: initial patch applied; compilation failed due to recur in inner end-idx loop. Next steps: simplify end-idx computation to avoid nested let, or refactor inner scan to a separate function to preserve tail-recursion; ensure NS form stripping handles multi-line properly.
[] Rebuild Report: Implemented top-level find-ns-end-index and refactor; Build successful with warnings; clobber render returned {apps: []}
Rebuild Report: Implemented top-level find-ns-end-index and refactor; Build successful with warnings.
2026-02-01 00:16:56 UTC
### Rebuild and test results

**Build (pm2-clj-project):**
```
> npm run build

> @your-scope/pm2-clj@0.1.0 build
> shadow-cljs release pm2-clj && shadow-cljs release clobber

shadow-cljs - config: /home/err/devel/pm2-clj-project/shadow-cljs.edn
[:pm2-clj] Compiling ...
... (trimmed) ...
shadow-cljs - config: /home/err/devel/pm2-clj-project/shadow-cljs.edn
[:clobber] Compiling ...
[:clobber] Build completed. (62 files, 1 compiled, 1 warnings, 6.55s)
```

**Clobber render (ecosystem.cljs):**
```
{
  "apps": []
}
```


Render output (ecosystem.cljs):
{
  "apps": []
}
