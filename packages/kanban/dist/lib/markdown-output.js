/**
 * Markdown Output Utilities for Kanban CLI
 *
 * Provides formatted markdown output for different kanban data types
 * to replace JSONL as the default output format.
 */
/**
 * Format a single task as markdown
 */
export function formatTask(task) {
    const status = task.status || 'unknown';
    const title = task.title || 'Untitled';
    const uuid = task.uuid || ('id' in task ? task.id : 'unknown');
    const description = task.content
        ? task.content.slice(0, 200) + (task.content.length > 200 ? '...' : '')
        : '';
    const labels = task.labels && task.labels.length > 0
        ? task.labels.map((tag) => `#${tag}`).join(' ')
        : '';
    return `## ${title}

**UUID:** \`${uuid}\`  
**Status:** ${status}  
${labels ? `**Labels:** ${labels}  \n` : ''}${description ? `**Description:** ${description}  \n` : ''}`;
}
/**
 * Format multiple tasks as markdown list
 */
export function formatTaskList(tasks) {
    if (tasks.length === 0) {
        return 'No tasks found.';
    }
    return tasks
        .map((task) => {
        const status = task.status || 'unknown';
        const title = task.title || 'Untitled';
        const uuid = task.uuid || ('id' in task ? task.id : 'unknown');
        const labels = task.labels && task.labels.length > 0
            ? ' ' + task.labels.map((tag) => `#${tag}`).join(' ')
            : '';
        return `- [ ] **${title}** (\`${uuid}\`) - ${status}${labels}`;
    })
        .join('\n');
}
/**
 * Format tasks grouped by status as markdown board
 */
export function formatTaskBoard(tasks) {
    if (tasks.length === 0) {
        return 'No tasks found.';
    }
    // Group tasks by status
    const grouped = tasks.reduce((acc, task) => {
        const status = task.status || 'unknown';
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(task);
        return acc;
    }, {});
    // Sort statuses alphabetically
    const sortedStatuses = Object.keys(grouped).sort();
    let output = '';
    for (const status of sortedStatuses) {
        output += `\n### ${status}\n\n`;
        output += formatTaskList(grouped[status] || []);
        output += '\n';
    }
    return output.trim();
}
/**
 * Format a board as markdown
 */
export function formatBoard(board) {
    const output = ['# Kanban Board'];
    // Add columns
    if (board.columns && board.columns.length > 0) {
        for (const column of board.columns) {
            output.push(`\n## ${column.name}\n`);
            if (column.tasks && column.tasks.length > 0) {
                for (const task of column.tasks) {
                    const labels = task.labels && task.labels.length > 0
                        ? ' ' + task.labels.map((tag) => `#${tag}`).join(' ')
                        : '';
                    output.push(`- [ ] **${task.title}** (\`${task.uuid}\`)${labels}`);
                }
            }
            else {
                output.push('*No tasks*');
            }
            output.push('');
        }
    }
    return output.join('\n');
}
/**
 * Format search results as markdown
 */
export function formatSearchResults(results, query) {
    if (results.length === 0) {
        return `No tasks found matching "${query}".`;
    }
    let output = `# Search Results for "${query}"\n\n`;
    output += `Found ${results.length} task${results.length === 1 ? '' : 's'}:\n\n`;
    output += formatTaskList(results);
    return output;
}
/**
 * Format task count as markdown
 */
export function formatTaskCount(counts) {
    let output = '# Task Counts\n\n';
    const sortedStatuses = Object.keys(counts).sort();
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    output += `**Total:** ${total} tasks\n\n`;
    for (const status of sortedStatuses) {
        output += `- **${status}:** ${counts[status]}\n`;
    }
    return output;
}
/**
 * Format audit results as markdown
 */
export function formatAuditResults(results) {
    let output = `# Board Audit Results\n\n`;
    output += `## Summary\n\n`;
    output += `- **Total Issues:** ${results.summary.total}\n`;
    output += `- **Errors:** ${results.summary.errors}\n`;
    output += `- **Warnings:** ${results.summary.warnings}\n\n`;
    if (results.issues.length === 0) {
        output += `✅ **No issues found!**\n`;
        return output;
    }
    output += `## Issues\n\n`;
    for (const issue of results.issues) {
        const emoji = issue.type === 'error' ? '❌' : '⚠️';
        output += `${emoji} **${issue.type.toUpperCase()}:** ${issue.message}`;
        if (issue.file) {
            output += ` (${issue.file})`;
        }
        output += '\n\n';
    }
    return output;
}
/**
 * Format a value for table display, handling arrays and objects properly
 */
export function formatTableCell(value) {
    if (value === null || value === undefined) {
        return '';
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '[]';
        }
        // Check if this looks like an array of Task objects
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
            // Check for Task-like objects (has uuid, title, status)
            if ('uuid' in value[0] && 'title' in value[0]) {
                return value
                    .map((task) => {
                    let title = task.title || 'Untitled';
                    // Clean up title - remove extra flags and formatting
                    title = title
                        .replace(/^--title\s+/, '')
                        .replace(/\s*\)\s*$/, '')
                        .trim();
                    const uuid = task.uuid ? task.uuid.slice(0, 8) : 'unknown';
                    return `${title} (${uuid}...)`;
                })
                    .join(', ');
            }
        }
        // Handle other arrays
        return value
            .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
            .join(', ');
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}
/**
 * Format generic data as markdown table
 */
export function formatTable(data, headers) {
    if (data.length === 0) {
        return 'No data to display.';
    }
    const keys = headers || (data[0] ? Object.keys(data[0]) : []);
    // Create header row
    let output = '| ' + keys.join(' | ') + ' |\n';
    // Create separator row
    output += '|' + keys.map(() => ' --- ').join('|') + '|\n';
    // Create data rows
    for (const row of data) {
        output += '| ' + keys.map((key) => formatTableCell(row[key])).join(' | ') + ' |\n';
    }
    return output;
}
/**
 * Main print function that outputs markdown to stdout
 */
export function printMarkdown(data, type = 'table', context) {
    let output;
    switch (type) {
        case 'task':
            output = formatTask(data);
            break;
        case 'tasks':
            // Handle both array and object with tasks property
            const tasksData = Array.isArray(data) ? data : data?.tasks || [];
            output = formatTaskList(tasksData);
            break;
        case 'board':
            output = formatBoard(data);
            break;
        case 'search':
            // Handle both array and object with exact/similar properties
            const searchData = Array.isArray(data) ? data : data?.exact || [];
            output = formatSearchResults(searchData, context?.query || '');
            break;
        case 'count':
            output = formatTaskCount(data);
            break;
        case 'audit':
            output = formatAuditResults(data);
            break;
        case 'table':
        default:
            if (Array.isArray(data)) {
                output = formatTable(data);
            }
            else if (typeof data === 'object' && data !== null) {
                output = formatTable([data]);
            }
            else {
                output = String(data);
            }
            break;
    }
    process.stdout.write(output + '\n');
}
//# sourceMappingURL=markdown-output.js.map