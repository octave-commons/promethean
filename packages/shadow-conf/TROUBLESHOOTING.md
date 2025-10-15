# Troubleshooting Guide

This guide provides comprehensive troubleshooting information for common issues encountered when using @promethean/shadow-conf.

## 📋 Table of Contents

- [Common Issues](#common-issues)
- [EDN File Issues](#edn-file-issues)
- [Path Resolution Issues](#path-resolution-issues)
- [CLI Issues](#cli-issues)
- [Performance Issues](#performance-issues)
- [Environment-Specific Issues](#environment-specific-issues)
- [Debugging Techniques](#debugging-techniques)
- [Getting Help](#getting-help)

## 🚨 Common Issues

### 1. "EDN document did not evaluate to a map"

**Problem**: Your EDN file doesn't have a top-level map structure.

**Symptoms**:
```
Error: EDN document /path/to/file.edn did not evaluate to a map.
```

**Causes**:
- EDN file doesn't start with `{`
- EDN file contains multiple top-level expressions
- EDN file is empty or contains only comments

**Solutions**:

```clojure
;; ❌ Wrong - Missing top-level map
{:name "app"}
{:version "1.0"}

;; ❌ Wrong - No map structure
"just a string"

;; ✅ Correct - Single top-level map
{:name "app"
 :version "1.0"
 :apps [{:script "./index.js"}]}
```

**Prevention**:
- Always wrap your configuration in a single map
- Use an EDN linter or validator
- Test your EDN files before processing

---

### 2. "Missing an :apps vector"

**Problem**: The EDN document doesn't contain an `:apps` section.

**Symptoms**:
```
Error: EDN document /path/to/file.edn is missing an :apps vector.
```

**Causes**:
- Missing `:apps` key in the EDN map
- `:apps` value is not an array/vector
- Typo in the key name (e.g., `:app` instead of `:apps`)

**Solutions**:

```clojure
;; ❌ Wrong - Missing :apps
{:name "my-config"
 :triggers [{:name "trigger"}]}

;; ❌ Wrong - :apps is not a vector
{:apps "not-a-vector"}

;; ✅ Correct - :apps is a vector (even if empty)
{:apps []
 :triggers [{:name "trigger"}]}

;; ✅ Correct - :apps with app definitions
{:apps [{:name "web-app" :script "./index.js"}]}
```

---

### 3. "App at index X is not a map"

**Problem**: An item in the `:apps` vector is not a map.

**Symptoms**:
```
Error: App at index 0 in /path/to/file.edn is not a map.
```

**Causes**:
- App definition is a string, number, or other primitive
- App definition is a list instead of a map
- Malformed EDN syntax

**Solutions**:

```clojure
;; ❌ Wrong - App is a string
{:apps ["web-app"]}

;; ❌ Wrong - App is a list
{:apps [(:name "web-app" :script "./index.js")]}

;; ✅ Correct - App is a map
{:apps [{:name "web-app" :script "./index.js"}]}
```

---

## 📄 EDN File Issues

### Invalid EDN Syntax

**Common Syntax Errors**:

```clojure
;; ❌ Unmatched brackets
{:apps [{:name "app"

;; ❌ Missing quotes
{:apps [{:name app :script "./index.js"}]}

;; ❌ Invalid characters in keywords
{:apps/name "app"}  ; Should be :apps-name or separate :apps and :name

;; ❌ Trailing comma (not valid in EDN)
{:apps [{:name "app"},]}

;; ✅ Correct syntax
{:apps [{:name "app" :script "./index.js"}]}
```

**Validation Tools**:

```bash
# Using jsedn CLI (if available)
npx jsedn your-config.edn

# Using a simple validation script
node -e "
import { loadEdnFile } from '@promethean/shadow-conf';
loadEdnFile('./ecosystem.edn')
  .then(() => console.log('✅ EDN is valid'))
  .catch(err => console.error('❌ Invalid EDN:', err.message));
"
```

### Character Encoding Issues

**Problem**: EDN files with non-UTF-8 encoding cause parsing errors.

**Symptoms**:
```
Error: Invalid character at position X
```

**Solutions**:
- Save files as UTF-8
- Check file encoding: `file -I your-config.edn`
- Convert encoding if needed: `iconv -f ISO-8859-1 -t UTF-8 input.edn > output.edn`

### Large File Issues

**Problem**: Very large EDN files cause memory or performance issues.

**Symptoms**:
- Out of memory errors
- Slow processing times
- Node.js process crashes

**Solutions**:
- Split large configurations into multiple files
- Use more compact EDN syntax
- Increase Node.js memory limit: `node --max-old-space-size=4096`

---

## 🛤 Path Resolution Issues

### Relative Path Problems

**Problem**: Generated paths don't match expected locations.

**Common Scenarios**:

```bash
# Directory structure
project/
├── services/
│   └── api/
│       └── ecosystem.edn
└── config/
    └── ecosystem.config.mjs (generated)
```

```clojure
;; In services/api/ecosystem.edn
{:apps [{:name "api"
         :script "../dist/index.js"     ; Relative to services/api/
         :cwd "./api"                   ; Relative to output dir (config/)
         :watch ["../src"]}             ; Relative to services/api/
```

**Generated Result**:
```javascript
// In config/ecosystem.config.mjs
export const apps = [
  {
    name: "api",
    script: "../services/api/dist/index.js",  // Resolved against config/
    cwd: "./api",                             // Resolved against config/
    watch: ["../services/api/src"]            // Resolved against config/
  }
];
```

**Solutions**:

1. **Understand Resolution Rules**:
   - Relative paths are resolved against the **output directory**
   - Use `../` to reference files outside the output directory
   - Use absolute paths for files that shouldn't be resolved

2. **Test Path Resolution**:
```typescript
import { generateEcosystem } from '@promethean/shadow-conf';

const result = await generateEcosystem({
  inputDir: './services',
  outputDir: './config'
});

console.log('Generated paths:', result.apps[0]);
```

3. **Use Absolute Paths for External Files**:
```clojure
{:apps [{:name "app"
         :script "/usr/local/bin/node"  ; Absolute path
         :env_file "/etc/app.env"}]}    ; Absolute path
```

### Windows Path Issues

**Problem**: Path separators and drive letters cause issues on Windows.

**Symptoms**:
- Incorrect path separators in generated files
- Drive letter handling problems
- Path resolution failures

**Solutions**:

```clojure
;; ✅ Use forward slashes (cross-platform)
{:apps [{:script "./dist/index.js"
         :watch ["./src" "./config"]}]}

;; ❌ Avoid backslashes in EDN
{:apps [{:script ".\\dist\\index.js"}]}  ; Problematic on Windows
```

**Generated Output**:
The package automatically normalizes paths to use forward slashes in the generated JavaScript files.

---

## 💻 CLI Issues

### Command Not Found

**Problem**: `shadow-conf` command is not available.

**Causes**:
- Package not installed globally
- PATH not updated
- Using wrong package manager

**Solutions**:

```bash
# Install globally
pnpm add -g @promethean/shadow-conf

# Or use npx
npx @promethean/shadow-conf ecosystem

# Or use local installation
pnpm exec shadow-conf ecosystem
```

### Permission Errors

**Problem**: Permission denied when accessing files or directories.

**Symptoms**:
```
Error: EACCES: permission denied, open '/path/to/file'
```

**Solutions**:

```bash
# Check file permissions
ls -la your-config.edn

# Fix permissions if needed
chmod 644 your-config.edn

# Check directory permissions
ls -ld your-directory/

# Fix directory permissions
chmod 755 your-directory/
```

### Argument Parsing Errors

**Problem**: CLI arguments not parsed correctly.

**Common Issues**:

```bash
# ❌ Missing value for option
shadow-conf ecosystem --input-dir

# ❌ Unknown option
shadow-conf ecosystem --invalid-option

# ❌ Option value starts with --
shadow-conf ecosystem --input-dir --another-option
```

**Correct Usage**:

```bash
# ✅ Space-separated
shadow-conf ecosystem --input-dir ./config --filename ecosystem.mjs

# ✅ Equals notation
shadow-conf ecosystem --input-dir=./config --filename=ecosystem.mjs

# ✅ Quoted values with spaces
shadow-conf ecosystem --input-dir "./my config"
```

---

## ⚡ Performance Issues

### Slow Processing

**Problem**: Processing takes too long with many files.

**Causes**:
- Large number of EDN files
- Very large individual files
- Complex nested structures
- Slow file system (network drives)

**Solutions**:

1. **Optimize File Structure**:
```
config/
├── apps/
│   ├── web.edn
│   ├── api.edn
│   └── worker.edn
├── automations/
│   ├── triggers.edn
│   ├── schedules.edn
│   └── actions.edn
└── shared.edn
```

2. **Use Excludes** (if supported):
```bash
# Process only specific directories
shadow-conf ecosystem --input-dir ./config/apps
```

3. **Monitor Performance**:
```typescript
import { generateEcosystem } from '@promethean/shadow-conf';

console.time('generation');
const result = await generateEcosystem();
console.timeEnd('generation');
console.log(`Processed ${result.files.length} files`);
```

### Memory Issues

**Problem**: Out of memory errors with large configurations.

**Symptoms**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit
JavaScript heap out of memory
```

**Solutions**:

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
shadow-conf ecosystem

# Or for one-time execution
node --max-old-space-size=4096 ./node_modules/.bin/shadow-conf ecosystem
```

**Optimization Strategies**:
- Split large configurations into smaller files
- Remove unnecessary data from EDN files
- Use more compact data structures

---

## 🌍 Environment-Specific Issues

### Node.js Version Compatibility

**Problem**: Incompatible Node.js version.

**Requirements**:
- Node.js 18.0.0 or higher
- npm or pnpm package manager

**Checking Version**:
```bash
node --version  # Should be 18.0.0+
pnpm --version
```

**Solutions**:
- Upgrade Node.js using nvm: `nvm install 18`
- Use npx to run with specific Node version
- Check package.json engines field

### Operating System Differences

#### Windows

**Common Issues**:
- Path separator differences
- Line ending differences (CRLF vs LF)
- Case sensitivity

**Solutions**:
```bash
# Configure Git for consistent line endings
git config --global core.autocrlf false

# Use cross-platform path patterns
{:apps [{:script "./dist/index.js"}]}  # Use forward slashes
```

#### macOS/Linux

**Common Issues**:
- File permission restrictions
- Case-sensitive file systems
- Different default shells

**Solutions**:
```bash
# Fix file permissions
chmod +x ./node_modules/.bin/shadow-conf

# Use absolute paths for critical files
{:apps [{:script "/usr/local/bin/app"}]}
```

### Docker/Container Issues

**Problem**: Running in Docker containers.

**Common Issues**:
- File path differences
- Permission issues
- Missing dependencies

**Dockerfile Example**:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN pnpm install

COPY . .
RUN pnpm build

# Ensure proper permissions
RUN chmod +x ./dist/bin/shadow-conf.js

CMD ["./dist/bin/shadow-conf.js", "ecosystem"]
```

---

## 🔍 Debugging Techniques

### Enable Verbose Logging

```bash
# Set debug environment variable
DEBUG=* shadow-conf ecosystem

# Or use Node.js debug mode
node --trace-warnings ./node_modules/.bin/shadow-conf ecosystem
```

### Validate EDN Files

Create a validation script:

```typescript
// validate-edn.ts
import { loadEdnFile } from '@promethean/shadow-conf';
import { readdir } from 'fs/promises';
import path from 'path';

async function validateDirectory(dir: string): Promise<void> {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.edn')) {
      const filePath = path.join(dir, file.name);
      
      try {
        await loadEdnFile(filePath);
        console.log(`✅ ${file.name}`);
      } catch (error) {
        console.error(`❌ ${file.name}: ${error.message}`);
      }
    }
  }
}

validateDirectory('./config');
```

### Debug Path Resolution

```typescript
import { generateEcosystem } from '@promethean/shadow-conf';

async function debugPaths(): Promise<void> {
  const result = await generateEcosystem({
    inputDir: './services',
    outputDir: './config'
  });
  
  console.log('Input files:', result.files);
  console.log('Output path:', result.outputPath);
  
  result.apps.forEach((app, index) => {
    console.log(`App ${index}:`, {
      name: app.name,
      script: app.script,
      cwd: app.cwd,
      watch: app.watch
    });
  });
}

debugPaths();
```

### Test with Minimal Configuration

Create a minimal test case:

```clojure
;; minimal.edn
{:apps [{:name "test-app" :script "./test.js"}]}
```

```bash
# Test with minimal config
shadow-conf ecosystem --input-dir ./test-dir --out ./test-out
```

### Use Node.js Inspector

```bash
# Run with debugger
node --inspect-brk ./node_modules/.bin/shadow-conf ecosystem

# Then connect with Chrome DevTools or VS Code debugger
```

---

## 🆘 Getting Help

### Check the Documentation

- [README.md](./README.md) - General usage and examples
- [API.md](./API.md) - Detailed API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture and design decisions

### Search Existing Issues

Before creating a new issue, search existing issues:
- [GitHub Issues](https://github.com/promethean/shadow-conf/issues)
- Check closed issues for resolved problems

### Create a Bug Report

When reporting a bug, include:

1. **Environment Information**:
   ```bash
   node --version
   npm --version
   uname -a  # Linux/macOS
   # or
   systeminfo | findstr /B /C:"OS Name" /C:"OS Version"  # Windows
   ```

2. **Minimal Reproduction Case**:
   - Sample EDN file that causes the issue
   - Exact command used
   - Expected vs actual output

3. **Error Messages**:
   - Full error stack trace
   - Any console output

4. **Steps to Reproduce**:
   ```bash
   # 1. Create test file
   echo '{:apps [{:name "test"}]}' > test.edn
   
   # 2. Run command
   shadow-conf ecosystem --input-dir . --out ./out
   
   # 3. Observe error
   ```

### Feature Requests

For feature requests, include:

1. **Use Case**: What problem are you trying to solve?
2. **Proposed Solution**: How should the feature work?
3. **Alternatives Considered**: What other approaches did you consider?
4. **Impact**: How would this benefit other users?

### Community Support

- **GitHub Discussions**: For questions and ideas
- **Discord Community**: For real-time help (if available)
- **Stack Overflow**: Tag questions with `shadow-conf`

### Professional Support

For enterprise support or custom development:
- Check the project website for support options
- Contact the maintainers directly
- Consider sponsored development for critical features

---

## 📝 Quick Reference

### Common Commands

```bash
# Basic generation
shadow-conf ecosystem

# Custom paths
shadow-conf ecosystem --input-dir ./config --out ./dist

# Custom filename
shadow-conf ecosystem --filename production.ecosystem.mjs

# Help
shadow-conf ecosystem --help
```

### Validation Checklist

- [ ] EDN files have proper map structure
- [ ] `:apps` section exists and is a vector
- [ ] Each app is a map with at least `:name`
- [ ] File paths use forward slashes
- [ ] No syntax errors in EDN files
- [ ] Output directory exists and is writable

### Performance Tips

- Split large configurations into multiple files
- Use relative paths consistently
- Avoid deeply nested structures
- Monitor memory usage with large file sets
- Use appropriate Node.js memory limits

This troubleshooting guide should help resolve most common issues with @promethean/shadow-conf. For additional help, don't hesitate to reach out to the community.