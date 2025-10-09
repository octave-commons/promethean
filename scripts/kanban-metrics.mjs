#!/usr/bin/env node

/**
 * Kanban Metrics & Monitoring System
 * Tracks optimization progress and generates reports
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class KanbanMetrics {
  constructor(boardPath = 'docs/agile/boards/generated.md') {
    this.boardPath = boardPath;
    this.metrics = {
      timestamp: new Date().toISOString(),
      columns: {},
      priorities: {},
      wipCompliance: {},
      testingBottleneck: {},
      automationCoverage: {},
      flowEfficiency: {}
    };
  }

  async analyzeBoard() {
    try {
      const boardContent = fs.readFileSync(this.boardPath, 'utf-8');
      
      // Parse kanban board structure
      await this.parseColumns(boardContent);
      await this.calculateWIPCompliance();
      await this.analyzeTestingBottleneck();
      await this.calculateFlowEfficiency();
      await this.estimateAutomationCoverage();
      
      return this.metrics;
    } catch (error) {
      console.error('Error analyzing kanban board:', error.message);
      return null;
    }
  }

  async parseColumns(content) {
    // Extract task counts from each column
    const columnPattern = /## (.*?) \((\d+) tasks?\)/g;
    let match;
    
    while ((match = columnPattern.exec(content)) !== null) {
      const columnName = match[1].trim();
      const taskCount = parseInt(match[2]);
      this.metrics.columns[columnName] = taskCount;
    }

    // WIP limits reference
    const wipLimits = {
      'ready': 10,
      'todo': 20,
      'in_progress': 10,
      'testing': 8,
      'review': 6,
      'document': 4
    };

    this.metrics.wipLimits = wipLimits;
  }

  async calculateWIPCompliance() {
    const { columns, wipLimits } = this.metrics;
    
    Object.entries(wipLimits).forEach(([column, limit]) => {
      const current = columns[column] || 0;
      const compliance = current <= limit ? 'compliant' : 'violated';
      const overload = Math.max(0, current - limit);
      
      this.metrics.wipCompliance[column] = {
        current,
        limit,
        compliance,
        overload,
        complianceRate: Math.min(100, (limit / Math.max(1, current)) * 100)
      };
    });
  }

  async analyzeTestingBottleneck() {
    const { columns, wipCompliance } = this.metrics;
    const testingColumn = columns['testing'] || 0;
    const testingWIP = wipCompliance['testing'] || {};
    
    this.metrics.testingBottleneck = {
      currentTasks: testingColumn,
      wipLimit: testingWIP.limit || 8,
      overloadPercentage: testingWIP.overload ? (testingWIP.overload / (testingWIP.limit || 1)) * 100 : 0,
      status: testingColumn <= (testingWIP.limit || 8) ? 'healthy' : 'critical',
      priority: testingColumn > 16 ? 'critical' : testingColumn > 12 ? 'high' : 'normal'
    };
  }

  async calculateFlowEfficiency() {
    const { columns } = this.metrics;
    
    // Calculate flow efficiency metrics
    const activeWork = (columns['in_progress'] || 0) + (columns['testing'] || 0) + (columns['review'] || 0) + (columns['document'] || 0);
    const totalWork = Object.values(columns).reduce((sum, count) => sum + count, 0);
    const completedWork = columns['done'] || 0;
    
    this.metrics.flowEfficiency = {
      activeWorkRatio: (activeWork / Math.max(1, totalWork)) * 100,
      completionRate: totalWork > 0 ? (completedWork / totalWork) * 100 : 0,
      throughput: completedWork,
      bottleneckIndicators: {
        testingOverload: columns['testing'] > 12,
        reviewOverload: columns['review'] > 6,
        inProgressOverload: columns['in_progress'] > 10
      }
    };
  }

  async estimateAutomationCoverage() {
    // Estimate automation potential based on task patterns
    const { columns } = this.metrics;
    
    // Common automation targets
    const pipelineFixes = this.estimatePatternCount('pipeline', columns);
    const typeFixes = this.estimatePatternCount('typescript', columns);
    const testFixes = this.estimatePatternCount('test', columns);
    const docFixes = this.estimatePatternCount('doc', columns);
    
    const totalAutomatable = pipelineFixes + typeFixes + testFixes + docFixes;
    const totalTasks = Object.values(columns).reduce((sum, count) => sum + count, 0);
    
    this.metrics.automationCoverage = {
      pipelineFixes,
      typeFixes,
      testFixes,
      docFixes,
      totalAutomatable,
      totalTasks,
      coveragePercentage: totalTasks > 0 ? (totalAutomatable / totalTasks) * 100 : 0,
      priorityTasks: {
        high: this.estimateHighPriorityAutomation(columns),
        medium: this.estimateMediumPriorityAutomation(columns),
        low: this.estimateLowPriorityAutomation(columns)
      }
    };
  }

  estimatePatternCount(pattern, columns) {
    // Simple heuristic based on common task patterns
    const patterns = {
      pipeline: 0.25, // 25% of tasks are pipeline-related
      typescript: 0.15, // 15% are TypeScript fixes
      test: 0.20,       // 20% are testing issues
      doc: 0.10          // 10% are documentation fixes
    };
    
    const totalTasks = Object.values(columns).reduce((sum, count) => sum + count, 0);
    return Math.round(totalTasks * (patterns[pattern] || 0));
  }

  estimateHighPriorityAutomation(columns) {
    // P1 tasks that are highly automatable
    const incomingP1 = columns['incoming'] * 0.3; // 30% of incoming are P1
    const readyP1 = columns['ready'] * 0.2;     // 20% of ready are P1
    return Math.round(incomingP1 + readyP1);
  }

  estimateMediumPriorityAutomation(columns) {
    // P2 tasks with good automation potential
    const todoP2 = columns['todo'] * 0.3;
    const readyP2 = columns['ready'] * 0.3;
    return Math.round(todoP2 + readyP2);
  }

  estimateLowPriorityAutomation(columns) {
    // P3 tasks that can be automated when resources available
    const incomingP3 = columns['incoming'] * 0.4;
    const todoP3 = columns['todo'] * 0.4;
    return Math.round(incomingP3 + todoP3);
  }

  generateReport() {
    const { columns, wipCompliance, testingBottleneck, flowEfficiency, automationCoverage } = this.metrics;
    
    const report = [
      '# 📊 Kanban Optimization Metrics Report',
      '',
      `**Generated**: ${new Date().toLocaleString()}`,
      `**Board**: ${this.boardPath}`,
      '',
      '## 📈 Board Overview',
      '',
      '| Column | Tasks | WIP Limit | Status |',
      '|--------|-------|-----------|--------|',
    ];

    Object.entries(columns).forEach(([column, count]) => {
      const wip = wipCompliance[column] || {};
      const status = wip.compliance === 'violated' ? '🔴 OVERLOAD' : wip.compliance === 'compliant' ? '✅ OK' : '⚪ N/A';
      report.push(`| ${column} | ${count} | ${wip.limit || 'N/A'} | ${status} |`);
    });

    report.push('', '## 🚨 Testing Bottleneck Analysis', '');
    
    if (testingBottleneck.status === 'critical') {
      report.push('🔴 **CRITICAL**: Testing column severely overloaded');
      report.push(`- Current: ${testingBottleneck.currentTasks} tasks`);
      report.push(`- Limit: ${testingBottleneck.wipLimit} tasks`);
      report.push(`- Overload: ${testingBottleneck.overloadPercentage.toFixed(1)}%`);
    } else if (testingBottleneck.status === 'high') {
      report.push('🟡 **WARNING**: Testing column approaching overload');
      report.push(`- Current: ${testingBottleneck.currentTasks} tasks`);
      report.push(`- Limit: ${testingBottleneck.wipLimit} tasks`);
    } else {
      report.push('✅ **HEALTHY**: Testing column within limits');
    }

    report.push('', '## 🎯 Flow Efficiency', '');
    report.push(`- **Active Work Ratio**: ${flowEfficiency.activeWorkRatio.toFixed(1)}%`);
    report.push(`- **Completion Rate**: ${flowEfficiency.completionRate.toFixed(1)}%`);
    report.push(`- **Throughput**: ${flowEfficiency.throughput} completed tasks`);
    
    if (flowEfficiency.bottleneckIndicators.testingOverload) {
      report.push('- ⚠️ Testing bottleneck detected');
    }
    if (flowEfficiency.bottleneckIndicators.reviewOverload) {
      report.push('- ⚠️ Review bottleneck detected');
    }

    report.push('', '## 🤖 Automation Opportunities', '');
    report.push(`- **Total Automatable Tasks**: ${automationCoverage.totalAutomatable}`);
    report.push(`- **Automation Coverage**: ${automationCoverage.coveragePercentage.toFixed(1)}%`);
    report.push(`- **High Priority**: ${automationCoverage.priorityTasks.high} tasks`);
    report.push(`- **Medium Priority**: ${automationCoverage.priorityTasks.medium} tasks`);
    report.push(`- **Low Priority**: ${automationCoverage.priorityTasks.low} tasks`);

    report.push('', '## 📊 WIP Compliance Summary', '');
    
    const compliantCount = Object.values(wipCompliance).filter(w => w.compliance === 'compliant').length;
    const totalCount = Object.keys(wipCompliance).length;
    const complianceRate = (compliantCount / totalCount) * 100;
    
    report.push(`- **Overall Compliance**: ${complianceRate.toFixed(1)}%`);
    report.push(`- **Compliant Columns**: ${compliantCount}/${totalCount}`);
    
    const violations = Object.entries(wipCompliance).filter(([_, w]) => w.compliance === 'violated');
    if (violations.length > 0) {
      report.push('', '### 🔴 WIP Violations', '');
      violations.forEach(([column, w]) => {
        report.push(`- **${column}**: ${w.current}/${w.limit} (${w.overload} overload)`);
      });
    }

    report.push('', '## 🎯 Recommendations', '');
    
    if (testingBottleneck.status === 'critical') {
      report.push('1. 🚨 **URGENT**: Address testing bottleneck');
      report.push('   - Deploy test automation framework');
      report.push('   - Move 10+ tasks to automation queue');
      report.push('   - Consider parallel testing resources');
    }

    if (complianceRate < 80) {
      report.push('2. ⚖️ **IMPROVE WIP Compliance**');
      report.push(`   - Current compliance: ${complianceRate.toFixed(1)}%`);
      report.push('   - Enforce WIP limits strictly');
      report.push('   - Move excess tasks to icebox');
    }

    if (automationCoverage.coveragePercentage > 30) {
      report.push('3. 🤖 **SCALE AUTOMATION**');
      report.push(`   - ${automationCoverage.totalAutomatable} tasks automatable`);
      report.push('   - Generate automation tasks in batches');
      report.push('   - Track automation ROI');
    }

    report.push('', '---', `**Report Generated**: ${new Date().toISOString()}`);

    return report.join('\n');
  }

  async saveReport(outputPath = 'docs/agile/reports/kanban-metrics.md') {
    const report = this.generateReport();
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, report, 'utf-8');
    return outputPath;
  }

  printSummary() {
    const { columns, testingBottleneck, flowEfficiency, automationCoverage } = this.metrics;
    
    console.log('\n📊 === KANBAN METRICS SUMMARY ===');
    console.log(`Board Status: ${testingBottleneck.status.toUpperCase()}`);
    console.log(`Testing Queue: ${columns['testing'] || 0} tasks (${testingBottleneck.overloadPercentage.toFixed(1)}% overload)`);
    console.log(`Automation Potential: ${automationCoverage.coveragePercentage.toFixed(1)}% coverage`);
    console.log(`Completion Rate: ${flowEfficiency.completionRate.toFixed(1)}%`);
    console.log('\n🎯 === RECOMMENDATIONS ===');
    
    if (testingBottleneck.status === 'critical') {
      console.log('🚨 1. URGENT: Deploy test automation');
    }
    
    if (automationCoverage.coveragePercentage > 20) {
      console.log('🤖 2. SCALE: Generate automation tasks');
    }
    
    console.log('📈 3. MONITOR: Track progress daily');
    console.log('');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const boardPath = args.find(arg => arg.startsWith('--board='))?.split('=')[1] || 'docs/agile/boards/generated.md';
  const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'docs/agile/reports/kanban-metrics.md';
  const saveReport = !args.includes('--no-save');

  const metrics = new KanbanMetrics(boardPath);
  
  console.log('📊 Analyzing kanban board metrics...');
  
  const analysis = await metrics.analyzeBoard();
  
  if (!analysis) {
    console.error('❌ Failed to analyze board');
    process.exit(1);
  }

  metrics.printSummary();

  if (saveReport) {
    const reportPath = await metrics.saveReport(outputPath);
    console.log(`📄 Report saved: ${reportPath}`);
  }

  // Return metrics for programmatic use
  if (args.includes('--json')) {
    console.log('\n📋 JSON Metrics:');
    console.log(JSON.stringify(metrics.metrics, null, 2));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { KanbanMetrics };