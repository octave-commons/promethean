---
$$
uuid: ba1ad13d-7988-4636-badf-f5fa9ac2344f
$$
$$
created_at: '2025-09-20T09:16:46Z'
$$
title: 2025.09.20.09.16.46
$$
filename: kanban-cli
$$
$$
description: >-
$$
  A CLI tool for managing Kanban boards using markdown files and task data. It
  provides subcommands to interact with tasks, columns, and board states through
  JSONL output.
tags:
  - kanban
  - cli
  - markdown
  - task-management
  - jsonl
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
status: todo
priority: P3
labels: []
---
I want my kanban to work
I want to get my pipelines working
I want to see the magic.

I want a system of programs running again!


# kanban cli
https://github.com/riatzukiza/promethean

create a new cli package for working with our `docs/agile/boards/kanban.md` and the tasks it contains.
$$
use `@promethean/markdown`
$$
Each sub command of the CLI returns jsonl.
task objects look like:
```
{uuid, title, status, priority, labels, created_at, estimates:{complexity, scale, time_to_completion}, content }
```

columnData looks like:
```
{name, count, limit, tasks:[...]}
```

## Flags
`--kanban path/to/kanban.md`
$$
`--tasks path/to/tasks/`
$$
## Subcommands
- count columnName? -> number
- getColumn columnName -> columnData
- getByColumn columnName -> tasks[]
- find uuid -> task
- find-by-title name title -> task
- update_status uuid new_status -> task
- move_up uuid -> colRank
- move_down uuid -> colRank
- pull -> `{added:number, moved:number }` # add or update tasks on the board from the tasks folder
- push -> `{added:number, moved:number }` # add or update tasks in the tasks folder from the board
- sync -> `{board:{added, moved}, tasks:{added, moved}, conflicting:[...taskuuids]}`
- regenerate -> `{totalTasks}` # complete rebuild the board from the tasks folder
- indexForSearch -> `{started:bool}` 
- search term -> `{similar:[tasks], exact:[tasks]}`
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->

