import { runPantheonComputation } from '../pantheon/runtime.js';
/**
 * Perform AI-powered analysis of the test suite using a Pantheon micro-actor.
 */
export async function analyzeWithAI(request) {
    return runPantheonComputation({
        actorName: 'testing-transition-analyst',
        goal: 'generate testing transition insights',
        request,
        compute: async ({ request: req }) => {
            if (!req) {
                throw new Error('Testing transition analysis requires a request payload');
            }
            return computeAnalysis(req);
        },
    });
}
function computeAnalysis(request) {
    const coveredRequirements = request.mappings.filter((mapping) => mapping.isCovered).length;
    const totalRequirements = request.mappings.length || 1;
    const uncoveredRequirements = totalRequirements - coveredRequirements;
    const coverageScore = request.coverageResult.totalCoverage;
    const qualityScore = request.qualityScore.score;
    const mappingScore = (coveredRequirements / totalRequirements) * 100;
    const passRateValue = request.qualityScore.details?.passRate;
    const formattedPassRate = typeof passRateValue === 'number' ? `${passRateValue.toFixed(1)}%` : 'unknown';
    const insights = [
        `Coverage remains at ${coverageScore.toFixed(1)}% across ${Object.keys(request.coverageResult.fileCoverage).length} files.`,
        `Aggregate test quality scored ${qualityScore.toFixed(1)}/100 with ${formattedPassRate} pass rate.`,
        uncoveredRequirements === 0
            ? 'All tracked requirements currently have at least one validating test.'
            : `${uncoveredRequirements} requirement${uncoveredRequirements === 1 ? '' : 's'} still lack dedicated coverage.`,
    ];
    const recommendations = buildRecommendations({
        coverageScore,
        qualityScore,
        mappingScore,
        uncoveredRequirements,
        request,
    });
    const overallScore = Math.round(coverageScore * 0.4 + qualityScore * 0.4 + mappingScore * 0.2);
    return {
        insights,
        recommendations,
        overallScore,
    };
}
function buildRecommendations(params) {
    const { coverageScore, qualityScore, mappingScore, uncoveredRequirements, request } = params;
    const recommendations = new Set();
    if (coverageScore < 92) {
        const gap = Math.max(0, 92 - coverageScore).toFixed(1);
        recommendations.add(`Raise coverage by ${gap}% to satisfy the 92% reliability gate.`);
    }
    if (qualityScore < 80) {
        const detail = request.qualityScore.details;
        if (detail?.assertionQuality && detail.assertionQuality < 80) {
            recommendations.add('Tighten assertion quality to reduce false positives and improve signal.');
        }
        if (detail?.flakiness && detail.flakiness > 10) {
            recommendations.add('Stabilize flaky tests by addressing identified timing or dependency issues.');
        }
        recommendations.add('Audit recent test additions for maintainability and naming clarity.');
    }
    if (mappingScore < 100) {
        recommendations.add('Map remaining product requirements to executable tests before moving to review.');
    }
    if (uncoveredRequirements > 0) {
        const topGap = request.mappings.find((mapping) => !mapping.isCovered);
        if (topGap?.requirementId) {
            recommendations.add(`Author at least one regression test covering requirement ${topGap.requirementId}.`);
        }
    }
    if (Object.values(request.coverageResult.uncoveredLines).some((lines) => lines.length > 0)) {
        recommendations.add('Review uncovered changed lines and add targeted assertions for new behaviors.');
    }
    if (recommendations.size === 0) {
        recommendations.add('All testing indicators are healthy. Proceed to review with confidence.');
    }
    return Array.from(recommendations);
}
//# sourceMappingURL=ai-analyzer.js.map