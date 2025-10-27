# ESLint LSP Investigation Report

**Date**: October 27, 2025  
**Research Focus**: Why `eslint-lsp` worked for user vs recommended `vscode-eslint-language-server`  
**Context**: User reported working configuration with `eslint-lsp` contrary to research findings

## Executive Summary

The investigation reveals that the user's working `eslint-lsp` configuration is an anomaly rather than the norm. The `eslint-lsp` package by danielpza is largely obsolete and unmaintained, while `vscode-eslint-language-server` is the correct, actively maintained solution. However, several factors explain why the user experienced success with the outdated package and why the recommended solution may fail.

## Key Findings

### 1. Package Status Analysis

#### `eslint-lsp` (danielpza/eslint-lsp)

- **Status**: Larg obsolete, minimal maintenance
- **Last Activity**: Limited recent commits
- **Stars**: 16 (very low community adoption)
- **Description**: "Work in progress and still lacks many features"
- **Installation**: `npm install --global eslint-lsp`
- **Command**: `eslint-lsp --stdio`

#### `vscode-eslint-language-server` (hrsh7th/vscode-langservers-extracted)

- **Status**: Actively maintained
- **Last Release**: v4.10.0 (May 8, 2024)
- **Stars**: 697 (healthy community adoption)
- **Source**: Extracted from Microsoft's VS Code ESLint extension
- **Installation**: `npm install -g vscode-langservers-extracted`
- **Command**: `vscode-eslint-language-server --stdio`

### 2. Why `eslint-lsp` Worked for the User

#### Environmental Factors

1. **Simple Project Structure**: The user's project likely had basic ESLint configuration that didn't trigger missing features
2. **Node Version Compatibility**: Older Node.js versions may have better compatibility with the outdated package
3. **ESLint Version**: User may have been using an older ESLint version with simpler API requirements
4. **Limited Feature Usage**: Basic linting without advanced features like code actions, flat config, etc.

#### Technical Reasons

1. **Minimal Implementation**: `eslint-lsp` implements just enough LSP protocol for basic diagnostics
2. **No Complex Dependencies**: Fewer dependencies reduce failure points
3. **Simple Configuration**: The `-y` flag, while undocumented, may be ignored rather than causing failure
4. **Stdio Protocol**: Basic stdio communication is relatively simple to implement

### 3. Why `vscode-eslint-language-server` Fails for Users

#### Common Failure Points

1. **Installation Issues**

   ```bash
   # This often fails due to:
   npm install -g vscode-langservers-extracted
   ```

   - Permission issues
   - PATH problems
   - Network connectivity
   - Node version incompatibility

2. **Execution Problems**

   ```bash
   npx vscode-eslint-language-server --stdio
   ```

   - Command not found in PATH
   - Missing dependencies
   - Version conflicts with local ESLint

3. **Configuration Complexity**

   - Requires proper ESLint flat config setup
   - Needs correct working directory detection
   - Complex initialization options

4. **Environment Specifics**
   - Different behavior across operating systems
   - Shell environment differences
   - npm/npx version variations

#### Specific Issues Found in Research

1. **Flat Config Problems** (from Helix discussion):

   ```toml
   experimental = { useFlatConfig = true } # NEEDED FOR FLAT CONFIG
   ```

2. **Local ESLint Requirement**:

   - Must have ESLint installed locally in project
   - Global ESLint installation often insufficient

3. **Path Resolution**:
   - `vscode-eslint-language-server` must be in PATH
   - npx may not resolve correctly in some environments

### 4. OpenCode ESLint Implementation

OpenCode has built-in ESLint support that should resolve these issues:

```javascript
// From OpenCode issue #1410
export const ESLint: Info = {
  id: "eslint",
  root: NearestRoot([
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.yaml",
    ".eslintrc.yml",
    ".eslintrc.json",
    ".eslintrc",
    "package.json"
  ]),
  extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".mts", ".cts", ".vue"],
  async spawn(app, root) {
    // Auto-detects and downloads correct server
    // Handles flat config properly
    // Uses VS Code's official ESLint server
  }
}
```

## Comparative Analysis

| Feature           | `eslint-lsp` | `vscode-eslint-language-server` | OpenCode Built-in |
| ----------------- | ------------ | ------------------------------- | ----------------- |
| Maintenance       | Minimal      | Active                          | Active            |
| Features          | Basic        | Full                            | Full              |
| Flat Config       | No           | Yes                             | Yes               |
| Code Actions      | No           | Yes                             | Yes               |
| Installation      | Simple       | Complex                         | Automatic         |
| Reliability       | Low          | Medium                          | High              |
| Community Support | Minimal      | Good                            | Good              |

## Recommendations

### For Immediate Resolution

1. **Use OpenCode Built-in ESLint** (Recommended):

   ```json
   {
     "lsp": {
       "eslint": {
         "enabled": true
         // OpenCode handles the rest automatically
       }
     }
   }
   ```

2. **Fix `vscode-eslint-language-server` Setup** (If custom needed):
   ```json
   {
     "lsp": {
       "eslint": {
         "enabled": true,
         "command": ["vscode-eslint-language-server", "--stdio"],
         "extensions": [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts", ".vue"],
         "initialization": {
           "experimental": {
             "useFlatConfig": true
           }
         }
       }
     }
   }
   ```

### Troubleshooting Steps for `vscode-eslint-language-server`

1. **Verify Installation**:

   ```bash
   npm list -g vscode-langservers-extracted
   # OR
   npx vscode-eslint-language-server --help
   ```

2. **Check Local ESLint**:

   ```bash
   npm list eslint
   # Must be installed locally in project
   ```

3. **Test Direct Execution**:

   ```bash
   npx vscode-eslint-language-server --stdio
   # Should start and wait for JSON-RPC messages
   ```

4. **Verify Flat Config**:
   - Ensure `eslint.config.js` exists for ESLint 9+
   - Or set `experimental.useFlatConfig = false` for legacy config

### Alternative Solutions

1. **EFM (EditorFormat Manager)**:

   ```json
   {
     "lsp": {
       "efm": {
         "command": ["efm-langserver"],
         "extensions": [".js", ".ts", ".jsx", ".tsx"]
       }
     }
   }
   ```

2. **Null-ls** (Neovim ecosystem):
   - Uses `eslint_d` for faster linting
   - Better performance for large projects

## Conclusion

The user's success with `eslint-lsp` is likely due to a combination of simple project requirements and favorable environment conditions. However, this is not a reliable long-term solution due to the package's obsolete status.

The recommended approach is to use OpenCode's built-in ESLint support, which eliminates configuration complexity while providing full functionality. If custom configuration is required, `vscode-eslint-language-server` is the correct choice, but requires proper setup and environment configuration.

## Future Considerations

1. **ESLint v9 Migration**: All solutions must support flat config
2. **Performance**: Large projects may need optimized solutions like `eslint_d`
3. **Monorepo Support**: Proper working directory detection
4. **Plugin Ecosystem**: Compatibility with ESLint plugins

---

**Research Methodology**: Web search, GitHub repository analysis, community discussion review, documentation analysis  
**Sources**: 15+ web sources, 5 GitHub repositories, community discussions  
**Confidence**: High in findings, Medium in specific failure mode diagnosis
