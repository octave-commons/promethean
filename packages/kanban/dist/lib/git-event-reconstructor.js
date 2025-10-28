/**
 * Git Event Reconstructor
 *
 * Reconstructs kanban event log from git history by analyzing task file changes
 * and extracting status transitions over time.
 */
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';
/**
 * Reconstructs kanban events from git history
 */
export class GitEventReconstructor {
    repoRoot;
    tasksDir;
    options;
    constructor(options) {
        this.repoRoot = options.repoRoot || process.cwd();
        this.tasksDir = options.tasksDir;
        this.options = {
            repoRoot: this.repoRoot,
            tasksDir: options.tasksDir,
            since: options.since || '2020-01-01',
        };
    }
    /**
     * Get all commits that modified task files
     */
    getTaskCommits() {
        const sinceFlag = this.options.since ? `--since="${this.options.since}"` : '';
        const tasksPath = path.relative(this.repoRoot, this.tasksDir);
        try {
            // Build git command with proper quoting
            const formatFlag = "'--pretty=format:%H|%ai|%ae|%s'";
            const cmd = `git log ${sinceFlag} --name-only ${formatFlag} -- "${tasksPath}/*.md"`;
            const output = execSync(cmd, {
                cwd: this.repoRoot,
                encoding: 'utf8',
                maxBuffer: 50 * 1024 * 1024, // 50MB buffer
            })
                .toString()
                .trim();
            if (!output)
                return [];
            const commits = [];
            const lines = output.split('\n');
            let currentCommit = null;
            for (const line of lines) {
                if (line.includes('|')) {
                    // Commit header line
                    if (currentCommit) {
                        commits.push(currentCommit);
                    }
                    const [sha, timestamp, author, ...messageParts] = line.split('|');
                    currentCommit = {
                        sha,
                        timestamp,
                        author,
                        message: messageParts.join('|'),
                        files: [],
                    };
                }
                else if (line.trim() && currentCommit) {
                    // File path line
                    const filePath = line.trim();
                    if (filePath.endsWith('.md') && filePath.includes(tasksPath)) {
                        currentCommit.files.push(filePath);
                    }
                }
            }
            if (currentCommit) {
                commits.push(currentCommit);
            }
            return commits.reverse(); // Return in chronological order
        }
        catch (error) {
            console.warn('Warning: Failed to get git commits:', error);
            return [];
        }
    }
    /**
     * Extract task UUID from file path or content
     */
    extractTaskUuid(filePath, content) {
        // Try to extract from filename first
        const filename = path.basename(filePath, '.md');
        if (filename.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
            return filename;
        }
        // Try to extract from file content
        if (content) {
            const uuidMatch = content.match(/uuid:\s*['"]?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})['"]?/i);
            if (uuidMatch?.[1]) {
                return uuidMatch[1];
            }
        }
        return null;
    }
    /**
     * Extract status from task file content
     */
    extractTaskStatus(content) {
        const statusMatch = content.match(/status:\s*['"]?([^'"\n]+)['"]?/i);
        return statusMatch?.[1]?.trim() || null;
    }
    /**
     * Get task file content at specific commit
     */
    getTaskContentAtCommit(filePath, commitSha) {
        try {
            const cmd = `git show ${commitSha}:"${filePath}"`;
            return execSync(cmd, {
                cwd: this.repoRoot,
                encoding: 'utf8',
            });
        }
        catch (error) {
            // File might not exist at this commit
            return null;
        }
    }
    /**
     * Analyze status changes for a single task across commits
     */
    analyzeTaskStatusHistory(taskCommits, taskFilePath) {
        const events = [];
        let lastStatus = null;
        for (const commit of taskCommits) {
            const content = this.getTaskContentAtCommit(taskFilePath, commit.sha);
            if (!content) {
                // File was deleted or doesn't exist at this commit
                continue;
            }
            const currentStatus = this.extractTaskStatus(content);
            if (!currentStatus) {
                continue; // Skip commits without valid status
            }
            if (lastStatus && lastStatus !== currentStatus) {
                // Status changed - create event
                events.push({
                    taskId: this.extractTaskUuid(taskFilePath, content) || 'unknown',
                    fromStatus: lastStatus,
                    toStatus: currentStatus,
                    timestamp: commit.timestamp,
                    commitSha: commit.sha,
                    author: commit.author,
                    message: commit.message,
                });
            }
            lastStatus = currentStatus;
        }
        return events;
    }
    /**
     * Reconstruct all events from git history
     */
    reconstructEvents(options = {}) {
        const { taskUuidFilter, verbose = false } = options;
        if (verbose) {
            console.log('🔍 Analyzing git history for task status changes...');
        }
        const commits = this.getTaskCommits();
        if (verbose) {
            console.log(`📊 Found ${commits.length} commits affecting task files`);
        }
        // Group commits by task file
        const taskCommits = new Map();
        for (const commit of commits) {
            for (const filePath of commit.files) {
                if (!taskCommits.has(filePath)) {
                    taskCommits.set(filePath, []);
                }
                taskCommits.get(filePath).push(commit);
            }
        }
        if (verbose) {
            console.log(`📁 Found ${taskCommits.size} task files with history`);
        }
        // Analyze each task's status history
        const allEvents = [];
        for (const [taskFilePath, commits] of taskCommits) {
            const taskUuid = this.extractTaskUuid(taskFilePath);
            // Apply filter if specified
            if (taskUuidFilter && taskUuid !== taskUuidFilter) {
                continue;
            }
            const events = this.analyzeTaskStatusHistory(commits, taskFilePath);
            allEvents.push(...events);
            if (verbose && events.length > 0) {
                console.log(`   📋 ${taskUuid || 'unknown'}: ${events.length} status changes`);
            }
        }
        if (verbose) {
            console.log(`✅ Reconstructed ${allEvents.length} total status transitions`);
        }
        // Convert to TransitionEvent format
        const transitionEvents = allEvents.map((event) => ({
            id: randomUUID(),
            timestamp: event.timestamp,
            taskId: event.taskId,
            fromStatus: event.fromStatus,
            toStatus: event.toStatus,
            reason: `Reconstructed from git: ${event.message}`,
            actor: 'system', // Git history is treated as system events
            metadata: {
                commitSha: event.commitSha,
                author: event.author,
                reconstructed: true,
            },
        }));
        // Sort by timestamp
        transitionEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return transitionEvents;
    }
    /**
     * Get statistics about reconstruction
     */
    getReconstructionStats(events) {
        const uniqueTasks = new Set(events.map((e) => e.taskId));
        const transitionTypes = {};
        for (const event of events) {
            const transition = `${event.fromStatus} → ${event.toStatus}`;
            transitionTypes[transition] = (transitionTypes[transition] || 0) + 1;
        }
        const timestamps = events.map((e) => e.timestamp);
        const earliest = timestamps.length > 0 ? Math.min(...timestamps.map((t) => new Date(t).getTime())) : null;
        const latest = timestamps.length > 0 ? Math.max(...timestamps.map((t) => new Date(t).getTime())) : null;
        return {
            totalEvents: events.length,
            uniqueTasks: uniqueTasks.size,
            dateRange: {
                earliest: earliest ? new Date(earliest).toISOString() : null,
                latest: latest ? new Date(latest).toISOString() : null,
            },
            transitionTypes,
        };
    }
}
/**
 * Factory function to create event reconstructor
 */
export const makeGitEventReconstructor = (config, options = {}) => {
    return new GitEventReconstructor({
        ...options,
        tasksDir: config.tasksDir,
    });
};
//# sourceMappingURL=git-event-reconstructor.js.map