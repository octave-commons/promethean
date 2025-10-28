# Release Pipeline Plan for Subrepo-Based Package Architecture

## Current State Analysis

### Migration Progress
- **Total packages**: 119 packages in `/packages/`
- **Migrated to subrepos**: 9 packages successfully converted
- **Remaining packages**: 110 packages to migrate
- **Changeset config**: Already configured for `promethean` organization publishing

### Successfully Migrated Packages
1. `@promethean-os/apply-patch` → `riatzukiza/apply-patch`
2. `@promethean-os/auth-service` → `riatzukiza/auth-service`
3. `@promethean-os/autocommit` → `riatzukiza/autocommit`
4. `@promethean-os/kanban` → `riatzukiza/kanban`
5. `@promethean-os/logger` → `riatzukiza/logger`
6. `@promethean-os/mcp` → `riatzukiza/mcp`
7. `@promethean-os/naming` → `riatzukiza/naming`
8. `@promethean-os/persistence` → `riatzukiza/persistence`
9. `@promethean-os/utils` → `riatzukiza/utils`

### Existing Changeset Configuration
```json
{
  "publish": true,
  "access": "public",
  "baseBranch": "main",
  "commit": true,
  "linked": [],
  "ignoreDIF": ["build", "dist", "coverage", "preview"],
  "versionerStrategy": "ballanced",
  "owner": { "type": "organization", "name": "promethean" },
  "privatePackageNames": ["@promethean/__tests__"]
}
```

## Release Pipeline Architecture

### 1. Individual Package Publishing Workflow

Each migrated package needs its own GitHub Actions workflow for publishing:

**Workflow Trigger**: 
- Push to `main` branch with changeset files
- Manual workflow dispatch for releases

**Publishing Steps**:
1. Detect changesets using `changesets/action@v1`
2. Run `changeset version` to update package versions
3. Build package (`pnpm build`)
4. Publish to npm (`changeset publish`)
5. Create GitHub release
6. Push git tags

### 2. Workflow Template

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          registry-url: 'https://registry.npmjs.org'
      
      - uses: pnpm/action-setup@v3
        with:
          version: 10.16.1
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          commit: 'chore: release packages'
          title: 'chore: release packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 3. Dependency Management Strategy

#### Current Challenge
- Root `package.json` uses `workspace:*` for internal dependencies
- Subrepo packages need pinned versions for npm publishing
- Dependent packages (78 packages) reference internal packages

#### Solution: Version Pinning Pipeline

**Phase 1: Independent Package Publishing**
- Publish independent packages with semantic versioning
- Update dependent packages to use published versions instead of `workspace:*`

**Phase 2: Dependency Resolution**
- Create dependency graph for 78 dependent packages
- Migrate in dependency order (bottom-up)
- Update `package.json` files to use published versions

**Version Update Script**:
```javascript
// update-dependencies.mjs
function updateWorkspaceDependencies() {
  // Find all packages with workspace:* dependencies
  // Replace with latest published versions from npm
  // Commit changes before migration
}
```

### 4. Migration Strategy Adjustments

#### Updated Migration Order
1. **Independent packages** (continue migration) → Publish to npm
2. **Core utilities** (utils, logger, naming) → Update dependents
3. **Service packages** (auth-service, persistence) → Update dependents  
4. **Complex packages** (pantheon-*, frontend) → Update dependents
5. **Integration packages** (discord, trello, github-sync)

#### Dependency Graph Analysis
- Map all internal dependencies using `analyze-packages.mjs`
- Create topological sort for migration order
- Identify circular dependencies for resolution

### 5. Implementation Plan

#### Step 1: Complete Independent Migration
- Migrate remaining 23 independent packages
- Set up publishing workflows for each
- Publish initial versions to npm

#### Step 2: Version Pinning
- Create script to update `workspace:*` → published versions
- Run script on all 78 dependent packages
- Test builds with pinned dependencies

#### Step 3: Dependent Migration
- Migrate packages in dependency order
- Each migration includes publishing workflow setup
- Update dependent packages after each successful migration

#### Step 4: Workspace Cleanup
- Remove migrated packages from root workspace
- Update root `package.json` dependencies
- Archive old monorepo structure

### 6. Automation Tools

#### Enhanced Migration Script
```javascript
// migrate-with-publishing.mjs
function migrateAndPublish(packageInfo) {
  // 1. Migrate to subrepo
  // 2. Create publishing workflow
  // 3. Initialize changesets in subrepo
  // 4. Commit and push
}
```

#### Dependency Update Script
```javascript
// update-workspace-deps.mjs
function updateWorkspaceDependencies() {
  // 1. Get published versions from npm
  // 2. Update package.json files
  // 3. Test builds
  // 4. Commit changes
}
```

### 7. Risk Mitigation

#### Publishing Risks
- **NPM token security**: Use GitHub secrets, limit permissions
- **Version conflicts**: Use semantic versioning, check existing versions
- **Build failures**: Test builds in staging before publishing

#### Migration Risks
- **Dependency breakage**: Pin versions before migration
- **Workflow disruption**: Migrate in phases, maintain fallback
- **Rollback capability**: Keep monorepo backup during transition

### 8. Success Metrics

#### Publishing Success
- [ ] All migrated packages publish successfully to npm
- [ ] GitHub Actions workflows function correctly
- [ ] Version numbers follow semantic versioning

#### Migration Success
- [ ] 110+ packages migrated to individual repos
- [ ] Zero build failures in dependent packages
- [ ] Development workflow maintained

#### Operational Success
- [ ] Release frequency increases (individual package releases)
- [ ] Build times improve (parallel builds)
- [ ] Developer adoption > 90%

## Next Steps

1. **Create workflow template** for individual package publishing
2. **Enhance migration script** to include publishing setup
3. **Create dependency update script** for version pinning
4. **Continue independent package migration** with publishing
5. **Test publishing workflow** with existing migrated packages
6. **Plan dependent package migration** based on dependency graph

## Timeline Estimate

### Week 1: Publishing Infrastructure
- Create workflow templates
- Enhance migration scripts
- Test with existing packages

### Week 2-3: Independent Migration + Publishing
- Migrate remaining 23 independent packages
- Set up publishing workflows
- Publish initial versions

### Week 4-6: Dependency Management
- Create dependency graph
- Update workspace dependencies
- Test pinned dependency builds

### Week 7-10: Dependent Migration
- Migrate 78 dependent packages in order
- Set up publishing workflows
- Update dependencies progressively

### Week 11-12: Validation & Cleanup
- Test all workflows
- Clean up workspace
- Documentation updates

**Total Estimated Time: 12 weeks**