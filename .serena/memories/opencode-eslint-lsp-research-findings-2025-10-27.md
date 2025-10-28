# OpenCode ESLint LSP Configuration Research Findings

## Issue Summary
The user's opencode.json ESLint LSP configuration is not working because:
1. The `eslint-lsp` package referenced in their configuration is outdated and incorrect
2. The correct package should be `vscode-eslint-language-server` from `vscode-langservers-extracted`
3. The `-y` flag in their configuration is not valid for the ESLint language server

## Key Findings

### Current Problematic Configuration
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

### Issues Identified
1. **Wrong Package**: `eslint-lsp` is an outdated package from 2021 that doesn't work properly
2. **Invalid Flag**: The `-y` flag is not recognized by ESLint language servers
3. **Missing Dependencies**: Need `vscode-langservers-extracted` package

### Correct Configuration
Based on OpenCode's built-in ESLint server implementation and the vscode-eslint-language-server documentation:

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

### Alternative: Use OpenCode's Built-in ESLint
OpenCode has its own built-in ESLint server implementation that:
- Automatically downloads and builds VS Code ESLint server
- Uses the correct server path from `vscode-eslint` repository
- Handles flat config properly
- Should work without custom configuration

## Root Cause Analysis
1. **Package Evolution**: The ESLint LSP ecosystem has evolved significantly
   - `eslint-lsp` (2021) → deprecated/obsolete
   - `vscode-langservers-extracted` → provides `vscode-eslint-language-server`
   - OpenCode built-in → uses latest VS Code ESLint server

2. **Configuration Drift**: User's configuration was from an older version when `eslint-lsp` might have worked

3. **Flat Config Support**: Modern ESLint requires proper flat config handling which the old package doesn't support

## Recommendations
1. **Remove Custom Configuration**: Let OpenCode use its built-in ESLint server
2. **If Custom Needed**: Use `vscode-eslint-language-server` instead of `eslint-lsp`
3. **Remove Invalid Flags**: Drop the `-y` flag
4. **Update Extensions**: Include all supported file extensions

## Testing Results
- `npx eslint-lsp --stdio` → Fails with connection stream error
- `vscode-eslint-language-server` → Correct package but needs proper installation
- OpenCode built-in → Should work automatically when ESLint is detected locally