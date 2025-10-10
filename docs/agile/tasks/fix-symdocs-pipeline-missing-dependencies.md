---
uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
title: "Fix symdocs pipeline missing @promethean/file-indexer dependency    -fix    -fix    -fix    -fix    -fix    -fix    -fix"
slug: "fix-symdocs-pipeline-missing-dependencies"
status: "done"
priority: "P2"
tags: ["piper", "symdocs", "dependencies", "build-fix"]
created_at: "2025-10-10T03:23:55.971Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







## 🛠️ Task: Fix symdocs pipeline missing @promethean/file-indexer dependency

## 🐛 Problem Statement

The symdocs pipeline fails to run with the error:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@promethean/file-indexer' imported from /home/err/devel/promethean/scripts/.piper/packages/symdocs/dist/01-scan.js
```

This prevents the symdocs pipeline from generating documentation for the codebase.

## 🎯 Desired Outcome

The symdocs pipeline should run successfully and:
- Scan TypeScript/JavaScript source files
- Generate documentation using AI models
- Output structured documentation to `docs/packages/`
- Create dependency graphs and module documentation

## 📋 Requirements

### Phase 1: Dependency Investigation
- [ ] Locate the @promethean/file-indexer package in the monorepo
- [ ] Verify the package exists and is properly built
- [ ] Check if the package is missing from workspace dependencies

### Phase 2: Fix Dependency Resolution
- [ ] Add @promethean/file-indexer to symdocs package dependencies
- [ ] Ensure the package builds correctly
- [ ] Update piper cache if needed

### Phase 3: Pipeline Testing
- [ ] Run `pnpm exec piper run symdocs --dry` to verify setup
- [ ] Run `pnpm exec piper run symdocs` to test full pipeline
- [ ] Verify all pipeline steps complete successfully
- [ ] Check generated documentation output

## 🔧 Technical Implementation Details

### Files to Check/Update
1. **packages/symdocs/package.json** - Add missing dependency
2. **scripts/piper-symdocs.mjs** - Verify import paths
3. **.cache/symdocs/** - Clear existing cache if needed

### Expected Dependency
```json
{
  "dependencies": {
    "@promethean/file-indexer": "workspace:*"
  }
}
```

### Pipeline Steps That Should Work
1. **symdocs-scan** - Scan source files and build index
2. **symdocs-docs** - Generate documentation using AI
3. **symdocs-write** - Write documentation files
4. **symdocs-graph** - Create dependency graphs

## ✅ Acceptance Criteria

1. **Pipeline Status**: `pnpm exec piper status symdocs` shows all steps as properly cached
2. **Dry Run**: `pnpm exec piper run symdocs --dry` completes without errors
3. **Full Run**: `pnpm exec piper run symdocs` completes successfully
4. **Output Generation**: Documentation files are created in `docs/packages/`
5. **No Dependency Errors**: No more "Cannot find package" errors

## 🔗 Related Resources

- **Pipeline Definition**: `pipelines.json` - symdocs section
- **Script Location**: `scripts/piper-symdocs.mjs`
- **Package Directory**: `packages/symdocs/`
- **Output Directory**: `docs/packages/`

## 📝 Technical Notes

The @promethean/file-indexer package is used by the symdocs pipeline to:
- Index TypeScript/JavaScript source files
- Extract function and class information
- Build searchable documentation database
- Support AI-powered documentation generation

This fix will enable automatic documentation generation for the entire codebase, improving developer experience and code maintainability.






