# OpenCode ESLint LSP Configuration Research Report

**Date**: October 27, 2025  
**Research Focus**: ESLint LSP configuration issues in opencode.json  
**Version Context**: opencode 0.15.18

## Executive Summary

The user's ESLint LSP configuration in `opencode.json` is failing due to using an outdated package (`eslint-lsp`) and invalid command-line arguments. The correct approach is to either remove the custom configuration to use OpenCode's built-in ESLint server or update to use the proper `vscode-eslint-language-server` package.

## Current Problematic Configuration

```json
"lsp": {
  "eslint": {
    "enabled": true,
    "command": [
      "npx",
      "eslint-lsp",
      "-y",
      "--stdio"
    ],
    "extensions": [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".vue"
    ]
  }
}
```

## Issues Identified

### 1. Wrong Package Reference

- **Problem**: Using `eslint-lsp` package
- **Root Cause**: `eslint-lsp` is an obsolete package from 2021 (version 0.1.2) that no longer functions correctly
- **Evidence**: Testing shows `eslint-lsp --stdio` fails with "Connection input stream is not set" error

### 2. Invalid Command Line Flag

- **Problem**: Using `-y` flag which is not recognized by ESLint language servers
- **Root Cause**: This flag appears to be from npm/yarn usage, not ESLint LSP
- **Impact**: Causes the language server to fail during startup

### 3. Incomplete File Extensions

- **Problem**: Missing several supported extensions
- **Current**: `.ts`, `.tsx`, `.js`, `.jsx`, `.vue`
- **Should Include**: `.mjs`, `.cjs`, `.mts`, `.cts` (based on OpenCode's built-in configuration)

## OpenCode's Built-in ESLint Implementation

Based on analysis of OpenCode's source code (`packages/opencode/src/lsp/server.ts`), the built-in ESLint server:

```typescript
export const ESLint: Info = {
  id: 'eslint',
  root: NearestRoot(['package-lock.json', 'bun.lockb', 'bun.lock', 'pnpm-lock.yaml', 'yarn.lock']),
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts', '.vue'],
  async spawn(root) {
    const eslint = await Bun.resolve('eslint', Instance.directory).catch(() => {});
    if (!eslint) return;
    log.info('spawning eslint server');
    const serverPath = path.join(
      Global.Path.bin,
      'vscode-eslint',
      'server',
      'out',
      'eslintServer.js',
    );
    // Downloads and builds VS Code ESLint server automatically
  },
};
```

**Key Features**:

- Automatically detects local ESLint installation
- Downloads and builds VS Code ESLint server if needed
- Supports all modern ESLint versions including flat config
- Handles proper stdio communication
- Works with monorepo structures

## ESLint LSP Ecosystem Evolution

### Historical Timeline

1. **Early 2021**: `eslint-lsp` package released (now obsolete)
2. **2022-2024**: `vscode-langservers-extracted` provides `vscode-eslint-language-server`
3. **2024-2025**: OpenCode implements built-in ESLint server using latest VS Code ESLint

### Current State

- `eslint-lsp` → **Deprecated/Non-functional**
- `vscode-eslint-language-server` → **Maintained but requires manual setup**
- OpenCode built-in → **Recommended approach**

## Solution Options

### Option 1: Remove Custom Configuration (Recommended)

Remove the entire ESLint LSP configuration from `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json"
  // ... other config ...
  // Remove the entire "lsp" section or just the "eslint" entry
}
```

**Benefits**:

- Uses OpenCode's optimized built-in ESLint server
- Automatic updates with OpenCode releases
- Proper flat config support
- No maintenance required

### Option 2: Update to Correct Package

If custom configuration is required, update to use the correct package:

```json
"lsp": {
  "eslint": {
    "enabled": true,
    "command": [
      "npx",
      "vscode-eslint-language-server",
      "--stdio"
    ],
    "extensions": [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".mts",
      ".cts",
      ".vue"
    ]
  }
}
```

**Requirements**:

- Install `vscode-langservers-extracted`: `npm install -g vscode-langservers-extracted`
- Ensure local ESLint installation: `npm install --save-dev eslint`

## Common Issues and Solutions

### Issue: "Connection input stream is not set"

**Cause**: Using `eslint-lsp` package
**Solution**: Use `vscode-eslint-language-server` or remove custom config

### Issue: ESLint not detected

**Cause**: Missing local ESLint installation
**Solution**: Install ESLint locally: `npm install --save-dev eslint`

### Issue: Flat config not working

**Cause**: Old ESLint LSP server doesn't support flat config
**Solution**: Use OpenCode built-in or ensure `experimental.useFlatConfig = true`

### Issue: Language server starts but provides no diagnostics

**Cause**: Missing ESLint configuration file or incorrect working directory
**Solution**:

- Create `eslint.config.js` (flat config) or `.eslintrc.json` (legacy)
- Ensure proper `eslint.workingDirectories` configuration if needed

## Testing and Validation

### Commands to Test Configuration

1. **Test current ESLint installation**:

   ```bash
   npx eslint --version
   ```

2. **Test language server manually**:

   ```bash
   npx vscode-eslint-language-server --stdio
   # Should hang waiting for JSON-RPC input
   ```

3. **Check OpenCode LSP status**:
   - Open OpenCode logs
   - Look for ESLint server spawn messages
   - Verify diagnostics appear for JavaScript/TypeScript files

### Validation Checklist

- [ ] ESLint installed locally (`npm list eslint`)
- [ ] ESLint config file exists (`eslint.config.js` or `.eslintrc.*`)
- [ ] Language server starts without errors
- [ ] Diagnostics appear in editor
- [ ] Auto-fix works (if configured)

## Migration Steps

### From Broken Configuration to Working

1. **Backup current config**:

   ```bash
   cp opencode.json opencode.json.backup
   ```

2. **Remove problematic configuration**:

   ```json
   // Delete the entire "lsp.eslint" section
   ```

3. **Test OpenCode built-in**:

   - Restart OpenCode
   - Open a JavaScript/TypeScript file
   - Verify ESLint diagnostics appear

4. **Optional: Add custom config if needed**:
   ```json
   "lsp": {
     "eslint": {
       "enabled": true,
       "command": ["npx", "vscode-eslint-language-server", "--stdio"],
       "extensions": [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts", ".vue"]
     }
   }
   ```

## Recommendations

### Immediate Actions

1. **Remove the custom ESLint LSP configuration** to use OpenCode's built-in server
2. **Update to latest OpenCode version** if not already on 0.15.18+
3. **Ensure local ESLint installation** with proper configuration

### Long-term Considerations

1. **Monitor OpenCode updates** for ESLint server improvements
2. **Consider flat config migration** if using legacy `.eslintrc` files
3. **Test with complex projects** to ensure monorepo compatibility

### Best Practices

- Use local ESLint installation over global
- Prefer flat config (`eslint.config.js`) for new projects
- Let OpenCode handle LSP server management when possible
- Keep configuration minimal to avoid maintenance overhead

## Conclusion

The ESLint LSP configuration issue stems from using an outdated package and invalid arguments. The simplest and most reliable solution is to remove the custom configuration and let OpenCode use its built-in ESLint server, which automatically handles the complex setup and maintenance of the ESLint language server.

If custom configuration is absolutely required, update to use `vscode-eslint-language-server` with proper arguments and ensure all dependencies are correctly installed.

---

**Research Methodology**: Analysis of OpenCode source code, testing of ESLint LSP packages, review of community discussions, and examination of ESLint ecosystem evolution.
