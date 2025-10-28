import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
/**
 * Generate a markdown report and update task frontmatter
 */
export function generateReport(report, outputDir) {
    const reportMd = [];
    reportMd.push('# Test Transition Report');
    reportMd.push('');
    reportMd.push('## Coverage');
    reportMd.push(`- Total Coverage: ${report.coverage.totalCoverage.toFixed(2)}%`);
    Object.entries(report.coverage.fileCoverage).forEach(([file, pct]) => {
        reportMd.push(`  - ${file}: ${pct.toFixed(2)}%`);
    });
    reportMd.push('');
    reportMd.push('## Quality Score');
    reportMd.push(`- Score: ${report.qualityScore.score}`);
    if (report.qualityScore.details) {
        const d = report.qualityScore.details;
        reportMd.push(`  - Complexity: ${d.complexity}`);
        reportMd.push(`  - Pass Rate: ${d.passRate}%`);
        reportMd.push(`  - Flakiness: ${d.flakiness}`);
    }
    reportMd.push('');
    reportMd.push('## Requirements Coverage');
    report.mappings.forEach((m) => {
        reportMd.push(`- ${m.requirementId}: ${m.isCovered ? '✅' : '❌'}`);
    });
    reportMd.push('');
    reportMd.push('## AI Analysis');
    report.aiAnalysis.insights.forEach((ins) => reportMd.push(`- Insight: ${ins}`));
    report.aiAnalysis.recommendations.forEach((rec) => reportMd.push(`- Recommendation: ${rec}`));
    reportMd.push(`- Overall AI Score: ${report.aiAnalysis.overallScore}`);
    // Write markdown file
    const filePath = path.join(outputDir, 'test-transition-report.md');
    fs.writeFileSync(filePath, reportMd.join('\n'));
    // Update task frontmatter if exists in outputDir/index.md
    const taskFile = path.join(outputDir, 'index.md');
    if (fs.existsSync(taskFile)) {
        const content = fs.readFileSync(taskFile, 'utf-8');
        const parts = content.split('---');
        if (parts.length >= 3) {
            const front = yaml.load(parts[1] || '');
            front.testTransition = {
                coverage: report.coverage.totalCoverage,
                quality: report.qualityScore.score,
            };
            const newFront = yaml.dump(front);
            const newContent = ['---', newFront, '---', parts.slice(2).join('---')].join('');
            fs.writeFileSync(taskFile, newContent);
        }
    }
    return filePath;
}
//# sourceMappingURL=report-generator.js.map