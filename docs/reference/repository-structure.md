# Repository Structure Overview

## 📂 High-Level Organization

```
promethean/
├── packages/           # JS/TS modules and packages
├── tests/             # Unit and integration test suites
├── docs/              # System-level documentation
├── configs/           # Base configuration files
├── scripts/           # Development and maintenance scripts
├── tools/             # Development tools and utilities
├── infrastructure/    # DevOps and deployment configurations
├── services/          # Service definitions and configurations
└── sites/             # Static sites and documentation
```

## 📦 Package Structure (`packages/`)

Each package follows this anatomy:

```
packages/package-name/
├── src/                    # Source code
│   ├── tests/             # Package-specific tests
│   ├── frontend/          # Frontend components (if applicable)
│   └── index.ts           # Main entry point
├── dist/                   # Build output
├── static/                 # Webserver static files
├── tsconfig.json          # TypeScript configuration
├── ava.config.mjs         # Test configuration
├── package.json           # Package metadata and scripts
└── README.md              # Package documentation
```

### Key Package Scripts

- `build` - Compile TypeScript to JavaScript
- `test` - Run test suite
- `clean` - Remove build artifacts
- `coverage` - Generate test coverage report
- `typecheck` - TypeScript type checking

## 🗂️ Documentation Organization (`docs/`)

### Core Documentation

- `agile/` - Kanban board, tasks, epics, and process documentation
- `adr/` - Architecture Decision Records
- `reference/` - Technical reference materials and guides
- `inbox/` - Temporary holding area for new documents

### Reports and Analysis

- `reports/agile/` - Kanban board reports, workflow analysis
- `reports/benchmark/` - Performance benchmarks, BuildFix results
- `reports/security/` - Security analyses, threat models
- `reports/general/` - General project reports and summaries

### External Resources

- `external/` - Third-party documentation and references
- `prompts/optimized/` - Optimized prompt templates

## 🔧 Scripts Organization (`scripts/`)

### Development Scripts

- `debug/` - Debugging and diagnostic scripts
- `testing/` - Test scripts and validation tools
- `security/` - Security validation and testing scripts
- `dev/` - Development utilities and maintenance tools

### Tools (`tools/`)

- `benchmark/` - Benchmark generation and performance testing tools

## 🏗️ Infrastructure (`infrastructure/`)

### Deployment and Operations

- `compose/` - Docker Compose configurations
- `kubernetes/` - K8s deployment manifests
- `terraform/` - Infrastructure as Code
- `monitoring/` - Logging and monitoring setup

## ⚙️ Configuration Files

### Root-Level Configuration

- `package.json` - Project metadata and dependencies
- `pnpm-workspace.yaml` - Workspace configuration
- `nx.json` - Nx build system configuration
- `tsconfig.json` - Root TypeScript configuration
- `eslint.config.*` - Linting configuration

### Development Configuration

- `.env.example` - Environment variable template
- `.gitignore` - Git ignore patterns
- `.pre-commit-config.yaml` - Pre-commit hooks
- `playwright.json` - End-to-end test configuration

## 🧪 Testing Structure (`tests/`)

### Test Categories

- `unit/` - Unit test suites
- `integration/` - Integration test suites
- `e2e/` - End-to-end test suites
- `performance/` - Performance and load tests

### Test Configuration

- `test-config/` - Shared test configuration
- `fixtures/` - Test data and fixtures
- `helpers/` - Test utilities and helpers

## 📁 File Placement Guidelines

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

## 🔄 Workspace Management

### Monorepo Features

- **pnpm workspaces** for package management
- **Nx** for build orchestration and caching
- **Shared configurations** for TypeScript, ESLint, testing
- **Cross-package dependencies** via `workspace:*` protocol

### Build System

- **TypeScript compilation** with project references
- **AVA** for unit and integration testing
- **Playwright** for end-to-end testing
- **ESLint** for code quality and consistency

## 📚 Navigation Tips

### For Agents

- Use [[workspace-organization|../workspace-organization-guide.md]] for file placement
- Check [[documentation-structure|../DOCUMENTATION_STRUCTURE.md]] for docs organization
- Follow [[programming-style|programming-style.md]] for development guidelines

### For Humans

- Start with `README.md` for project overview
- Check `docs/agile/boards/generated.md` for current task status
- Use `docs/reference/` for technical guides
- Review `docs/reports/` for project metrics and analyses

## 🔍 Finding Content

### By Purpose

- **Development**: `packages/`, `scripts/`, `tools/`
- **Documentation**: `docs/`, `README.md`
- **Testing**: `tests/`, individual package `src/tests/`
- **Deployment**: `infrastructure/`
- **Configuration**: Root-level config files

### By File Type

- **Source Code**: `packages/*/src/`
- **Tests**: `tests/`, `packages/*/src/tests/`
- **Documentation**: `docs/`
- **Scripts**: `scripts/`
- **Configuration**: Root directory, `configs/`

## 📈 Scalability Considerations

### Package Organization

- Keep packages focused on single responsibilities
- Use clear naming conventions
- Maintain consistent internal structure
- Document package boundaries and dependencies

### Documentation Structure

- Separate user-facing from developer documentation
- Use categorical organization for reports
- Maintain clear navigation paths
- Regular cleanup of outdated content

---

_For detailed file placement rules, see [[workspace-organization|../workspace-organization-guide.md]]_
