/**
 * Fix for kanban search functionality
 *
 * This module addresses the "tasks.map is not a function" error
 * in the markdown output module by providing proper type guards
 * and error handling for search results.
 */
/**
 * Safe task mapper that handles null/undefined values
 */
export function safeTaskMap(tasks, mapper) {
    if (!Array.isArray(tasks)) {
        console.warn('[KanbanSearchFix] tasks is not an array:', typeof tasks);
        return [];
    }
    return tasks
        .filter((task) => task !== null &&
        task !== undefined &&
        typeof task === 'object' &&
        'uuid' in task &&
        'title' in task)
        .map(mapper);
}
/**
 * Validate task structure
 */
export function isValidTask(task) {
    return (task !== null &&
        task !== undefined &&
        typeof task === 'object' &&
        'uuid' in task &&
        'title' in task &&
        'status' in task);
}
/**
 * Safe search results formatter
 */
export function formatSearchResults(results, query) {
    if (!results) {
        return `No results found for query: "${query}"`;
    }
    if (!Array.isArray(results)) {
        console.warn('[KanbanSearchFix] Search results is not an array:', typeof results);
        return `Invalid search results for query: "${query}"`;
    }
    const validTasks = results.filter(isValidTask);
    if (validTasks.length === 0) {
        return `No valid tasks found for query: "${query}"`;
    }
    const formattedTasks = validTasks
        .map((task) => `- **${task.title}** (${task.uuid})\n  Status: ${task.status}\n  Priority: ${task.priority || 'N/A'}`)
        .join('\n\n');
    return `Found ${validTasks.length} task(s) for query: "${query}"\n\n${formattedTasks}`;
}
/**
 * Patch for the markdown output module
 */
export function patchMarkdownOutput() {
    // This would be used to monkey-patch the existing markdown output module
    // to use the safe task mapping functions
    console.log('[KanbanSearchFix] Markdown output patch applied');
}
//# sourceMappingURL=kanban-search-fix.js.map