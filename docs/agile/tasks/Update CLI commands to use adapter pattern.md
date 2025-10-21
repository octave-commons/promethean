---
uuid: "71d30e75-0fae-433d-ab7c-0dab868bba2b"
title: "Update CLI commands to use adapter pattern"
slug: "Update CLI commands to use adapter pattern"
status: "icebox"
priority: "P0"
labels: ["update", "use", "cli", "commands"]
created_at: "2025-10-13T08:06:29.621Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
lastCommitSha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
commitHistory: 
  - sha: "deec21fe4553bb49020b6aa2bdfee1b89110f15d"
    timestamp: "2025-10-19T16:27:40.283Z"
    action: "Bulk commit tracking initialization"
---

## Task: Update CLI commands to use adapter pattern\n\n### Description\nModify all kanban CLI commands to use the new adapter system with --target and --source arguments instead of hardcoded board/file paths.\n\n### Requirements\n1. Update push command to accept --target and --source arguments\n2. Update pull command to accept --target and --source arguments  \n3. Update sync command to accept --target and --source arguments\n4. Add argument parsing for 'type:location' format\n5. Use AdapterFactory to create appropriate adapters\n6. Maintain backward compatibility with current usage\n7. Update help text to show new argument format\n8. Add validation for required arguments\n\n### Implementation Details\n- Default source to task directory if not specified\n- Require target argument (no default)\n- Support current behavior without arguments for backward compatibility\n- Use adapters for all operations instead of direct file/board access\n- Update command handlers to work with adapter interface\n\n### Acceptance Criteria\n- All commands support --target and --source arguments\n- Backward compatibility maintained (current usage still works)\n- Proper error handling for invalid adapter specifications\n- Updated help text with examples\n- Integration tests for all command variations\n- Existing functionality preserved\n\n### Dependencies\n- Task 4: Adapter factory and registry system\n\n### Priority\nP0 - Core functionality update

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing
