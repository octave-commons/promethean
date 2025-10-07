# Contributor-Friendly GitHub Boards

This document explains the complete solution for maintaining Obsidian workflows while providing GitHub-friendly project boards for contributors.

## 🎯 Problem Solved

- **Obsidian wikilinks** (`[[file-name]]`) don't render well on GitHub
- **New contributors** need GitHub-friendly interfaces to interact with tasks
- **You want to keep** your efficient Obsidian workflow and wikilink syntax

## 🛠️ Solution Overview

### **Dual Workflow System**
1. **Local Development**: Continue using Obsidian with wikilinks
2. **GitHub Interface**: Automatically synced GitHub Issues with proper markdown
3. **Bidirectional Sync**: Keep both systems in sync automatically

### **Key Features**
- ✅ **Preserves Obsidian workflow** - no changes to your local setup
- ✅ **Automatic wikilink conversion** - `[[file]]` → `[file](file.md)` for GitHub
- ✅ **GitHub Issue creation** - tasks become issues with proper formatting
- ✅ **Status synchronization** - kanban columns map to GitHub labels
- ✅ **Automated workflows** - GitHub Actions sync on changes
- ✅ **Safe dry-run mode** - preview before applying changes

## 📁 Files Created

### **Core Sync Tool**
- `tools/github-project-sync.mjs` - Main synchronization script
- `tools/test-github-sync.mjs` - Test script for validation

### **Automation**
- `.github/workflows/sync-kanban-to-github.yml` - Automated GitHub Actions workflow

### **Existing Infrastructure**
- `packages/docops/src/convert-wikilinks.ts` - Wikilink conversion utility
- `docs/research/github_projects_api.md` - API research and planning
- Various kanban sync planning tasks in `docs/agile/tasks/`

## 🚀 Quick Start

### **1. Local Testing**
```bash
# Test the conversion functions
pnpm sync:github:test

# Dry run to see what would be synced
GITHUB_TOKEN=your_token pnpm sync:github:dry-run
```

### **2. Initial Sync**
```bash
# Actually create/update GitHub issues
GITHUB_TOKEN=your_token pnpm sync:github
```

### **3. Package.json Scripts**
The following npm scripts are available:

- `pnpm sync:github:test` - Test conversion functions
- `pnpm sync:github:dry-run` - Preview sync changes (default dry run)
- `pnpm sync:github` - Execute full sync (requires GITHUB_TOKEN)

### **4. Automated Sync**
The GitHub Actions workflow automatically syncs when:
- Files in `docs/agile/boards/generated.md` change
- Files in `docs/agile/tasks/` change
- Manual trigger via GitHub Actions UI

## 🔄 How It Works

### **Wikilink Conversion**
```
Obsidian: [[file-name|Display Text]]
GitHub:   [Display Text](file-name.md)

Obsidian: [[folder/file]]
GitHub:   [folder/file](folder/file.md)

Obsidian: [[file-name#section]]
GitHub:   [file-name](file-name.md#section)
```

### **Column Mapping**
| Kanban Column | GitHub Status    | Issue Labels              |
|---------------|------------------|--------------------------|
| icebox        | icebox           | icebox                   |
| incoming      | todo             | incoming                  |
| accepted      | in progress      | accepted, in-progress    |
| ready         | ready            | ready                    |
| breakdown     | breakdown        | breakdown                 |
| blocked       | blocked          | blocked                  |
| in progress   | in progress      | in-progress              |
| review        | review           | review                   |
| done          | done             | done                     |

### **Issue Creation**
Each kanban task becomes a GitHub issue with:

**Title**: Task name from wikilink
**Body**:
- Task metadata (status, priority, UUID)
- Full task content with wikilinks converted
- Tags and priority labels
- Reference to Obsidian origin

**Labels**:
- Task tags from kanban board
- Priority level (P1, P2, P3)
- `kanban-sync` (identifies synced issues)

## ⚙️ Configuration

### **Environment Variables**
```bash
# Required
GITHUB_TOKEN=your_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name

# Optional
KANBAN_BOARD_FILE=docs/agile/boards/generated.md
KANBAN_TASKS_DIR=docs/agile/tasks
DRY_RUN=false
CREATE_ISSUES=true
UPDATE_EXISTING=true
```

