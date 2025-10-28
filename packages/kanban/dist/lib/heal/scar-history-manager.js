/**
 * Scar History Manager for Kanban Healing Operations
 *
 * This module provides comprehensive scar history management capabilities for tracking
 * and analyzing healing operations over time. It maintains persistent storage,
 * provides search and analysis capabilities, and integrates with git tag management.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { GitTagManager } from './git-tag-manager.js';
/**
 * Scar history manager for comprehensive healing operation tracking
 */
export class ScarHistoryManager {
    repoRoot;
    config;
    gitTagManager;
    scarHistoryPath;
    constructor(repoRoot, config = {}) {
        this.repoRoot = repoRoot;
        this.config = {
            storageDir: config.storageDir || '.kanban/scars',
            maxScarsRetained: config.maxScarsRetained || 100,
            compressOldData: config.compressOldData ?? true,
            compressionThreshold: config.compressionThreshold || 90, // 90 days
        };
        this.scarHistoryPath = path.join(this.repoRoot, this.config.storageDir);
        this.gitTagManager = new GitTagManager(repoRoot);
    }
    /**
     * Record a new healing operation
     */
    async recordHealingOperation(context, result, startSha, endSha) {
        try {
            // Create scar record
            const scar = {
                start: startSha,
                end: endSha,
                tag: context.metadata.tag,
                story: this.generateScarStory(context, result),
                timestamp: new Date(),
            };
            // Store scar record
            const storeResult = await this.gitTagManager.storeScarRecord(scar);
            if (!storeResult.success) {
                return {
                    success: false,
                    error: `Failed to store scar record: ${storeResult.error}`,
                };
            }
            // Store additional context data
            await this.storeScarContext(scar.tag, context, result);
            // Cleanup old records if needed
            await this.enforceRetentionPolicy();
            return { success: true, scar };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * Query scar history
     */
    async queryScars(query = {}) {
        const scars = await this.loadAllScars();
        let filteredScars = [...scars];
        // Apply filters
        if (query.tagPattern) {
            const pattern = new RegExp(query.tagPattern, 'i');
            filteredScars = filteredScars.filter((scar) => pattern.test(scar.tag));
        }
        if (query.dateRange) {
            const { start, end } = query.dateRange;
            if (start) {
                filteredScars = filteredScars.filter((scar) => scar.timestamp >= start);
            }
            if (end) {
                filteredScars = filteredScars.filter((scar) => scar.timestamp <= end);
            }
        }
        if (query.storyContains) {
            const searchTerm = query.storyContains.toLowerCase();
            filteredScars = filteredScars.filter((scar) => scar.story.toLowerCase().includes(searchTerm));
        }
        // Apply sorting
        const sortBy = query.sortBy || 'timestamp';
        const sortOrder = query.sortOrder || 'desc';
        filteredScars.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'timestamp') {
                comparison = a.timestamp.getTime() - b.timestamp.getTime();
            }
            else if (sortBy === 'tag') {
                comparison = a.tag.localeCompare(b.tag);
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });
        // Apply limit
        if (query.limit && query.limit > 0) {
            filteredScars = filteredScars.slice(0, query.limit);
        }
        return filteredScars;
    }
    /**
     * Get detailed scar information including commits
     */
    async getScarDetails(scarTag) {
        // Find the scar record
        const scars = await this.loadAllScars();
        const scar = scars.find((s) => s.tag === scarTag) || null;
        if (!scar) {
            return { scar: null, commits: [] };
        }
        // Get commits between the scar range
        const commits = await this.gitTagManager.getCommitsBetweenTags(scar.start, scar.end);
        // Load additional context if available
        const context = await this.loadScarContext(scarTag);
        const result = await this.loadScarResult(scarTag);
        return { scar, commits, context, result };
    }
    /**
     * Analyze scar history for insights
     */
    async analyzeScars() {
        const scars = await this.loadAllScars();
        const totalScars = scars.length;
        if (totalScars === 0) {
            return {
                totalScars: 0,
                scarsByPeriod: { daily: {}, weekly: {}, monthly: {} },
                commonReasons: [],
                successRate: 0,
                frequentlyHealedFiles: [],
            };
        }
        // Analyze scars by time period
        const scarsByPeriod = this.analyzeScarsByPeriod(scars);
        // Analyze common reasons
        const commonReasons = await this.analyzeCommonReasons(scars);
        // Calculate success rate
        const successRate = await this.calculateSuccessRate(scars);
        // Calculate average healing time
        const averageHealingTime = await this.calculateAverageHealingTime(scars);
        // Analyze frequently healed files
        const frequentlyHealedFiles = await this.analyzeFrequentlyHealedFiles(scars);
        return {
            totalScars,
            scarsByPeriod,
            commonReasons,
            successRate,
            averageHealingTime,
            frequentlyHealedFiles,
        };
    }
    /**
     * Get scars that might be related to a current issue
     */
    async findRelatedScars(currentIssue, maxResults = 5) {
        const scars = await this.loadAllScars();
        const relatedScars = [];
        const currentIssueLower = currentIssue.toLowerCase();
        for (const scar of scars) {
            let relevance = 0;
            const reasons = [];
            // Check for keyword matches in story
            const storyWords = scar.story.toLowerCase().split(/\s+/);
            const issueWords = currentIssueLower.split(/\s+/);
            const commonWords = storyWords.filter((word) => word.length > 3 && issueWords.includes(word));
            if (commonWords.length > 0) {
                relevance += commonWords.length * 0.3;
                reasons.push(`Found ${commonWords.length} related keywords`);
            }
            // Check for similar patterns
            if (this.hasSimilarPattern(scar.story, currentIssue)) {
                relevance += 0.5;
                reasons.push('Similar issue pattern detected');
            }
            // Check recency (more recent scars are more relevant)
            const daysOld = (Date.now() - scar.timestamp.getTime()) / (1000 * 60 * 60 * 24);
            if (daysOld < 30) {
                relevance += 0.2;
                reasons.push('Recent healing operation');
            }
            if (relevance > 0) {
                relatedScars.push({
                    scar,
                    relevance: Math.min(1, relevance),
                    reason: reasons.join(', '),
                });
            }
        }
        // Sort by relevance and limit results
        return relatedScars.sort((a, b) => b.relevance - a.relevance).slice(0, maxResults);
    }
    /**
     * Export scar history to various formats
     */
    async exportScars(format = 'json', query) {
        const scars = query ? await this.queryScars(query) : await this.loadAllScars();
        switch (format) {
            case 'json':
                return JSON.stringify(scars, null, 2);
            case 'csv':
                return this.generateScarsCSV(scars);
            case 'markdown':
                return this.generateScarsMarkdown(scars);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    /**
     * Import scar history from backup
     */
    async importScars(data, format = 'json') {
        const errors = [];
        let importedScars = [];
        try {
            switch (format) {
                case 'json':
                    importedScars = JSON.parse(data);
                    break;
                case 'csv':
                    importedScars = this.parseScarsCSV(data);
                    break;
            }
            // Validate imported scars
            const validScars = importedScars.filter((scar) => {
                if (!scar.start || !scar.end || !scar.tag || !scar.story) {
                    errors.push(`Invalid scar record: missing required fields`);
                    return false;
                }
                return true;
            });
            // Check for duplicates
            const existingScars = await this.loadAllScars();
            const existingTags = new Set(existingScars.map((s) => s.tag));
            let duplicates = 0;
            const newScars = validScars.filter((scar) => {
                if (existingTags.has(scar.tag)) {
                    duplicates++;
                    return false;
                }
                return true;
            });
            // Add new scars
            for (const scar of newScars) {
                await this.gitTagManager.storeScarRecord(scar);
            }
            return {
                success: errors.length === 0,
                imported: newScars.length,
                duplicates,
                errors,
            };
        }
        catch (error) {
            errors.push(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
            return {
                success: false,
                imported: 0,
                duplicates: 0,
                errors,
            };
        }
    }
    /**
     * Load all scar records
     */
    async loadAllScars() {
        return this.gitTagManager.loadScarHistory();
    }
    /**
     * Store additional scar context data
     */
    async storeScarContext(tag, context, result) {
        try {
            await fs.mkdir(this.scarHistoryPath, { recursive: true });
            const contextFile = path.join(this.scarHistoryPath, `${tag}.context.json`);
            const resultFile = path.join(this.scarHistoryPath, `${tag}.result.json`);
            await fs.writeFile(contextFile, JSON.stringify(context, null, 2), 'utf8');
            await fs.writeFile(resultFile, JSON.stringify(result, null, 2), 'utf8');
        }
        catch (error) {
            // Context storage is optional, don't fail the operation
            console.warn('Failed to store scar context:', error);
        }
    }
    /**
     * Load scar context data
     */
    async loadScarContext(tag) {
        try {
            const contextFile = path.join(this.scarHistoryPath, `${tag}.context.json`);
            const data = await fs.readFile(contextFile, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            return undefined;
        }
    }
    /**
     * Load scar result data
     */
    async loadScarResult(tag) {
        try {
            const resultFile = path.join(this.scarHistoryPath, `${tag}.result.json`);
            const data = await fs.readFile(resultFile, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            return undefined;
        }
    }
    /**
     * Generate scar story from context and result
     */
    generateScarStory(context, result) {
        let story = `Healing operation: ${context.reason}\n\n`;
        story += `Summary: ${result.summary}\n`;
        story += `Status: ${result.status}\n`;
        story += `Tasks modified: ${result.tasksModified}\n`;
        story += `Files changed: ${result.filesChanged}\n`;
        if (result.errors.length > 0) {
            story += `\nErrors encountered:\n${result.errors.map((e) => `- ${e}`).join('\n')}\n`;
        }
        if (context.searchResults.length > 0) {
            story += `\nFound ${context.searchResults.length} relevant tasks during analysis.`;
        }
        if (context.llmOperations.length > 0) {
            story += `\nPerformed ${context.llmOperations.length} LLM operations.`;
        }
        return story;
    }
    /**
     * Analyze scars by time period
     */
    analyzeScarsByPeriod(scars) {
        const daily = {};
        const weekly = {};
        const monthly = {};
        for (const scar of scars) {
            const date = scar.timestamp;
            // Daily
            const dayKey = date.toISOString().split('T')[0];
            if (dayKey) {
                daily[dayKey] = (daily[dayKey] || 0) + 1;
            }
            // Weekly
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            if (weekKey) {
                weekly[weekKey] = (weekly[weekKey] || 0) + 1;
            }
            // Monthly
            const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
            monthly[monthKey] = (monthly[monthKey] || 0) + 1;
        }
        return { daily, weekly, monthly };
    }
    /**
     * Analyze common healing reasons
     */
    async analyzeCommonReasons(scars) {
        const reasonCounts = new Map();
        for (const scar of scars) {
            // Extract reason from story (first line)
            const reasonMatch = scar.story.match(/^Healing operation: (.+)$/m);
            if (reasonMatch && reasonMatch[1]) {
                const reason = reasonMatch[1].trim();
                reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
            }
        }
        const total = scars.length;
        return Array.from(reasonCounts.entries())
            .map(([reason, count]) => ({
            reason,
            count,
            percentage: (count / total) * 100,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    /**
     * Calculate healing success rate
     */
    async calculateSuccessRate(scars) {
        let successful = 0;
        for (const scar of scars) {
            const result = await this.loadScarResult(scar.tag);
            if (result && (result.status === 'completed' || result.status === 'in_progress')) {
                successful++;
            }
        }
        return scars.length > 0 ? (successful / scars.length) * 100 : 0;
    }
    /**
     * Calculate average healing time
     */
    async calculateAverageHealingTime(scars) {
        const times = [];
        for (const scar of scars) {
            const commits = await this.gitTagManager.getCommitsBetweenTags(scar.start, scar.end);
            if (commits.length > 0) {
                const firstCommit = commits[commits.length - 1];
                const lastCommit = commits[0];
                if (firstCommit && lastCommit) {
                    const hoursDiff = (lastCommit.timestamp.getTime() - firstCommit.timestamp.getTime()) / (1000 * 60 * 60);
                    times.push(hoursDiff);
                }
            }
        }
        return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : undefined;
    }
    /**
     * Analyze frequently healed files
     */
    async analyzeFrequentlyHealedFiles(scars) {
        const fileCounts = new Map();
        for (const scar of scars) {
            const commits = await this.gitTagManager.getCommitsBetweenTags(scar.start, scar.end);
            for (const commit of commits) {
                for (const file of commit.files) {
                    fileCounts.set(file, (fileCounts.get(file) || 0) + 1);
                }
            }
        }
        return Array.from(fileCounts.entries())
            .map(([file, count]) => ({ file, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);
    }
    /**
     * Check if two issues have similar patterns
     */
    hasSimilarPattern(story, currentIssue) {
        // Simple pattern matching - could be enhanced with NLP
        const patterns = [
            /duplicate/i,
            /missing/i,
            /broken/i,
            /failed/i,
            /error/i,
            /conflict/i,
            /sync/i,
            /corrupt/i,
        ];
        const storyPatterns = patterns.filter((pattern) => pattern.test(story));
        const issuePatterns = patterns.filter((pattern) => pattern.test(currentIssue));
        return storyPatterns.some((pattern) => issuePatterns.includes(pattern));
    }
    /**
     * Generate CSV export of scars
     */
    generateScarsCSV(scars) {
        const headers = ['tag', 'start', 'end', 'timestamp', 'story'];
        const rows = scars.map((scar) => [
            scar.tag,
            scar.start,
            scar.end,
            scar.timestamp.toISOString(),
            `"${scar.story.replace(/"/g, '""')}"`,
        ]);
        return [headers, ...rows].map((row) => row.join(',')).join('\n');
    }
    /**
     * Generate markdown export of scars
     */
    generateScarsMarkdown(scars) {
        let markdown = '# Scar History\n\n';
        for (const scar of scars) {
            markdown += `## ${scar.tag}\n\n`;
            markdown += `**Date:** ${scar.timestamp.toISOString()}\n\n`;
            markdown += `**Range:** ${scar.start.substring(0, 8)}..${scar.end.substring(0, 8)}\n\n`;
            markdown += `**Story:**\n${scar.story}\n\n`;
            markdown += '---\n\n';
        }
        return markdown;
    }
    /**
     * Parse scars from CSV
     */
    parseScarsCSV(csv) {
        const lines = csv.split('\n');
        if (lines.length < 2)
            return [];
        const scars = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i]?.trim();
            if (!line || line.length === 0)
                continue;
            const parts = line.split(',');
            if (parts.length >= 5 && parts[4]) {
                const tag = parts[0] || '';
                const start = parts[1] || '';
                const end = parts[2] || '';
                const timestampStr = parts[3];
                const story = parts[4].replace(/""/g, '"').replace(/^"|"$/g, '');
                scars.push({
                    tag,
                    start,
                    end,
                    timestamp: timestampStr ? new Date(timestampStr) : new Date(),
                    story,
                });
            }
        }
        return scars;
    }
    /**
     * Enforce retention policy
     */
    async enforceRetentionPolicy() {
        const scars = await this.loadAllScars();
        if (scars.length > this.config.maxScarsRetained) {
            const sortedScars = scars.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            const scarsToKeep = sortedScars.slice(0, this.config.maxScarsRetained);
            // Rewrite the scar file with only the kept scars
            const scarFile = path.join(this.scarHistoryPath, 'scars.json');
            await fs.writeFile(scarFile, JSON.stringify(scarsToKeep, null, 2), 'utf8');
        }
    }
}
/**
 * Convenience function to create a scar history manager
 */
export function createScarHistoryManager(repoRoot, config) {
    return new ScarHistoryManager(repoRoot, config);
}
//# sourceMappingURL=scar-history-manager.js.map