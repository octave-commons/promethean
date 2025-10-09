---
uuid: "b2c3d4e5-f6g7-8901-bcde-f23456789012"
title: "Fix eslint-tasks pipeline TypeScript parser configuration issues"
slug: "fix-eslint-tasks-pipeline-typescript-configuration"
status: "todo"
priority: "P2"
labels: ["piper", "eslint", "typescript", "configuration", "build-fix"]
created_at: "2025-10-05T00:00:00.000Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🛠️ Task: Fix eslint-tasks pipeline TypeScript parser configuration issues

## 🐛 Problem Statement

The eslint-tasks pipeline fails with TypeScript parser errors:
```
Error: Error while loading rule '@typescript-eslint/await-thenable': You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file.
```

Additional warnings:
```
ESLintIgnoreWarning: The ".eslintignore" file is no longer supported. Switch to using the "ignores" property in "eslint.config.js"
```

This prevents the pipeline from generating ESLint-based tasks and reports.

## 🎯 Desired Outcome

The eslint-tasks pipeline should run successfully and:
- Analyze TypeScript/JavaScript files without parser errors
- Generate ESLint reports in JSON format
- Create actionable tasks for code quality improvements
- Work with modern ESLint 9.x flat configuration

## 📋 Requirements

### Phase 1: ESLint Configuration Update
- [ ] Migrate from .eslintignore to eslint.config.js ignores property
- [ ] Fix TypeScript parserOptions for type information
- [ ] Ensure compatibility with ESLint 9.x flat config format
- [ ] Update @typescript-eslint plugin configuration

### Phase 2: Pipeline Testing
- [ ] Run `pnpm exec piper run eslint-tasks --dry` to verify setup
- [ ] Run `pnpm exec piper run eslint-tasks` to test full pipeline
- [ ] Verify ESLint report generation
- [ ] Check that JSON output is properly formatted

### Phase 3: Validation
- [ ] Test pipeline on various file types (.ts, .tsx, .js, .jsx, .mjs)
- [ ] Verify all TypeScript-specific rules work correctly
- [ ] Ensure no deprecated ESLint features are used
- [ ] Confirm output reports are actionable

## 🔧 Technical Implementation Details

### Files to Update
1. **eslint.config.js** - Create/update with proper TypeScript configuration
2. **.eslintignore** - Remove/migrate to eslint.config.js ignores
3. **packages/*/package.json** - Verify ESLint dependencies are aligned
4. **scripts/piper-eslint-tasks.mjs** - Update if needed for new ESLint API

### Expected ESLint Configuration
```javascript
// eslint.config.js
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '.cache/**',
      'build/**'
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      // other TypeScript rules...
    }
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  }
];
```

### Pipeline Steps That Should Work
1. **eslint-scan** - Run ESLint on packages directory
2. **eslint-report** - Generate JSON report with findings

## ✅ Acceptance Criteria

1. **No Parser Errors**: TypeScript files parse without type information errors
2. **Modern Configuration**: Uses ESLint 9.x flat config format
3. **Deprecated Features**: No more .eslintignore warnings
4. **Pipeline Success**: `pnpm exec piper run eslint-tasks` completes successfully
5. **Report Generation**: JSON report generated at `.cache/eslint/report.json`
6. **Multi-language Support**: Works with TS, JS, TSX, JSX files

## 🔗 Related Resources

- **Pipeline Definition**: `pipelines.json` - eslint-tasks section
- **ESLint Documentation**: https://eslint.org/docs/latest/use/configure/migration-guide
- **TypeScript ESLint**: https://typescript-eslint.io/getting-started/typed-linting
- **Script Location**: `scripts/piper-eslint-tasks.mjs`
- **Output Location**: `.cache/eslint/report.json`

## 📝 Technical Notes

This fix addresses two major issues:
1. **TypeScript Parser Configuration**: The @typescript-eslint rules require type information, which needs proper parserOptions configuration
2. **ESLint 9.x Migration**: The .eslintignore file is deprecated in favor of the ignores property in eslint.config.js

The pipeline should generate actionable ESLint tasks that can be used for:
- Code quality improvements
- TypeScript best practices enforcement
- Automated refactoring suggestions
- Technical debt tracking

Fixing this pipeline will enable automated code quality monitoring and task generation for the entire codebase.
