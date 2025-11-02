# Git Subrepo Migration Plan for Promethean Workspace

## Executive Summary

This plan outlines the migration of 110+ packages from the current monorepo structure to individual git repositories using git-subrepo. This approach provides better isolation, independent versioning, and cleaner dependency management while maintaining development workflow continuity.

## Current State Analysis

### Workspace Structure
- **110 top-level packages** in `/packages/` directory
- **pnpm workspace** configuration with nested package support
- **Mixed package types**: TypeScript services, libraries, CLI tools, UI components
- **Complex interdependencies** between packages
- **Shared build infrastructure** (tsconfig, ava.config.mjs, etc.)

### Key Package Categories
1. **Core Services**: auth-service, event, logger, llm, effects
2. **Platform Components**: pantheon-*, promethean-cli, unified-indexer
3. **Development Tools**: opencode-*, build-monitoring, test-utils
4. **UI Components**: frontend, shadow-ui, ui-components
5. **Integration Packages**: discord, trello, github-sync
6. **Utilities**: utils, web-utils, math-utils, naming

## Migration Strategy

### Phase 1: Infrastructure Preparation
1. **Install git-subrepo** across development environments
2. **Create remote repositories** for each package
3. **Establish naming conventions** for new repositories
4. **Set up CI/CD templates** for individual packages
5. **Create migration scripts** for automation

### Phase 2: Core Package Migration (Priority Order)
1. **Independent packages first** (no internal dependencies)
2. **Utility packages** (utils, naming, math-utils)
3. **Core services** (logger, event, effects)
4. **Platform components** (pantheon-core, persistence)
5. **Complex services** (auth-service, llm, discord)
6. **UI and frontend packages**
7. **Integration and tooling packages**

### Phase 3: Workspace Configuration
1. **Convert packages to subrepos** using `git subrepo init`
2. **Update pnpm-workspace.yaml** to reference subrepos
3. **Configure build scripts** for subrepo-aware operations
4. **Update CI/CD pipelines** for subrepo workflow
5. **Migrate documentation** and wikis

### Phase 4: Validation and Cleanup
1. **Test all build processes** with new structure
2. **Validate dependency resolution** 
3. **Update development workflows**
4. **Clean up old package directories**
5. **Archive old monorepo structure**

## Technical Implementation Details

### Git Subrepo Commands Workflow

#### For each package migration:
```bash
# 1. Initialize existing directory as subrepo
git subrepo init packages/package-name

# 2. Create remote repository (GitHub API/CLI)
gh repo create promethean-os/package-name --public --clone=false

# 3. Configure remote
git subrepo config packages/package-name remote git@github.com:promethean-os/package-name.git

# 4. Push to new remote
git subrepo push packages/package-name
```

#### For ongoing development:
```bash
# Pull upstream changes
git subrepo pull packages/package-name

# Push local changes
git subrepo push packages/package-name

# Check status
git subrepo status packages/package-name
```

### Repository Naming Convention
- **Pattern**: `promethean-os/<package-name>`
- **Examples**: 
  - `packages/auth-service` → `promethean-os/auth-service`
  - `packages/pantheon-core` → `promethean-os/pantheon-core`
  - `packages/opencode-client` → `promethean-os/opencode-client`

### Branch Strategy
- **Main branch**: `main` (consistent across all repos)
- **Development**: feature branches in individual repos
- **Release tags**: semantic versioning per package
- **Subrepo tracking**: automatic branch management by git-subrepo

## Dependency Management

### Inter-Package Dependencies
1. **Maintain pnpm workspace** for local development
2. **Use workspace protocol** in package.json: `"@promethean-os/pkg": "workspace:*"`
3. **Publish to npm registry** for external consumption
4. **Version bumping** coordinated through changesets

### Build System Adaptation
1. **Shared build configs** moved to separate repo
2. **Package-specific builds** reference shared configs
3. **TypeScript project references** for cross-package compilation
4. **Test execution** remains workspace-aware

## Risk Mitigation

### Technical Risks
1. **Dependency circularity**: Map and resolve before migration
2. **Build process breakage**: Test in staging environment first
3. **CI/CD pipeline disruption**: Parallel migration with fallback
4. **Developer workflow disruption**: Comprehensive documentation and training

### Operational Risks
1. **Migration complexity**: Automated scripts with manual verification
2. **Repository proliferation**: Clear naming and organization strategy
3. **Access control**: Consistent permissions across repositories
4. **Backup and recovery**: Full monorepo backup before migration

## Success Criteria

### Technical Success
- [ ] All packages build independently
- [ ] Dependency resolution works correctly
- [ ] CI/CD pipelines function properly
- [ ] Development workflows maintained

### Operational Success
- [ ] Developer adoption > 90%
- [ ] Build time improvement > 20%
- [ ] Release frequency increase > 2x
- [ ] Zero critical incidents post-migration

## Timeline Estimate

### Phase 1: 1-2 weeks
- Infrastructure setup and repository creation
- Script development and testing

### Phase 2: 4-6 weeks
- Package migration (20-25 packages per week)
- Dependency resolution and testing

### Phase 3: 2-3 weeks
- Workspace configuration updates
- CI/CD pipeline migration

### Phase 4: 1-2 weeks
- Validation, cleanup, and documentation

**Total Estimated Time: 8-13 weeks**

## Resource Requirements

### Personnel
- **DevOps Engineer**: Infrastructure and CI/CD setup
- **Backend Developer**: Package migration and dependency resolution
- **Frontend Developer**: UI package migration and testing
- **Technical Writer**: Documentation and guides

### Tools and Services
- **GitHub Enterprise**: Advanced repository management
- **CI/CD Platform**: GitHub Actions or equivalent
- **Package Registry**: npm or private registry
- **Monitoring**: Build and deployment tracking

## Next Steps

1. **Secure stakeholder approval** for migration plan
2. **Set up pilot migration** with 5-10 packages
3. **Develop automation scripts** for bulk operations
4. **Create developer documentation** and training materials
5. **Establish rollback procedures** for each phase

## Conclusion

This migration to git-subrepo provides significant benefits in terms of maintainability, scalability, and developer experience while minimizing disruption to existing workflows. The phased approach ensures risk mitigation and allows for course correction based on early results.