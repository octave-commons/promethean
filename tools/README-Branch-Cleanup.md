# Branch Cleanup Tools

This directory contains automated tools for cleaning up stale branches in the Promethean repository.

## 📋 Overview

The repository accumulates many branches over time that are not associated with PRs. These tools help safely clean up stale branches while protecting important ones.

## 🛠️ Tools

### 1. Local Cleanup Script (`cleanup-branches.sh`)

A comprehensive local tool for previewing and deleting stale branches.

#### Usage

```bash
# Basic dry run (preview what would be deleted)
./tools/cleanup-branches.sh --dry-run --days=30

# Actually delete branches older than 90 days
./tools/cleanup-branches.sh --no-dry-run --days=90

# Custom branch pattern
./tools/cleanup-branches.sh --pattern="^codex/.*$" --days=60

# Force mode (skip confirmation)
./tools/cleanup-branches.sh --no-dry-run --force --days=120
```

#### Options

- `--dry-run` / `--no-dry-run`: Preview or actually delete branches
- `--days=N`: Age threshold in days (default: 30)
- `--pattern=REGEX`: Branch name pattern to match
- `--force`: Skip confirmation prompts
- `--help`: Show usage information

#### Safety Features

✅ **Protected Branches** (Never deleted):
- `main` - Primary release branch
- `dev/testing` - Integration testing branch
- `staging` - Pre-release staging branch
- `dev/*` - Workspace branches (host-specific)

✅ **PR Protection**: Branches with associated PRs (open or closed) are never deleted

✅ **Age-based**: Only deletes branches older than the specified threshold

✅ **Pattern Matching**: Only considers branches matching specified patterns

### 2. GitHub Action Workflow (`.github/workflows/branch-cleanup.yml`)

An automated workflow that runs weekly and can be triggered manually.

#### Features

- **Scheduled Runs**: Every Sunday at 2 AM UTC (dry run for safety)
- **Manual Triggers**: Can be run on-demand with custom settings
- **Configurable Patterns**: Branch name patterns and age thresholds
- **Comprehensive Reports**: Detailed cleanup reports with statistics
- **Safe Defaults**: Dry run mode and conservative settings

#### Manual Execution

1. Go to GitHub Actions → Branch Cleanup → "Run workflow"
2. Configure settings:
   - **Dry Run**: `true` to preview, `false` to actually delete
   - **Branch Pattern**: Regex pattern for branch names
   - **Days Threshold**: Minimum age in days for deletion

## 🚀 Quick Start

### 1. Immediate Cleanup (Preview)

```bash
# See what branches would be deleted (30+ days old)
./tools/cleanup-branches.sh --dry-run --days=30
```

### 2. Conservative Cleanup

```bash
# Delete very old branches (180+ days old)
./tools/cleanup-branches.sh --no-dry-run --days=180
```

### 3. Aggressive Cleanup

```bash
# Delete all codex branches older than 60 days
./tools/cleanup-branches.sh --no-dry-run --pattern="^[0-9a-z]*-?codex/" --days=60 --force
```

## 📊 Current Repository Status

As of the latest analysis:

- **Total branches without PRs**: 829
- **Branch patterns**: codex/, feat/, chore/, docs/, test/, fix/
- **Recommended cleanup schedule**:
  - **Weekly**: Automated dry run (Sunday 2 AM UTC)
  - **Monthly**: Manual cleanup of 90+ day old branches
  - **Quarterly**: Aggressive cleanup of 30+ day old codex branches

## 🛡️ Safety Guidelines

### Before Running Cleanup

1. **Check for Important Work**: Ensure no important feature branches are mistakenly abandoned
2. **Verify PR Links**: Confirm all PR-associated branches are properly protected
3. **Backup Critical Branches**: Tag or backup any branches you want to preserve
4. **Start with Dry Run**: Always preview before actually deleting

### Branch Naming Conventions

To ensure branches are properly handled:

- ✅ **Feature work**: `feat/feature-name`, `123-feat/feature-name`
- ✅ **Bug fixes**: `fix/bug-description`, `456-fix/bug-description`
- ✅ **Documentation**: `docs/update-docs`, `789-docs/update-docs`
- ✅ **Codex work**: `codex/task-name`, `abc123-codex/task-name`
- ✅ **Workspace**: `dev/hostname` (automatically protected)

### Recovery

If you accidentally delete an important branch:

```bash
# Check git reflog for the branch
git reflog show origin/branch-name

# Recreate the branch if found in reflog
git checkout -b branch-name origin/branch-name@{1}
```

## 📈 Maintenance Schedule

### Recommended Routine

**Daily**: None (automation handles weekly checks)

**Weekly** (Sunday):
- Automated dry run identifies candidates
- Review the automated report
- Manual cleanup of obvious stale branches

**Monthly**:
- Run manual cleanup for 60-90 day old branches
- Review and adjust branch naming patterns
- Update any team documentation

**Quarterly**:
- Comprehensive cleanup of 30+ day old branches
- Review and update cleanup policies
- Archive completed work if needed

## 🤝 Contributing

When modifying the cleanup tools:

1. **Test with Dry Run**: Always test changes with `--dry-run` first
2. **Update Safety Checks**: Ensure new features preserve existing protections
3. **Documentation**: Update this README with any behavior changes
4. **GitHub Action**: Test workflow changes in a feature branch first

## 📞 Support

If you encounter issues:

1. Check GitHub CLI authentication: `gh auth status`
2. Verify repository permissions: You need push access to delete branches
3. Review the workflow logs in GitHub Actions
4. Test with simple patterns first: `--pattern="^codex/"`

---

*These tools help maintain repository health while protecting important work in progress.*