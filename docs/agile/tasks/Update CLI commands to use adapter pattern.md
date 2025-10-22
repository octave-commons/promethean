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
lastCommitSha: "96798dc604d59e03a11d39fd1a688db654be3157"
commitHistory:
  -
    sha: "96798dc604d59e03a11d39fd1a688db654be3157"
    timestamp: "2025-10-22 12:07:19 -0500\n\ndiff --git a/docs/agile/tasks/Update CLI commands to use adapter pattern.md b/docs/agile/tasks/Update CLI commands to use adapter pattern.md\nindex f8a0e88d6..33bcaf379 100644\n--- a/docs/agile/tasks/Update CLI commands to use adapter pattern.md\t\n+++ b/docs/agile/tasks/Update CLI commands to use adapter pattern.md\t\n@@ -10,14 +10,6 @@ estimates:\n   complexity: \"\"\n   scale: \"\"\n   time_to_completion: \"\"\n-lastCommitSha: \"12224d7aa0748301bb60c18d016291ec6251ecd9\"\n-commitHistory:\n-  -\n-    sha: \"12224d7aa0748301bb60c18d016291ec6251ecd9\"\n-    timestamp: \"2025-10-22 08:22:30 -0500\\n\\ndiff --git a/docs/agile/tasks/Update CLI commands to use adapter pattern.md b/docs/agile/tasks/Update CLI commands to use adapter pattern.md\\nindex b00a308ca..33bcaf379 100644\\n--- a/docs/agile/tasks/Update CLI commands to use adapter pattern.md\\t\\n+++ b/docs/agile/tasks/Update CLI commands to use adapter pattern.md\\t\\n@@ -2,7 +2,7 @@\\n uuid: \\\"71d30e75-0fae-433d-ab7c-0dab868bba2b\\\"\\n title: \\\"Update CLI commands to use adapter pattern\\\"\\n slug: \\\"Update CLI commands to use adapter pattern\\\"\\n-status: \\\"accepted\\\"\\n+status: \\\"icebox\\\"\\n priority: \\\"P0\\\"\\n labels: [\\\"update\\\", \\\"use\\\", \\\"cli\\\", \\\"commands\\\"]\\n created_at: \\\"2025-10-13T08:06:29.621Z\\\"\"\n-    message: \"Change task status: 71d30e75-0fae-433d-ab7c-0dab868bba2b - Update CLI commands to use adapter pattern - accepted → icebox\"\n-    author: \"Error\"\n-    type: \"status_change\"\n ---\n \n ## Task: Update CLI commands to use adapter pattern\\n\\n### Description\\nModify all kanban CLI commands to use the new adapter system with --target and --source arguments instead of hardcoded board/file paths.\\n\\n### Requirements\\n1. Update push command to accept --target and --source arguments\\n2. Update pull command to accept --target and --source arguments  \\n3. Update sync command to accept --target and --source arguments\\n4. Add argument parsing for 'type:location' format\\n5. Use AdapterFactory to create appropriate adapters\\n6. Maintain backward compatibility with current usage\\n7. Update help text to show new argument format\\n8. Add validation for required arguments\\n\\n### Implementation Details\\n- Default source to task directory if not specified\\n- Require target argument (no default)\\n- Support current behavior without arguments for backward compatibility\\n- Use adapters for all operations instead of direct file/board access\\n- Update command handlers to work with adapter interface\\n\\n### Acceptance Criteria\\n- All commands support --target and --source arguments\\n- Backward compatibility maintained (current usage still works)\\n- Proper error handling for invalid adapter specifications\\n- Updated help text with examples\\n- Integration tests for all command variations\\n- Existing functionality preserved\\n\\n### Dependencies\\n- Task 4: Adapter factory and registry system\\n\\n### Priority\\nP0 - Core functionality update"
    message: "Update task: 71d30e75-0fae-433d-ab7c-0dab868bba2b - Update task: Update CLI commands to use adapter pattern"
    author: "Error"
    type: "update"
---

## Task: Update CLI commands to use adapter pattern\n\n### Description\nModify all kanban CLI commands to use the new adapter system with --target and --source arguments instead of hardcoded board/file paths.\n\n### Requirements\n1. Update push command to accept --target and --source arguments\n2. Update pull command to accept --target and --source arguments  \n3. Update sync command to accept --target and --source arguments\n4. Add argument parsing for 'type:location' format\n5. Use AdapterFactory to create appropriate adapters\n6. Maintain backward compatibility with current usage\n7. Update help text to show new argument format\n8. Add validation for required arguments\n\n### Implementation Details\n- Default source to task directory if not specified\n- Require target argument (no default)\n- Support current behavior without arguments for backward compatibility\n- Use adapters for all operations instead of direct file/board access\n- Update command handlers to work with adapter interface\n\n### Acceptance Criteria\n- All commands support --target and --source arguments\n- Backward compatibility maintained (current usage still works)\n- Proper error handling for invalid adapter specifications\n- Updated help text with examples\n- Integration tests for all command variations\n- Existing functionality preserved\n\n### Dependencies\n- Task 4: Adapter factory and registry system\n\n### Priority\nP0 - Core functionality update

## ⛓️ Blocked By

Nothing



## ⛓️ Blocks

Nothing
