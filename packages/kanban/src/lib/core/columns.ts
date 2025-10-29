import type { ColumnData, Task } from '../types.js';
import { normalizeColumnDisplayName, columnKey } from '../utils/string-utils.js';

export const mergeColumnsCaseInsensitive = (
  columns: ReadonlyArray<ColumnData>,
): ColumnData[] => {
  const merged = new Map<string, ColumnData>();

  for (const column of columns) {
    const displayName = normalizeColumnDisplayName(column.name);
    const key = columnKey(column.name);
    const normalizedTasks: Task[] = column.tasks.map((task) => ({
      ...task,
      status: displayName,
    }));

    const existing = merged.get(key);
    if (existing) {
      const seen = new Set(existing.tasks.map((task) => task.uuid));
      for (const task of normalizedTasks) {
        if (!seen.has(task.uuid)) {
          existing.tasks.push(task);
          seen.add(task.uuid);
        }
      }
      existing.count = existing.tasks.length;
      if (existing.limit == null && column.limit != null) {
        existing.limit = column.limit;
      }
      if (existing.name.length === 0 && displayName.length > 0) {
        existing.name = displayName;
      }
    } else {
      merged.set(key, {
        name: displayName,
        count: normalizedTasks.length,
        limit: column.limit ?? null,
        tasks: [...normalizedTasks],
      });
    }
  }

  return Array.from(merged.values()).map((column) => ({
    ...column,
    name: normalizeColumnDisplayName(column.name),
    count: column.tasks.length,
  }));
};
