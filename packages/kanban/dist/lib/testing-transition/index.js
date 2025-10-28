import { promises as fs } from 'node:fs';
import path from 'node:path';
import { analyzeCoverage } from './coverage-analyzer.js';
import { calculateQualityScore, analyzeTestQuality } from './quality-scorer.js';
import { mapRequirements, validateMappings } from './requirement-mapper.js';
import { analyzeWithAI } from './ai-analyzer.js';
import { generateReport } from './report-generator.js';
import { ComprehensiveScorer, defaultScorer } from './comprehensive-scorer.js';
import { runPantheonComputation } from '../pantheon/runtime.js';
/**
 * Enhanced main orchestrator for testing→review transition validation with comprehensive scoring
 */
export async function runComprehensiveTestingTransition(reportReq, executedTests, initialMappings, config, testFiles, outputDir, performanceMetrics) {
    // Step 1: Coverage analysis
    const coverage = await analyzeCoverage(reportReq);
    // Step 2: Signal metrics
    const signalMetrics = await computeTestSignalMetrics({
        testFiles,
        executedTests,
        coverageResult: coverage,
        performanceMetrics,
    });
    // Step 3: Quality scoring
    const qualityScore = calculateQualityScore({
        complexity: signalMetrics.complexity,
        passRate: signalMetrics.passRate,
        flakiness: signalMetrics.flakiness,
        assertionQuality: 85, // Default assertion quality
        edgeCaseCoverage: 75, // Default edge case coverage
        mockQuality: 80, // Default mock quality
        testDuplication: 10, // Low duplication default
        maintainabilityIndex: 85, // Good maintainability default
    });
    // Step 4: Requirement mapping validation
    const mapped = mapRequirements(initialMappings, executedTests);
    // Step 5: AI analysis
    const aiReq = {
        tests: testFiles,
        coverageResult: coverage,
        qualityScore,
        mappings: mapped,
    };
    const aiAnalysis = await analyzeWithAI(aiReq);
    // Step 6: Comprehensive scoring
    const scorer = config.scoring?.enabled
        ? new ComprehensiveScorer(config.scoring?.weights, config.scoring?.priorityThresholds)
        : defaultScorer;
    const scoreResult = await scorer.calculateScore({
        task: reportReq.task,
        coverage,
        quality: qualityScore,
        requirementMappings: mapped,
        aiAnalysis,
        performanceMetrics,
    });
    // Step 7: Check against thresholds
    if (!scoreResult.meetsThreshold) {
        const blockMessage = generateTestBlockMessage(scoreResult);
        throw new Error(blockMessage);
    }
    // Step 8: Generate report
    const reportPath = generateReport({ coverage, qualityScore, mappings: mapped, aiAnalysis, scoreResult }, outputDir);
    return { reportPath, scoreResult };
}
/**
 * Legacy main orchestrator for backward compatibility
 */
