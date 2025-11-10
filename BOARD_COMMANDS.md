## 🗂 Kanban Task Management

This is a **solo operation with AI helpers** - you're the only stakeholder working on a massive undertaking. The Kanban system (`@promethean-os/kanban`) exists to support you, not to add overhead or corporate-style process to what's already a huge challenge.

The board lives at: `docs/agile/boards/generated.md`

Think of it as a **personal GPS** for your development journey - it helps you see where you've been, where you're going, and what's realistic to tackle next.


### Commands

```bash
pnpm kanban --help
pnpm kanban process
pnpm kanban audit
pnpm kanban update-status <uuid> <column>
pnpm kanban regenerate
pnpm kanban search <query>
pnpm kanban count
```

**Flow:**

1. `pnpm kanban search <work-type>` - Find relevant work
2. `pnpm kanban update-status <uuid> in_progress` - Pull task for active work
3. `pnpm kanban update-status <uuid> done` - Complete work and move through documentation
4. `pnpm kanban regenerate` - Update board to reflect current reality

### File Locations

- Tasks → `docs/agile/tasks/*.md`
- Board → `docs/agile/boards/generated.md`
- Config → `promethean.kanban.json`
- CLI Reference → `docs/agile/kanban-cli-reference.md`


### When Work Happens Outside Board

This will happen. A lot. And that's completely normal for solo development:

1. **Create retrospective cards** when you remember - no pressure to be perfect
2. **Move through board as a quick cleanup** - 5 minutes to acknowledge what got done
3. **Learn from your patterns** - Are you consistently bypassing certain steps? Maybe they're not needed
4. **Update the map to match reality** - The board should document what actually happened, not what was "supposed" to happen
