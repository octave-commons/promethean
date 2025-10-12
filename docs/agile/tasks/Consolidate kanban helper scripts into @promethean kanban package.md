---
uuid: "924754b1-5d67-4e71-9cbf-1be77b9bb5ee"
title: "Consolidate kanban helper scripts into @promethean/kanban package"
slug: "Consolidate kanban helper scripts into @promethean kanban package"
status: "incoming"
priority: "P1"
labels: ["consolidate", "kanban", "package", "scripts"]
created_at: "2025-10-12T19:03:19.224Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




































































































































































Multiple kanban-related scripts exist outside the main kanban package, creating duplication and maintenance overhead.

## Scripts to Consolidate:
-  - Package validation logic
- 📊 Analyzing kanban board metrics...

📊 === KANBAN METRICS SUMMARY ===
Board Status: HEALTHY
Testing Queue: 0 tasks (0.0% overload)
Automation Potential: 0.0% coverage
Completion Rate: 0.0%

🎯 === RECOMMENDATIONS ===
📈 3. MONITOR: Track progress daily

📄 Report saved: docs/agile/reports/kanban-metrics.md helpers - Various kanban utilities
- Any other kanban-related shell scripts

## Current Issues:
- Kanban functionality scattered across scripts and packages
- Duplicate validation and helper logic
- Inconsistent CLI interfaces
- Maintenance overhead across multiple files

## Integration Plan:
1. **Move core functionality** into  package:
   - Package validation logic
   - Helper utilities
   - CLI command extensions

2. **Create unified CLI commands**:
   -  - Replace check_package_spec
   -  - Consolidate helper scripts
   - Extend existing kanban CLI with new subcommands

3. **Update documentation**:
   - Reference kanban package commands instead of scripts
   - Update workflows and CI/CD to use package commands

4. **Migration path**:
   - Add deprecation warnings to standalone scripts
   - Provide migration guide for users
   - Remove scripts in future major version

## Acceptance Criteria:
- [ ] All kanban helper scripts moved to @promethean/kanban package
- [ ] New CLI commands implemented and tested
- [ ] Documentation updated with new command references
- [ ] Deprecation warnings added to old scripts
- [ ] All existing functionality preserved
- [ ] Integration tests pass

## Files to Modify:
- Move: scripts/check_package_spec → packages/kanban/src/
- Move: scripts/kanban-* → packages/kanban/src/
- Update: packages/kanban/package.json (new commands)
- Update: Documentation referencing old scripts

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing



































































































































































