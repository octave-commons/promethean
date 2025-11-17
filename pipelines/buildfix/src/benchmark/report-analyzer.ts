#!/usr/bin/env tsx

import { readFile, writeFile } from 'fs/promises';
import { parseArgs } from 'util';

interface BenchmarkResult {
  fixture: string;
  model: string;
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  planGenerated: boolean;
  duration: number;
  attempts: number;
  planTitle?: string;
  errorMessage?: string;
}

interface BenchmarkReport {
  results: BenchmarkResult[];
  summary: {
    totalTests: number;
    successfulTests: number;
    errorsResolved: number;
    averageDuration: number;
    modelResults: Record<
      string,
      {
        successRate: number;
        errorResolution: number;
        avgDuration: number;
        totalErrors: number;
        errorsFixed: number;
      }
    >;
  };
  timestamp: string;
}

interface AnalysisInsights {
  keyFindings: string[];
  recommendations: string[];
  performanceAnalysis: string[];
  failurePatterns: string[];
  nextSteps: string[];
}

class ReportAnalyzer {
  private ollamaModel: string = 'qwen3:8b';

  async analyzeReport(reportPath: string): Promise<AnalysisInsights> {
    console.log(`📊 Loading benchmark report from: ${reportPath}`);

    const reportData = await readFile(reportPath, 'utf-8');
    const report: BenchmarkReport = JSON.parse(reportData);

    console.log(`🔍 Analyzing ${report.results.length} test results...`);

    const analysisPrompt = this.buildAnalysisPrompt(report);
    const insights = await this.generateInsights(analysisPrompt);

    return insights;
  }

  private buildAnalysisPrompt(report: BenchmarkReport): string {
    const { results, summary, timestamp } = report;

    return `
You are an expert TypeScript performance analyst. Analyze this BuildFix benchmark report and provide actionable insights.

## Benchmark Data

**Timestamp**: ${timestamp}
**Total Tests**: ${summary.totalTests}
**Success Rate**: ${((summary.successfulTests / summary.totalTests) * 100).toFixed(1)}%
**Error Resolution Rate**: ${((summary.errorsResolved / summary.totalTests) * 100).toFixed(1)}%
**Average Duration**: ${summary.averageDuration.toFixed(2)}s

### Model Performance
${Object.entries(summary.modelResults)
  .map(
    ([model, stats]) => `
**${model}**:
- Success Rate: ${stats.successRate.toFixed(1)}%
- Error Resolution: ${stats.errorResolution.toFixed(1)}%
- Avg Duration: ${stats.avgDuration.toFixed(2)}s
- Errors Fixed: ${stats.errorsFixed}/${stats.totalErrors}
`,
  )
  .join('\n')}

### Detailed Results
${results
  .map(
    (r) => `
**${r.fixture}** (${r.model}):
- Status: ${r.success ? 'SUCCESS' : 'FAILED'}
- Errors: ${r.errorCountBefore} → ${r.errorCountAfter}
- Duration: ${(r.duration / 1000).toFixed(2)}s
- Attempts: ${r.attempts}
- Plan Generated: ${r.planGenerated ? 'Yes' : 'No'}
${r.planTitle ? `- Plan: ${r.planTitle}` : ''}
${r.errorMessage ? `- Error: ${r.errorMessage}` : ''}
`,
  )
  .join('\n')}

## Analysis Requirements

Provide a comprehensive analysis covering:

1. **Key Findings**: What are the most important takeaways from this benchmark?
2. **Performance Analysis**: How well is the system performing? What are the bottlenecks?
3. **Failure Patterns**: Are there common patterns in the failures? Which error types are problematic?
4. **Recommendations**: What specific actions should be taken to improve performance?
5. **Next Steps**: What should be prioritized for future development?

Format your response as a JSON object with the following structure:
{
  "keyFindings": ["finding 1", "finding 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "performanceAnalysis": ["analysis 1", "analysis 2", ...],
  "failurePatterns": ["pattern 1", "pattern 2", ...],
  "nextSteps": ["step 1", "step 2", ...]
}

Be specific, actionable, and focus on practical improvements. Consider both technical and process-related insights.
`;
  }

  private async generateInsights(prompt: string): Promise<AnalysisInsights> {
    try {
      console.log(`🤖 Generating insights using ${this.ollamaModel}...`);

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 2000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const llmResponse = data.response;

      // Extract JSON from the response
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const insights: AnalysisInsights = JSON.parse(jsonMatch[0]);
      return insights;
    } catch (error) {
      console.error('❌ Failed to generate insights:', error);

      // Fallback to basic analysis
      return this.generateFallbackAnalysis();
    }
  }

  private generateFallbackAnalysis(): AnalysisInsights {
    return {
      keyFindings: [
        'LLM analysis unavailable - using fallback mode',
        'System completed benchmark execution',
        'Cache system is operational',
      ],
      recommendations: [
        'Check Ollama service connectivity',
        'Verify model availability',
        'Review system logs for errors',
      ],
      performanceAnalysis: [
        'Unable to analyze performance without LLM',
        'Manual review of benchmark data recommended',
      ],
      failurePatterns: ['Analysis unavailable - check LLM service'],
      nextSteps: ['Restore LLM connectivity', 'Re-run analysis when service is available'],
    };
  }

