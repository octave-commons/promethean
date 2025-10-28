import { createLogger } from '@promethean-os/utils';
import { readFileSync } from 'fs';
import matter from 'gray-matter';
import path from 'path';
const logger = createLogger({ service: 'task-tools' });
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export async function compareTasks(taskUuids, boardPath = 'docs/agile/boards/generated.md', tasksPath = 'docs/agile/tasks') {
    logger.info(`Comparing ${taskUuids.length} tasks for similarities...`);
    const comparisons = [];
    try {
        const boardContent = readFileSync(boardPath, 'utf-8');
        // Load tasks to get their content
        const tasks = taskUuids.map(uuid => {
            const safeUuid = escapeRegExp(uuid);
            const taskMatch = boardContent.match(new RegExp(`\\(uuid:${safeUuid}\\)`, 'm'));
            if (!taskMatch) {
                logger.warn(`Task ${uuid} not found in board`);
                return null;
            }
            // Find the task title from the same line
            const line = boardContent.substring(0, taskMatch.index).split('\n').pop();
            if (!line) {
                logger.warn(`Task ${uuid} line not found in board`);
                return null;
            }
            // Extract title from wikilink format: [[title|display text]]
            const wikilinkMatch = line.match(/\[\[([^\|\]]+)/);
            const taskTitle = wikilinkMatch ? (wikilinkMatch[1] || '') : '';
            if (!taskTitle) {
                logger.warn(`Task ${uuid} title not found in board`);
                return null;
            }
            const taskFile = path.join(tasksPath, `${taskTitle}.md`);
            try {
                const content = readFileSync(taskFile, 'utf-8');
                const parsed = matter(content);
                return {
                    uuid,
                    title: taskTitle || '',
                    status: parsed.data.status || 'todo',
                    priority: parsed.data.priority || 'P3',
                    labels: (parsed.data.labels || []),
                    content: parsed.content
                };
            }
            catch (error) {
                logger.warn(`Could not read task file for ${uuid}: ${error.message}`);
                return null;
            }
        }).filter(Boolean);
        // Compare each task with every other task
        for (let i = 0; i < tasks.length; i++) {
            for (let j = i + 1; j < tasks.length; j++) {
                const taskA = tasks[i];
                const taskB = tasks[j];
                const similarity = calculateSimilarity(taskA, taskB);
                const sharedLabels = taskA.labels.filter(label => taskB.labels.includes(label));
                const reasons = generateSimilarityReasons(taskA, taskB, similarity, sharedLabels);
                comparisons.push({
                    uuid: taskA.uuid,
                    title: taskA.title,
                    status: taskA.status,
                    priority: taskA.priority,
                    similarity,
                    sharedLabels,
                    reasons
                });
            }
        }
        // Sort by similarity (highest first)
        comparisons.sort((a, b) => b.similarity - a.similarity);
        logger.info(`Found ${comparisons.length} task comparisons`);
        return comparisons;
    }
    catch (error) {
        logger.error(`Failed to compare tasks: ${error.message}`);
        throw error;
    }
}
function calculateSimilarity(taskA, taskB) {
    let similarity = 0;
    // Title similarity (word overlap)
    const wordsA = taskA.title.toLowerCase().split(/\s+/);
    const wordsB = taskB.title.toLowerCase().split(/\s+/);
    const commonWords = wordsA.filter((word) => wordsB.includes(word));
    const titleSimilarity = commonWords.length / Math.max(wordsA.length, wordsB.length);
    similarity += titleSimilarity * 0.3;
    // Label similarity
    const commonLabels = taskA.labels.filter((label) => taskB.labels.includes(label));
    const labelSimilarity = commonLabels.length / Math.max(taskA.labels.length, taskB.labels.length, 1);
    similarity += labelSimilarity * 0.4;
    // Content similarity (simplified word overlap)
    const contentWordsA = taskA.content.toLowerCase().split(/\s+/).slice(0, 100); // First 100 words
    const contentWordsB = taskB.content.toLowerCase().split(/\s+/).slice(0, 100);
    const commonContentWords = contentWordsA.filter((word) => contentWordsB.includes(word));
    const contentSimilarity = commonContentWords.length / Math.max(contentWordsA.length, contentWordsB.length, 1);
    similarity += contentSimilarity * 0.3;
    return Math.min(similarity, 1);
}
function generateSimilarityReasons(taskA, taskB, similarity, sharedLabels) {
    const reasons = [];
    if (similarity > 0.7) {
        reasons.push('Very high similarity - consider consolidation');
    }
    else if (similarity > 0.4) {
        reasons.push('Moderate similarity - review for potential overlap');
    }
    if (sharedLabels.length > 0) {
        reasons.push(`Shared labels: ${sharedLabels.join(', ')}`);
    }
    // Check for similar keywords
    const keywordsA = new Set(taskA.title.toLowerCase().split(/\s+/));
    const keywordsB = new Set(taskB.title.toLowerCase().split(/\s+/));
    const commonKeywords = [...keywordsA].filter(k => keywordsB.has(k));
    if (commonKeywords.length > 1) {
        reasons.push(`Common keywords: ${commonKeywords.join(', ')}`);
    }
    return reasons;
}
export async function suggestTaskBreakdown(taskUuid, tasksPath = 'docs/agile/tasks') {
    logger.info(`Analyzing task ${taskUuid} for breakdown opportunities...`);
    try {
        // Find task file
        const taskTitle = await findTaskTitle(taskUuid);
        if (!taskTitle) {
            throw new Error(`Task ${taskUuid} not found`);
        }
        const taskFile = path.join(tasksPath, `${taskTitle}.md`);
        const content = readFileSync(taskFile, 'utf-8');
        const parsed = matter(content);
        const taskContent = parsed.content;
        const subtasks = extractSubtasks(taskContent, taskTitle);
        return {
            originalTask: {
                uuid: taskUuid,
                title: taskTitle,
                priority: parsed.data.priority || 'P3'
            },
            subtasks,
            breakdownStrategy: determineBreakdownStrategy(taskContent),
            estimatedTotalTime: estimateTotalTime(subtasks)
        };
    }
    catch (error) {
        logger.error(`Failed to breakdown task ${taskUuid}: ${error.message}`);
        throw error;
    }
}
async function findTaskTitle(taskUuid) {
    const boardContent = readFileSync('docs/agile/boards/generated.md', 'utf-8');
    const safeUuid = escapeRegExp(taskUuid);
    const taskMatch = boardContent.match(new RegExp(`\\(uuid:${safeUuid}\\)`, 'm'));
    if (!taskMatch)
        return null;
    // Find the task title from the same line
    const line = boardContent.substring(0, taskMatch.index).split('\n').pop();
    if (!line)
        return null;
    // Extract title from wikilink format: [[title|display text]]
    const wikilinkMatch = line.match(/\[\[([^\|\]]+)/);
    return wikilinkMatch ? (wikilinkMatch[1] || null) : null;
}
function extractSubtasks(content, parentTitle) {
    const subtasks = [];
    // Look for bullet points, numbered lists, or explicit subtask indicators
    const lines = content.split('\n');
    let currentSection = '';
    for (const line of lines) {
        const trimmed = line.trim();
        // Section headers
        if (trimmed.startsWith('#') || trimmed.startsWith('Scope:') || trimmed.startsWith('Exit Criteria:')) {
            currentSection = trimmed;
            continue;
        }
        // List items
        if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
            const title = trimmed.replace(/^[-*\d.]\s+/, '');
            // Determine complexity based on language patterns
            let complexity = 'medium';
            if (title.includes('simple') || title.includes('basic') || title.includes('minor')) {
                complexity = 'low';
            }
            else if (title.includes('complex') || title.includes('major') || title.includes('refactor')) {
                complexity = 'high';
            }
            subtasks.push({
                title,
                description: `From ${parentTitle} - ${currentSection}`,
                estimatedComplexity: complexity,
                suggestedPriority: 'P3', // Default, could be refined
                dependencies: [] // Could be enhanced with dependency detection
            });
        }
    }
    // If no explicit subtasks found, suggest breaking down by section
    if (subtasks.length === 0) {
        const sections = ['Research', 'Implementation', 'Testing', 'Documentation'];
        for (const section of sections) {
            subtasks.push({
                title: `${section} for ${parentTitle}`,
                description: `Break down ${parentTitle} by ${section.toLowerCase()} phase`,
                estimatedComplexity: 'medium',
                suggestedPriority: 'P3',
                dependencies: []
            });
        }
    }
    return subtasks;
}
function determineBreakdownStrategy(content) {
    if (content.includes('Exit Criteria') || content.includes('Scope')) {
        return 'Formal breakdown - task has clear scope and exit criteria';
    }
    else if (content.includes('#') && content.split('\n').filter(line => line.trim().startsWith('#')).length > 1) {
        return 'Section-based breakdown - task has multiple distinct sections';
    }
    else if (content.includes('-') || content.includes('*')) {
        return 'List-based breakdown - task already contains subtask hints';
    }
    else {
        return 'Generic breakdown - create standard phases (research, implement, test, document)';
    }
}
function estimateTotalTime(subtasks) {
    const complexityHours = {
        low: 4,
        medium: 16,
        high: 40
    };
    const totalHours = subtasks.reduce((sum, subtask) => {
        return sum + complexityHours[subtask.estimatedComplexity];
    }, 0);
    if (totalHours < 8) {
        return `${Math.ceil(totalHours)} hours`;
    }
    else {
        return `${Math.ceil(totalHours / 8)} days`;
    }
}
export async function prioritizeTasks(taskUuids, criteria = {}) {
    logger.info(`Prioritizing ${taskUuids.length} tasks...`);
    const weights = {
        businessValue: criteria.businessValueWeight || 0.3,
        complexity: criteria.complexityWeight || 0.2,
        dependencies: criteria.dependenciesWeight || 0.2,
        risk: criteria.riskWeight || 0.15,
        strategicAlignment: criteria.strategicWeight || 0.15
    };
    const priorities = [];
    for (const uuid of taskUuids) {
        const taskTitle = await findTaskTitle(uuid);
        if (!taskTitle)
            continue;
        try {
            const taskFile = path.join('docs/agile/tasks', `${taskTitle}.md`);
            const content = readFileSync(taskFile, 'utf-8');
            const parsed = matter(content);
            const factors = calculatePriorityFactors(content, parsed.data);
            const priorityScore = calculatePriorityScore(factors, weights);
            const suggestedPriority = suggestPriority(priorityScore);
            const currentPriority = parsed.data.priority || 'P3';
            priorities.push({
                uuid,
                title: taskTitle,
                currentPriority,
                suggestedPriority,
                priorityScore,
                factors,
                reasoning: generatePriorityReasoning(factors, suggestedPriority)
            });
        }
        catch (error) {
            logger.warn(`Could not analyze task ${uuid}: ${error.message}`);
        }
    }
    // Sort by priority score (highest first)
    priorities.sort((a, b) => b.priorityScore - a.priorityScore);
    logger.info(`Prioritized ${priorities.length} tasks`);
    return priorities;
}
function calculatePriorityFactors(content, frontmatter) {
    return {
        businessValue: calculateBusinessValue(content, frontmatter),
        complexity: calculateComplexity(content),
        dependencies: calculateDependencies(content),
        risk: calculateRisk(content),
        strategicAlignment: calculateStrategicAlignment(content)
    };
}
function calculateBusinessValue(content, frontmatter) {
    let score = 0.5; // Base score
    const valueKeywords = ['value', 'benefit', 'improve', 'enable', 'reduce', 'increase', 'optimize'];
    const contentLower = content.toLowerCase();
    const keywordMatches = valueKeywords.filter(keyword => contentLower.includes(keyword)).length;
    score += keywordMatches * 0.1;
    // Check priority
    if (frontmatter.priority === 'P0')
        score += 0.4;
    else if (frontmatter.priority === 'P1')
        score += 0.3;
    else if (frontmatter.priority === 'P2')
        score += 0.2;
    return Math.min(score, 1);
}
function calculateComplexity(content) {
    let complexity = 0.5; // Base complexity
    const complexityKeywords = ['complex', 'difficult', 'challenge', 'refactor', 'architecture'];
    const contentLower = content.toLowerCase();
    const keywordMatches = complexityKeywords.filter(keyword => contentLower.includes(keyword)).length;
    complexity += keywordMatches * 0.1;
    // Check for scope indicators
    if (content.includes('Scope:') && content.split('\n').filter(line => line.trim().startsWith('-')).length > 5) {
        complexity += 0.2;
    }
    return Math.min(complexity, 1);
}
function calculateDependencies(content) {
    let dependencies = 0.2; // Base dependency score
    const depKeywords = ['depends', 'requires', 'needs', 'prerequisite'];
    const contentLower = content.toLowerCase();
    const keywordMatches = depKeywords.filter(keyword => contentLower.includes(keyword)).length;
    dependencies += keywordMatches * 0.1;
    // More dependencies = higher score (more critical to resolve)
    return Math.min(dependencies, 1);
}
function calculateRisk(content) {
    let risk = 0.3; // Base risk
    const riskKeywords = ['risk', 'danger', 'breaking', 'critical', 'urgent'];
    const contentLower = content.toLowerCase();
    const keywordMatches = riskKeywords.filter(keyword => contentLower.includes(keyword)).length;
    risk += keywordMatches * 0.15;
    return Math.min(risk, 1);
}
function calculateStrategicAlignment(content) {
    let alignment = 0.4; // Base alignment
    const strategicKeywords = ['strategy', 'goal', 'objective', 'roadmap', 'vision'];
    const contentLower = content.toLowerCase();
    const keywordMatches = strategicKeywords.filter(keyword => contentLower.includes(keyword)).length;
    alignment += keywordMatches * 0.1;
    // Check if task has clear goals
    if (content.includes('Goal:') || content.includes('Objective:')) {
        alignment += 0.2;
    }
    return Math.min(alignment, 1);
}
function calculatePriorityScore(factors, weights) {
    return (factors.businessValue * weights.businessValue +
        factors.complexity * weights.complexity +
        factors.dependencies * weights.dependencies +
        factors.risk * weights.risk +
        factors.strategicAlignment * weights.strategicAlignment);
}
function suggestPriority(score) {
    if (score >= 0.8)
        return 'P0';
    if (score >= 0.6)
        return 'P1';
    if (score >= 0.4)
        return 'P2';
    return 'P3';
}
function generatePriorityReasoning(factors, suggestedPriority) {
    const reasons = [];
    if (factors.businessValue > 0.7) {
        reasons.push('High business value');
    }
    if (factors.complexity > 0.7) {
        reasons.push('High complexity - may block other work');
    }
    if (factors.dependencies > 0.6) {
        reasons.push('Many dependencies - critical path');
    }
    if (factors.risk > 0.6) {
        reasons.push('High risk - requires attention');
    }
    if (factors.strategicAlignment > 0.7) {
        reasons.push('Strong strategic alignment');
    }
    return reasons.length > 0 ? reasons.join('; ') : `Priority ${suggestedPriority} based on overall assessment`;
}
// CLI interface - disabled for now due to TypeScript compatibility issues
/*
if (import.meta.main) {
  const args = parseArgs({
    '--compare': '',
    '--breakdown': '',
    '--prioritize': '',
    '--tasks-path': 'docs/agile/tasks',
    '--board-path': 'docs/agile/boards/generated.md'
  });

  if (args['--compare']) {
    const taskUuids = args['--compare'].split(',');
    const comparisons = await compareTasks(taskUuids, args['--board-path'], args['--tasks-path']);
    console.log(JSON.stringify(comparisons, null, 2));
  } else if (args['--breakdown']) {
    const breakdown = await suggestTaskBreakdown(args['--breakdown'], args['--tasks-path']);
    console.log(JSON.stringify(breakdown, null, 2));
  } else if (args['--prioritize']) {
    const taskUuids = args['--prioritize'].split(',');
    const priorities = await prioritizeTasks(taskUuids, {});
    console.log(JSON.stringify(priorities, null, 2));
  } else {
    console.log('Usage: task-tools --compare UUID1,UUID2 | --breakdown UUID | --prioritize UUID1,UUID2,UUID3');
  }
}
*/ 
//# sourceMappingURL=task-tools.js.map