### **GitHub Token Requirements**
The token needs these permissions:
- `repo` - Full access to repository
- `issues:write` - Create and update issues
- `project` - Access to projects (if using project boards)

## 🔧 Advanced Usage

### **Custom Column Mapping**
Modify the `COLUMN_MAPPING` object in `tools/github-project-sync.mjs`:

```javascript
const COLUMN_MAPPING = {
  'icebox': 'Backlog',
  'incoming': 'To Do',
  'accepted': 'In Progress',
  // ... custom mappings
};
```

### **Selective Sync**
Only sync specific columns by filtering in the script:

```javascript
// Only sync high-priority tasks
if (!task.priority || task.priority === 'P1') {
  continue; // Skip non-P1 tasks
}
```

### **Custom Issue Templates**
Modify the `taskToGitHubIssue` function to customize issue formatting:

```javascript
// Add custom fields to issues
const customFields = {
  custom_field: 'custom_value',
  team: 'team-name',
};
```

## 🎨 Workflow Examples

### **Daily Development**
1. Work in Obsidian as usual
2. Commit changes to kanban board
3. GitHub Actions automatically sync to Issues
4. Contributors see updated issues on GitHub
5. Contributors can comment/interact on GitHub
6. Changes sync back to local Obsidian on next run

### **Manual Sync**
```bash
# Sync specific tasks
GITHUB_TOKEN=token DRY_RUN=false node tools/github-project-sync.mjs

# Only create new issues, don't update existing
GITHUB_TOKEN=token CREATE_ISSUES=true UPDATE_EXISTING=false node tools/github-project-sync.mjs
```

### **Troubleshooting**
```bash
# Test conversion without API calls
node tools/test-github-sync.mjs

# Debug mode with verbose logging
DEBUG=true GITHUB_TOKEN=token node tools/github-project-sync.mjs
```

## 🔒 Security & Safety

### **Dry Run Mode**
Always test with `DRY_RUN=true` first to preview changes:

```bash
GITHUB_TOKEN=token DRY_RUN=true node tools/github-project-sync.mjs
```

### **Backup**
- Your Obsidian files are never modified
- GitHub Issues are created/updated, never deleted
- Full audit trail in git history

### **Rate Limiting**
- Built-in delays to respect GitHub API limits
- Batch operations for efficiency
- Error handling with retry logic

## 📈 Benefits for Contributors

### **GitHub-Native Experience**
- Familiar GitHub Issues interface
- Proper markdown rendering
- Working links and references
- Native GitHub notifications

### **Task Visibility**
- Clear priority labels (P1, P2, P3)
- Status tracking via labels
- Searchable and filterable
- Integration with GitHub project boards

### **Easy Participation**
- Comment on issues directly
- Use GitHub reactions
- Link to related issues/PRs
- Mention contributors with @mentions

## 🎯 Best Practices

### **For Maintainers**
1. **Test changes locally** before committing
2. **Use dry run mode** for major updates
3. **Monitor sync logs** for errors
4. **Keep token secure** - use repository secrets

### **For Contributors**
1. **Interact with issues** on GitHub
2. **Reference task UUIDs** in PR descriptions
3. **Use proper issue labels** for categorization
4. **Link related issues** and PRs

### **Workflow Integration**
1. **Link PRs to issues** using `Fixes #123`
2. **Use issue templates** for consistency
3. **Document dependencies** in issue descriptions
4. **Archive completed issues** regularly

## 🔄 Future Enhancements

### **Potential Improvements**
- [ ] Two-way sync (GitHub → Obsidian)
- [ ] GitHub Project board integration
- [ ] Automated issue assignment based on tags
- [ ] Sprint planning and milestone management
- [ ] Integration with other project management tools

### **Community Contributions**
Contributors can help by:
- Testing the sync workflow
- Reporting issues with conversion
- Suggesting improvements to issue formatting
- Creating additional automation workflows

---

## 🎉 Summary

This solution gives you the best of both worlds:
- **Keep your Obsidian workflow** with wikilinks and local efficiency
- **Provide GitHub-friendly interface** for contributors
- **Automate the synchronization** between both systems
- **Maintain data integrity** with safe conversion and backup

New contributors can now interact with your project through familiar GitHub Issues while you maintain your efficient Obsidian-based workflow!