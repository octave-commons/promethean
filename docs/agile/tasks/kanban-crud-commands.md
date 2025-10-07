---
title: "Add CRUD subcommands to kanban CLI"
status: incoming
priority: P2
tags: [kanban, cli, enhancement, crud]
uuid: kanban-crud-001
created: 2025-10-06
---

# Add CRUD subcommands to kanban CLI

Add Create, Read, Update, Delete (CRUD) subcommands to the kanban CLI to provide better task management capabilities.

## Details

- Add `create` subcommand to create new tasks from CLI
- Add `read` subcommand to view task details
- Add `update` subcommand to modify task properties
- Add `delete` subcommand to remove tasks
- Ensure proper validation and error handling
- Maintain consistency with existing command patterns

## Acceptance Criteria

- [ ] `kanban create` command implemented with required fields (title, status)
- [ ] `kanban read` command implemented to view task details by UUID or title
- [ ] `kanban update` command implemented to modify task properties
- [ ] `kanban delete` command implemented with confirmation prompt
- [ ] Commands follow existing CLI patterns and output JSON format
- [ ] Proper error handling and validation for all operations
- [ ] Integration tests added for new CRUD operations