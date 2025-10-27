---
title: 'Configure publishConfig for all @promethean/* packages'
priority: P1
status: incoming
story_points: 8
tags: #release #configuration #packages #npm
epic: 'Implement Nx Release for Promethean Monorepo'
created: 2025-10-26
uuid: $(uuidgen)
---

## Task Overview

Audit and configure publishConfig for all publishable @promethean/\* packages to ensure proper public scope and build output publishing.

## Scope

- Audit all packages for publishability
- Add publishConfig.access = "public" to scoped packages
- Configure publishConfig.directory for build output
- Validate package.json metadata (license, files, exports, types)
- Test package packing with pnpm pack

## Acceptance Criteria

- All publishable packages have proper publishConfig
- Package metadata validated (types, exports, files)
- pnpm pack produces correct tarball contents
- Public scope configuration verified
- Build output publishing tested

## Dependencies

- Task: Research and design Nx Release strategy

## Definition of Done

- All packages configured correctly
- pnpm -r pack validates successfully
- Package tarballs inspected and approved
- Configuration documented
