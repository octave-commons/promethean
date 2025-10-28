/**
 * Comprehensive scoring engine for testing transition validation
 * Implements weighted scoring algorithm with dynamic thresholds based on task priority
 */
export class ComprehensiveScorer {
    weights;
    priorityThresholds;
    constructor(weights, thresholds) {
        this.weights = {
            coverage: 0.35,
            quality: 0.25,
            requirementMapping: 0.2,
            aiAnalysis: 0.15,
            performance: 0.05,
            ...weights,
        };
        this.priorityThresholds = {
            P0: { coverage: 95, quality: 90, overall: 92 },
            P1: { coverage: 90, quality: 85, overall: 87 },
            P2: { coverage: 85, quality: 80, overall: 82 },
            P3: { coverage: 80, quality: 75, overall: 77 },
            ...thresholds,
        };
    }
    /**
     * Calculate comprehensive score for testing transition
     */
    async calculateScore(params) {
        const { task, coverage, quality, requirementMappings, aiAnalysis, performanceMetrics } = params;
        const priority = this.normalizePriority(task.priority);
        const threshold = this.priorityThresholds[priority];
        // Calculate component scores
        const coverageScore = this.calculateCoverageScore(coverage, threshold.coverage);
        const qualityScore = this.calculateQualityScore(quality, threshold.quality);
        const requirementScore = this.calculateRequirementScore(requirementMappings);
        const aiScore = this.calculateAIAnalysisScore(aiAnalysis);
        const performanceScore = this.calculatePerformanceScore(performanceMetrics);
        const componentScores = {
            coverage: coverageScore,
            quality: qualityScore,
            requirementMapping: requirementScore,
            aiAnalysis: aiScore,
            performance: performanceScore,
        };
        // Calculate weighted total score
        const totalScore = Object.entries(componentScores).reduce((sum, [key, score]) => {
            const weight = this.weights[key];
            return sum + score.score * weight;
        }, 0);
        const meetsThreshold = totalScore >= threshold.overall;
        // Generate recommendations and action items
        const recommendations = this.generateRecommendations(componentScores);
        const actionItems = this.generateActionItems(componentScores);
        const detailedRationale = this.generateDetailedRationale(componentScores);
        return {
            totalScore: Math.round(totalScore),
            componentScores,
            threshold: threshold.overall,
            meetsThreshold,
            priority,
            recommendations,
            actionItems,
            detailedRationale,
        };
    }
    /**
     * Calculate coverage component score
     */
    calculateCoverageScore(coverage, threshold) {
        const score = Math.min(100, coverage.totalCoverage);
        const evidence = [
            `Total coverage: ${coverage.totalCoverage.toFixed(1)}%`,
            `Threshold: ${threshold}%`,
            `Files analyzed: ${Object.keys(coverage.fileCoverage).length}`,
        ];
        const gaps = [];
        const improvements = [];
        if (score < threshold) {
            gaps.push(`Coverage gap: ${(threshold - score).toFixed(1)}%`);
            improvements.push('Add tests for uncovered lines');
        }
        // Find files with low coverage
        const lowCoverageFiles = Object.entries(coverage.fileCoverage)
            .filter(([_, cov]) => cov < threshold)
            .map(([file, cov]) => `${file}: ${cov.toFixed(1)}%`);
        if (lowCoverageFiles.length > 0) {
            gaps.push(`Low coverage files: ${lowCoverageFiles.join(', ')}`);
            improvements.push('Focus on improving coverage in identified files');
        }
        return {
            score,
            weight: this.weights.coverage,
            weightedScore: score * this.weights.coverage,
            evidence,
            gaps,
            improvements,
        };
    }
    /**
     * Calculate quality component score
     */
    calculateQualityScore(quality, threshold) {
        const score = quality.score;
        const evidence = [`Quality score: ${score}/100`, `Threshold: ${threshold}/100`];
        if (quality.details) {
            evidence.push(`Pass rate: ${quality.details.passRate}%`);
            evidence.push(`Complexity: ${quality.details.complexity}`);
            evidence.push(`Flakiness: ${quality.details.flakiness}`);
        }
        const gaps = [];
        const improvements = [];
        if (score < threshold) {
            gaps.push(`Quality gap: ${threshold - score} points`);
        }
        if (quality.details) {
            if (quality.details.passRate < 95) {
                gaps.push(`Low pass rate: ${quality.details.passRate}%`);
                improvements.push('Fix failing tests to improve pass rate');
            }
            if (quality.details.flakiness > 10) {
                gaps.push(`High flakiness: ${quality.details.flakiness}`);
                improvements.push('Address test flakiness through better isolation and deterministic setup');
            }
            if (quality.details.complexity > 5) {
                gaps.push(`High complexity: ${quality.details.complexity}`);
                improvements.push('Simplify test logic and break down complex tests');
            }
        }
        return {
            score,
            weight: this.weights.quality,
            weightedScore: score * this.weights.quality,
            evidence,
            gaps,
            improvements,
        };
    }
    /**
     * Calculate requirement mapping component score
     */
    calculateRequirementScore(mappings) {
        const totalRequirements = mappings.length;
        const coveredRequirements = mappings.filter((m) => m.isCovered).length;
        const score = totalRequirements > 0 ? (coveredRequirements / totalRequirements) * 100 : 100;
        const evidence = [
            `Requirements covered: ${coveredRequirements}/${totalRequirements}`,
            `Coverage percentage: ${score.toFixed(1)}%`,
        ];
        const gaps = [];
        const improvements = [];
        const uncoveredRequirements = mappings.filter((m) => !m.isCovered);
        if (uncoveredRequirements.length > 0) {
            gaps.push(`Uncovered requirements: ${uncoveredRequirements.map((m) => m.requirementId).join(', ')}`);
            improvements.push('Create tests for uncovered requirements');
        }
        return {
            score,
            weight: this.weights.requirementMapping,
            weightedScore: score * this.weights.requirementMapping,
            evidence,
            gaps,
            improvements,
        };
    }
    /**
     * Calculate AI analysis component score
     */
    calculateAIAnalysisScore(aiAnalysis) {
        if (!aiAnalysis) {
            return {
                score: 50, // Neutral score when no AI analysis available
                weight: this.weights.aiAnalysis,
                weightedScore: 50 * this.weights.aiAnalysis,
                evidence: ['No AI analysis available'],
                gaps: ['AI analysis not performed'],
                improvements: ['Enable AI analysis for better insights'],
            };
        }
        const score = Math.min(100, Math.max(0, aiAnalysis.overallScore));
        const evidence = [
            `AI overall score: ${score}/100`,
            `Insights generated: ${aiAnalysis.insights.length}`,
            `Recommendations: ${aiAnalysis.recommendations.length}`,
        ];
        const gaps = [];
        const improvements = [];
        if (score < 80) {
            gaps.push('AI analysis indicates quality concerns');
            improvements.push('Address AI-identified issues');
        }
        return {
            score,
            weight: this.weights.aiAnalysis,
            weightedScore: score * this.weights.aiAnalysis,
            evidence,
            gaps,
            improvements,
        };
    }
    /**
     * Calculate performance component score
     */
    calculatePerformanceScore(performanceMetrics) {
        if (!performanceMetrics) {
            return {
                score: 85, // Assume good performance when no metrics available
                weight: this.weights.performance,
                weightedScore: 85 * this.weights.performance,
                evidence: ['No performance metrics available'],
                gaps: [],
                improvements: ['Consider adding performance testing'],
            };
        }
        // Score based on test execution time and resource usage
        const timeScore = Math.max(0, 100 - (performanceMetrics.averageExecutionTime / 1000) * 10); // Penalize slow tests
        const memoryScore = Math.max(0, 100 - (performanceMetrics.peakMemoryUsage / 100) * 5); // Penalize memory-heavy tests
        const score = (timeScore + memoryScore) / 2;
        const evidence = [
            `Average execution time: ${performanceMetrics.averageExecutionTime}ms`,
            `Peak memory usage: ${performanceMetrics.peakMemoryUsage}MB`,
            `Test count: ${performanceMetrics.testCount}`,
        ];
        const gaps = [];
        const improvements = [];
        if (performanceMetrics.averageExecutionTime > 5000) {
            gaps.push('Slow test execution detected');
            improvements.push('Optimize test performance through better setup/teardown');
        }
        if (performanceMetrics.peakMemoryUsage > 500) {
            gaps.push('High memory usage in tests');
            improvements.push('Optimize memory usage in test fixtures');
        }
        return {
            score,
            weight: this.weights.performance,
            weightedScore: score * this.weights.performance,
            evidence,
            gaps,
            improvements,
        };
    }
    /**
     * Generate recommendations based on component scores
     */
    generateRecommendations(componentScores) {
        const recommendations = [];
        Object.entries(componentScores).forEach(([component, score]) => {
            if (score.score < 80) {
                switch (component) {
                    case 'coverage':
                        recommendations.push('Increase test coverage by targeting uncovered code paths');
                        break;
                    case 'quality':
                        recommendations.push('Improve test quality by reducing complexity and flakiness');
                        break;
                    case 'requirementMapping':
                        recommendations.push('Ensure all requirements have corresponding test coverage');
                        break;
                    case 'aiAnalysis':
                        recommendations.push('Address AI-identified quality concerns and insights');
                        break;
                    case 'performance':
                        recommendations.push('Optimize test execution performance and resource usage');
                        break;
                }
            }
        });
        if (recommendations.length === 0) {
            recommendations.push('All quality gates passed - excellent testing practices!');
        }
        return recommendations;
    }
    /**
     * Generate actionable items for improvement
     */
    generateActionItems(componentScores) {
        const actionItems = [];
        Object.entries(componentScores).forEach(([component, score]) => {
            score.improvements.forEach((improvement) => {
                const priority = score.score < 60 ? 'high' : score.score < 80 ? 'medium' : 'low';
                actionItems.push({
                    type: 'recommendation',
                    description: improvement,
                    priority,
                    estimatedEffort: this.estimateEffort(component, score.score),
                });
            });
        });
        return actionItems.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
    /**
     * Generate detailed rationale for scoring
     */
    generateDetailedRationale(componentScores) {
        const rationale = [];
        Object.entries(componentScores).forEach(([component, score]) => {
            rationale.push({
                component,
                score: score.score,
                evidence: score.evidence,
                reasoning: `${component} score of ${score.score.toFixed(1)} calculated based on ${score.evidence.length} evidence points`,
                improvement: score.improvements.join('; ') || 'No improvements needed',
            });
        });
        return rationale;
    }
    /**
     * Normalize priority string to standard format
     */
    normalizePriority(priority) {
        if (!priority)
            return 'P2';
        const normalized = priority.toUpperCase().trim();
        if (normalized.startsWith('P') && normalized.length === 2) {
            return normalized;
        }
        // Map textual priorities to P-levels
        switch (normalized) {
            case 'CRITICAL':
                return 'P0';
            case 'HIGH':
                return 'P1';
            case 'MEDIUM':
                return 'P2';
            case 'LOW':
                return 'P3';
            default:
                return 'P2';
        }
    }
    /**
     * Estimate effort for improvement based on component and score
     */
    estimateEffort(_component, score) {
        if (score >= 80)
            return '1-2 hours';
        if (score >= 60)
            return '4-8 hours';
        if (score >= 40)
            return '1-2 days';
        return '3-5 days';
    }
}
/**
 * Default scorer instance with standard weights and thresholds
 */
export const defaultScorer = new ComprehensiveScorer();
//# sourceMappingURL=comprehensive-scorer.js.map