  async generateAnalysisReport(reportPath: string, insights: AnalysisInsights): Promise<string> {
    const reportData = await readFile(reportPath, 'utf-8');
    const report: BenchmarkReport = JSON.parse(reportData);

    const lines: string[] = [];

    lines.push('# BuildFix Benchmark Analysis Report');
    lines.push('');
    lines.push('## 🤖 AI-Generated Insights');
    lines.push('');
    lines.push(`**Analysis Timestamp**: ${new Date().toISOString()}`);
    lines.push(`**Original Benchmark**: ${report.timestamp}`);
    lines.push(`**Analysis Model**: ${this.ollamaModel}`);
    lines.push('');

    lines.push('## 📊 Key Findings');
    lines.push('');
    insights.keyFindings.forEach((finding) => {
      lines.push(`- ${finding}`);
    });
    lines.push('');

    lines.push('## 🎯 Performance Analysis');
    lines.push('');
    insights.performanceAnalysis.forEach((analysis) => {
      lines.push(`- ${analysis}`);
    });
    lines.push('');

    lines.push('## 🔍 Failure Patterns');
    lines.push('');
    insights.failurePatterns.forEach((pattern) => {
      lines.push(`- ${pattern}`);
    });
    lines.push('');

    lines.push('## 💡 Recommendations');
    lines.push('');
    insights.recommendations.forEach((rec) => {
      lines.push(`- ${rec}`);
    });
    lines.push('');

    lines.push('## 🚀 Next Steps');
    lines.push('');
    insights.nextSteps.forEach((step) => {
      lines.push(`- ${step}`);
    });
    lines.push('');

    lines.push('## 📋 Original Benchmark Summary');
    lines.push('');
    lines.push(`- **Total Tests**: ${report.summary.totalTests}`);
    lines.push(
      `- **Success Rate**: ${((report.summary.successfulTests / report.summary.totalTests) * 100).toFixed(1)}%`,
    );
    lines.push(
      `- **Error Resolution Rate**: ${((report.summary.errorsResolved / report.summary.totalTests) * 100).toFixed(1)}%`,
    );
    lines.push(`- **Average Duration**: ${report.summary.averageDuration.toFixed(2)}s`);
    lines.push('');

    lines.push('### Model Performance Breakdown');
    lines.push('');
    Object.entries(report.summary.modelResults).forEach(([model, stats]) => {
      lines.push(`#### ${model}`);
      lines.push(`- Success Rate: ${stats.successRate.toFixed(1)}%`);
      lines.push(`- Error Resolution: ${stats.errorResolution.toFixed(1)}%`);
      lines.push(`- Average Duration: ${stats.avgDuration.toFixed(2)}s`);
      lines.push(`- Errors Fixed: ${stats.errorsFixed}/${stats.totalErrors}`);
      lines.push('');
    });

    lines.push('---');
    lines.push('*Generated by BuildFix Report Analyzer*');

    return lines.join('\n');
  }

  async analyzeAndSave(reportPath: string, outputPath?: string): Promise<void> {
    try {
      const insights = await this.analyzeReport(reportPath);
      const analysisReport = await this.generateAnalysisReport(reportPath, insights);

      const defaultOutputPath = reportPath.replace('.json', '-analysis.md');
      const finalOutputPath = outputPath || defaultOutputPath;

      await writeFile(finalOutputPath, analysisReport);

      console.log(`✅ Analysis complete! Report saved to: ${finalOutputPath}`);
      console.log(`📊 Key findings: ${insights.keyFindings.length}`);
      console.log(`💡 Recommendations: ${insights.recommendations.length}`);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    }
  }
}

async function main() {
  try {
    const args = parseArgs({
      args: process.argv.slice(2),
      options: {
        report: { type: 'string' },
        output: { type: 'string' },
        model: { type: 'string' },
        help: { type: 'boolean' },
      },
    });

    if (args.values.help || !args.values.report) {
      console.log(`
BuildFix Report Analyzer

Usage: tsx report-analyzer.ts --report <path> [options]

Options:
  --report <path>       Path to benchmark JSON report (required)
  --output <path>       Output path for analysis report (optional)
  --model <model>       Ollama model to use for analysis (default: qwen3:8b)
  --help                Show this help message

Examples:
  tsx report-analyzer.ts --report memoized-benchmark-results-2025-10-15T06-37-58.json
  tsx report-analyzer.ts --report results.json --output analysis.md --model qwen3:14b
      `);
      process.exit(0);
    }

    const analyzer = new ReportAnalyzer();

    if (args.values.model) {
      (analyzer as any).ollamaModel = args.values.model;
    }

    await analyzer.analyzeAndSave(args.values.report, args.values.output);
  } catch (error) {
    console.error('❌ Report analyzer failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
