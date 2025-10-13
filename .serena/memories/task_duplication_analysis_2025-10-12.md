# Task Duplication Crisis Analysis

## Current State
- **Total task files**: 1,720
- **Kanban display count**: 89 tasks
- **Duplication level**: Extreme - most tasks have 10+ duplicates

## Duplication Pattern Identified

### Pattern 1: Numbered Suffixes
- Original: `task-name.md`
- Duplicates: `task-name 2.md`, `task-name 3.md`, etc.

### Pattern 2: Timestamped Tasks with Numbers
- Original: `2025.10.12.15.30.00-fix-kanban-ui-virtual-scroll-mime-error.md`
- Duplicates: `2025.10.12.15.30.00-fix-kanban-ui-virtual-scroll-mime-error 2.md`, etc.

## Most Critical Duplications Found

### 1. "Update existing kanban tasks to use FSM statuses" - 24 duplicates
- Original: `update-kanban-statuses-to-fsm.md` (UUID: kanban-fsm-update-001)
- Has full content, detailed acceptance criteria, related PRs
- Duplicates: Files 2-23, most are empty or minimal content
- Statuses: Mix of "ready" and "rejected"

### 2. "Fix Kanban UI Virtual Scroll MIME Type Error" - 5 duplicates
- Original: `2025.10.12.15.30.00-fix-kanban-ui-virtual-scroll-mime-error.md` (UUID: kanban-ui-virtual-scroll-mime-fix)
- Has comprehensive technical analysis, sub-tasks, implementation notes
- Duplicates: Files 2-5, minimal content only

### 3. "Implement @promethean/lmdb-cache Package with Enhanced Concurrency" - 5 duplicates
- Need to analyze this group

## Content Analysis Strategy

### Original Task Identification
1. **Full content**: Original tasks have detailed descriptions, acceptance criteria, technical analysis
2. **Proper UUID format**: Originals have meaningful UUIDs vs random UUIDs in duplicates
3. **Complete frontmatter**: Originals have full metadata, estimates, tags
4. **Timestamp patterns**: Originals have logical creation times, duplicates all have same timestamp (2025-10-12T23:41:48.142Z)

### Duplicate Characteristics
1. **Minimal content**: Most duplicates have only frontmatter, no body content
2. **Random UUIDs**: Duplicates have randomly generated UUIDs
3. **Same creation timestamp**: Many duplicates created simultaneously
4. **Empty labels**: Missing detailed descriptions and acceptance criteria

## Safe Deduplication Strategy

### Phase 1: High-Confidence Removals
- Remove tasks with empty/minimal content that have clear original counterparts
- Focus on tasks with 10+ duplicates first
- Keep the most complete version as the original

### Phase 2: Content Comparison
- For duplicates with different content, analyze which is more complete
- Merge unique content if necessary
- Preserve the most comprehensive version

### Phase 3: System Validation
- Regenerate kanban board after each batch
- Verify no broken references
- Check task counts return to reasonable levels

## Implementation Plan

### Batch 1: FSM Status Tasks (24 duplicates)
- Keep: `update-kanban-statuses-to-fsm.md` (full content)
- Remove: All numbered versions (2-23) with minimal content

### Batch 2: Kanban UI MIME Tasks (5 duplicates)
- Keep: `2025.10.12.15.30.00-fix-kanban-ui-virtual-scroll-mime-error.md` (comprehensive)
- Remove: All numbered versions (2-5) with minimal content

### Batch 3: LMDB Cache Tasks (5 duplicates)
- Analyze content to determine original
- Remove duplicates following same pattern

## Safety Measures
1. **Backup**: Create backup of task directory before deletion
2. **Batch processing**: Remove in small batches with validation
3. **Content verification**: Always verify original has complete content
4. **Board regeneration**: Test kanban functionality after each batch