# Workspace Organization Guide

## Overview

This document provides guidelines for maintaining a clean and organized workspace in the Promethean Framework project.

## Directory Structure

### Scripts Organization

All scripts should be organized by purpose in the `scripts/` directory:

- **`scripts/debug/`** - Debugging and diagnostic scripts
  - Example: `debug-sync-issue.mjs`, `debug-underscore-bug.js`
- **`scripts/testing/`** - Test scripts and validation tools
  - Example: `test-buildfix-optimizations.ts`, `test-mcp-security-integration.mjs`
- **`scripts/security/`** - Security validation and testing scripts
  - Example: `fast-track-security-testing.mjs`, `security-validation.mjs`
- **`scripts/dev/`** - Development utilities and maintenance tools
  - Example: `fix-repeated-tags.js`, `wip-manager.js`

### Tools Organization

Development tools should be placed in appropriate subdirectories of `tools/`:

- **`tools/benchmark/`** - Benchmark generation and performance testing tools
  - Example: `generate-remaining-benchmarks.mjs`

### Reports and Cache

- **`reports/`** - Generated reports and analysis results
  - **`reports/agile/`** - Kanban board reports, workflow analysis
  - **`reports/benchmark/`** - Performance benchmarks, BuildFix results
  - **`reports/security/`** - Security analyses, threat models
  - **`reports/general/`** - General project reports and summaries
- **`cache/`** - Cached data and temporary files
  - **`cache/benchmark/`** - Benchmark result caches

### Documentation Organization

- **`docs/agile/`** - Kanban board, tasks, epics, and agile process documentation
- **`docs/adr/`** - Architecture Decision Records
- **`docs/inbox/`** - Temporary holding area for new documents
- **`docs/reference/`** - Technical reference materials and guides
- **`docs/external/`** - External documentation and references
- **`docs/prompts/`** - Prompt templates and optimization guides
  - **`docs/prompts/optimized/`** - Optimized prompt templates

## File Placement Guidelines

### ✅ Acceptable in Root Directory

- Configuration files (`.env.example`, `package.json`, `tsconfig.json`)
- Core documentation (`README.md`, `AGENTS.md`, `CHANGELOG.md`)
- Build and CI configuration (`.github/`, `nx.json`, `pnpm-workspace.yaml`)
- Essential project metadata (`LICENSE.txt`, `.gitignore`)

### ❌ Not Acceptable in Root Directory

- Debug scripts (`debug-*.js`, `debug-*.mjs`)
- Test scripts (`test-*.js`, `test-*.mjs`, `test-*.ts`)
- Temporary files and reports
- Benchmark cache files
- Development utilities
- Security validation scripts

## Agent Guidelines

### When Creating Scripts

1. **Determine the purpose** of your script and place it in the appropriate directory
2. **Use descriptive names** that clearly indicate the script's function
3. **Add proper documentation** at the top of each script
4. **Clean up temporary files** after script execution

### Temporary File Handling

1. **Use the `cache/` directory** for temporary data that might be needed later
2. **Use `/tmp/`** for truly temporary files that can be safely deleted
3. **Clean up your own temporary files** before completing your task
4. **Use timestamp-based naming** for report files to avoid conflicts

### Naming Conventions

- **Scripts**: `kebab-case-with-extension.js` (e.g., `fix-sync-issue.mjs`)
- **Reports**: `descriptive-name-YYYY-MM-DD.json` (e.g., `security-report-2025-10-16.json`)
- **Cache files**: `purpose-cache-*.json` (e.g., `benchmark-results-*.json`)

## Cleanup Procedures

### Daily Maintenance

1. Move any misplaced scripts to appropriate directories
2. Clean up temporary files in `/tmp/`
3. Archive important reports to `reports/`
4. Remove duplicate or obsolete files

### Weekly Review

1. Audit root directory for misplaced files
2. Review and clean up cache directories
3. Archive old reports
4. Update documentation as needed

## Examples

### ✅ Good Script Placement

```bash
# Debugging script
scripts/debug/debug-kanban-sync.mjs

# Security test
scripts/security/test-path-traversal.mjs

# Development utility
scripts/dev/fix-task-tags.js

# Benchmark tool
tools/benchmark/generate-tests.mjs
```

### ❌ Bad Script Placement

```bash
# These should NOT be in the root directory
/debug-kanban-sync.mjs
/test-security.mjs
/fix-tasks.js
/benchmark-gen.mjs
```

## Migration Process

When moving existing files:

1. **Identify the file type** and determine appropriate destination
2. **Check for dependencies** that might reference the old location
3. **Update any documentation** or configuration files
4. **Test that moved scripts still function** correctly
5. **Remove the original file** after verification

## Responsibilities

### All Agents

- Follow the organization guidelines
- Clean up after completing tasks
- Report misplaced files when found

### Task Orchestrators

- Ensure agents follow guidelines
- Review workspace cleanliness regularly
- Handle organizational issues as they arise

## Monitoring

Regular checks should be performed to ensure compliance:

1. **Root directory audit** - Check for misplaced files
2. **Script directory review** - Ensure proper organization
3. **Cache cleanup** - Remove outdated cache files
4. **Report archiving** - Move old reports to archive

## 🎯 Current Cleanup Status

### ✅ Completed

- Root directory script organization (20+ scripts moved to categorized directories)
- Security reports moved to `reports/security/`
- Benchmark cache moved to `cache/benchmark/`
- docs/ folder structure cleanup (misplaced files moved to categorized subdirectories)
- agile/ subdirectory cleanup (backup files removed, duplicates consolidated)
- Documentation structure guide created (`docs/DOCUMENTATION_STRUCTURE.md`)

### 🔄 In Progress

- Agent guideline establishment and behavioral patterns
- Automated cleanup process implementation

---

This guide helps maintain a clean, efficient, and professional workspace that supports productive development and collaboration.