export async function runTestingTransition(reportReq, executedTests, initialMappings, config, testFiles, outputDir) {
    // Step 1: Coverage analysis
    const coverage = await analyzeCoverage(reportReq);
    // Hard block check
    if (coverage.totalCoverage < config.hardBlockCoverageThreshold) {
        throw new Error(`Coverage threshold not met: ${coverage.totalCoverage}% < ${config.hardBlockCoverageThreshold}%`);
    }
    // Step 2: Signal metrics
    const signalMetrics = await computeTestSignalMetrics({
        testFiles,
        executedTests,
        coverageResult: coverage,
    });
    // Step 3: Quality scoring
    const qualityScore = calculateQualityScore({
        complexity: signalMetrics.complexity,
        passRate: signalMetrics.passRate,
        flakiness: signalMetrics.flakiness,
        assertionQuality: 85, // Default assertion quality
        edgeCaseCoverage: 75, // Default edge case coverage
        mockQuality: 80, // Default mock quality
        testDuplication: 10, // Low duplication default
        maintainabilityIndex: 85, // Good maintainability default
    });
    if (qualityScore.score < config.softBlockQualityScoreThreshold) {
        throw new Error(`Quality score below threshold: ${qualityScore.score} < ${config.softBlockQualityScoreThreshold}`);
    }
    // Step 4: Requirement mapping validation
    const mapped = mapRequirements(initialMappings, executedTests);
    if (!validateMappings(mapped)) {
        throw new Error('Not all requirements are covered by tests');
    }
    // Step 5: AI analysis
    const aiReq = {
        tests: testFiles,
        coverageResult: coverage,
        qualityScore,
        mappings: mapped,
    };
    const aiAnalysis = await analyzeWithAI(aiReq);
    // Step 6: Generate report
    const reportPath = generateReport({ coverage, qualityScore, mappings: mapped, aiAnalysis }, outputDir);
    return reportPath;
}
// Helper function to generate test block messages
function generateTestBlockMessage(scoreResult) {
    const componentEntries = Object.entries(scoreResult.componentScores);
    const gaps = componentEntries
        .filter(([, cs]) => cs.score < 80)
        .map(([name, cs]) => `${name}: ${cs.score.toFixed(1)}% (threshold: 80%)`)
        .join(', ');
    const message = `Testing transition blocked. Overall score: ${scoreResult.totalScore}/100 (threshold: ${scoreResult.threshold}). Gaps: ${gaps}`;
    if (scoreResult.actionItems.length > 0) {
        const highPriorityActions = scoreResult.actionItems
            .filter((item) => item.priority === 'high')
            .map((item) => item.description)
            .slice(0, 3)
            .join('; ');
        return `${message}. Priority actions: ${highPriorityActions}`;
    }
    return message;
}
// Placeholder implementations for complexity, pass rate, flakiness
async function computeTestSignalMetrics(request) {
    return runPantheonComputation({
        actorName: 'testing-signal-analyst',
        goal: 'analyze test signal metrics for transition gating',
        request,
        compute: async ({ request: payload }) => {
            if (!payload) {
                throw new Error('Test signal payload missing');
            }
            const { testFiles, executedTests, coverageResult, performanceMetrics } = payload;
            const resolvedFiles = await Promise.all(testFiles.map(async (file) => {
                const resolved = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
                try {
                    const content = await fs.readFile(resolved, 'utf8');
                    return { content, path: resolved };
                }
                catch {
                    return null;
                }
            }));
            const qualityMetrics = resolvedFiles
                .filter((entry) => entry !== null)
                .map((entry) => analyzeTestQuality(entry.content));
            const complexity = qualityMetrics.length > 0
                ? Number((qualityMetrics.reduce((sum, metric) => sum + metric.complexity, 0) /
                    qualityMetrics.length).toFixed(2))
                : 1;
            const executedCount = executedTests.length;
            const baselinePass = coverageResult.meetsThreshold ? 96 : Math.max(60, 92 - coverageResult.coverageGap);
            let passRate = baselinePass;
            if (performanceMetrics?.testCount && performanceMetrics.testCount > 0) {
                const ratio = Math.min(1, executedCount / performanceMetrics.testCount);
                passRate = Math.round(Math.max(baselinePass, ratio * 100));
            }
            else if (executedCount > 0 && testFiles.length > 0) {
                const ratio = Math.min(1, executedCount / testFiles.length);
                passRate = Math.round(Math.max(baselinePass, ratio * 100));
            }
            passRate = Math.min(100, Math.max(0, passRate));
            const flakinessBase = coverageResult.meetsThreshold ? 5 : 15 + coverageResult.coverageGap * 2;
            const derivedFlakiness = Math.max(0, 100 - passRate - 10);
            const flakiness = Math.round(Math.min(100, Math.max(flakinessBase, derivedFlakiness)));
            return {
                complexity,
                passRate,
                flakiness,
            };
        },
    });
}
//# sourceMappingURL=index.js.map