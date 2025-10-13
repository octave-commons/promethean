# Mass Duplication Cleanup Strategy

## Current Crisis Status
- **Started with**: 1,720 tasks
- **After initial cleanup**: 1,685 tasks (removed 35 duplicates)
- **Still have**: 895 numbered duplicates remaining
- **Most duplicated**: boardrev-vector-db (51 duplicates), kanban-board-refinement-and-cleanup (42 duplicates)

## Systematic Cleanup Approach

### Phase 1: High-Confidence Batch Removals
For tasks with 10+ duplicates, use automated approach:
1. Identify original task (without number or with lowest number)
2. Compare content - keep the one with substantial content
3. Remove numbered duplicates with minimal content (13 non-empty lines = frontmatter only)

### Phase 2: Medium-Confidence Removals
For tasks with 5-9 duplicates:
1. Manual verification of content differences
2. Keep most complete version
3. Remove obvious duplicates

### Phase 3: Edge Cases
For tasks with 2-4 duplicates:
1. Careful content comparison
2. Merge unique content if needed
3. Remove true duplicates

## Automation Strategy

### Content Analysis Script
```bash
# For each group of duplicates:
for base_pattern in $(find docs/agile/tasks -name "* [0-9]*.md" | sed 's/ [0-9]*\.md$//' | sort | uniq); do
  # Find all files in this group
  files=($(find docs/agile/tasks -name "${base_pattern}*.md"))
  
  # Analyze content sizes
  for file in "${files[@]}"; do
    non_empty=$(grep -c '[^[:space:]]' "$file")
    echo "$file: $non_empty lines"
  done | sort -k2 -nr
  
  # Keep the file with most content, remove others with minimal content
done
```

### Safety Measures
1. **Batch size**: Process in groups of 50-100 files
2. **Verification**: Regenerate kanban after each batch
3. **Rollback**: Keep backup for immediate restoration if needed
4. **Content preservation**: Never remove files with substantial content

## Priority Order

### Critical (50+ duplicates)
1. boardrev-vector-db (51 duplicates)
2. kanban-board-refinement-and-cleanup (42 duplicates)

### High (25-49 duplicates)
3. consolidation-summary (30 duplicates)
4. implement-kanban-dev-command (29 duplicates)
5. fix-symdocs-pipeline (29 duplicates)
6. And other 25+ duplicate groups

### Medium (10-24 duplicates)
7. task-migration-plan (20 duplicates)
8. cleanup-done-column (18 duplicates)

### Low (2-9 duplicates)
9. Remaining smaller groups

## Expected Results
- **Target reduction**: From 1,685 to ~200-300 tasks
- **Removal count**: Approximately 1,400+ duplicate files
- **Final state**: Clean, manageable task set with no duplicates