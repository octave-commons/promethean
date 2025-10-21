## 📋 Kanban Task Management

All agents must use the kanban system for task tracking and work management.
The kanban board lives at `docs/agile/boards/generated.md` and is managed
via the `@promethean/kanban` package.


### 📍 Working with Kanban

**✅ DO:**

- Use kanban commands from **any directory** in the repository
- Update task status via `pnpm kanban update-status <uuid> <column>`
- Regenerate board after making task changes: `pnpm kanban regenerate`
- Search tasks before creating new ones: `pnpm kanban search <query>`
- Check task counts to understand workflow: `pnpm kanban count`

**❌ DON'T:**

- Manually edit the generated board file
- Create tasks without checking for duplicates first
- Forget to sync board changes back to task files

### 🔄 Common Agent Workflows

1. **Start work**: `pnpm kanban search <work-type>` → find relevant tasks
2. **Update task**: `pnpm kanban update-status <uuid> in_progress`
3. **Complete work**: `pnpm kanban update-status <uuid> done`
4. **Generate board**: `pnpm kanban regenerate`

### 📁 Task File Locations

- Tasks live in: `docs/agile/tasks/*.md`
- Generated board: `docs/agile/boards/generated.md`
- Config file: `promethean.kanban.json`
- CLI reference: `docs/agile/kanban-cli-reference.md`

### 📚 Further Documentation

- **Complete Kanban CLI Reference**: `docs/agile/kanban-cli-reference.md`
- **Process Documentation**: `docs/agile/process.md`
- **FSM Rules**: `docs/agile/rules/kanban-transitions.clj`
