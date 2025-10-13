#!/usr/bin/env node

/**
 * Pipeline BuildFix & Automation Tool
 *
 * This script provides automated fixes for common pipeline issues:
 * - Timeout optimization
 * - Cache invalidation
 * - Parallel job configuration
 * - Build performance analysis
 */

import { execSync, spawn } from 'node:child_process';
import { readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PipelineOptimizer {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: '📋',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        fix: '🔧',
      }[type] || '📋';

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkWorkflowFile(filePath) {
    try {
      await access(filePath);
      const content = await readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      this.log(`Workflow file not found: ${filePath}`, 'warning');
      return null;
    }
  }

  analyzeTimeouts(content, filePath) {
    const hasJobTimeout = content.includes('timeout-minutes:');
    const hasServiceTimeouts = content.includes('--health-timeout');

    if (!hasJobTimeout) {
      this.issues.push({
        file: filePath,
        type: 'missing_job_timeout',
        severity: 'high',
        message: 'Missing job-level timeout-minutes',
      });
    }

    if (hasServiceTimeouts && !hasJobTimeout) {
      this.warnings.push({
        file: filePath,
        type: 'service_timeout_only',
        message: 'Has service timeouts but no job timeout',
      });
    }
  }

  analyzeCaching(content, filePath) {
    const hasPnpmCache = content.includes('pnpm-store');
    const hasClojureCache = content.includes('cljdeps');
    const usesCacheV3 = content.includes('uses: actions/cache@v3');
    const usesCacheV4 = content.includes('uses: actions/cache@v4');

    if (usesCacheV3) {
      this.issues.push({
        file: filePath,
        type: 'outdated_cache_version',
        severity: 'medium',
        message: 'Using outdated cache@v3, should use cache@v4',
      });
    }

    if (!hasPnpmCache) {
      this.issues.push({
        file: filePath,
        type: 'missing_pnpm_cache',
        severity: 'medium',
        message: 'Missing pnpm store cache optimization',
      });
    }

    if (!hasClojureCache && content.includes('clojure')) {
      this.issues.push({
        file: filePath,
        type: 'missing_clojure_cache',
        severity: 'medium',
        message: 'Missing Clojure dependency cache',
      });
    }
  }

  analyzeParallelization(content, filePath) {
    const hasNeeds = content.includes('needs:');
    const hasMatrix = content.includes('strategy:');
    const hasParallelFlag = content.includes('--parallel');

    if (!hasNeeds && !hasMatrix && content.includes('jobs:')) {
      this.warnings.push({
        file: filePath,
        type: 'sequential_jobs',
        message: 'Jobs run sequentially, could benefit from parallelization',
      });
    }

    if (content.includes('nx affected') && !hasParallelFlag) {
      this.issues.push({
        file: filePath,
        type: 'missing_nx_parallel',
        severity: 'medium',
        message: 'Nx affected commands should use --parallel flag',
      });
    }
  }

  async analyzeWorkflow(filePath) {
    const content = await this.checkWorkflowFile(filePath);
    if (!content) return;

    this.log(`Analyzing workflow: ${filePath}`);

    this.analyzeTimeouts(content, filePath);
    this.analyzeCaching(content, filePath);
    this.analyzeParallelization(content, filePath);
  }

  generateTimeoutFix(content, jobType = 'build') {
    const timeoutMap = {
      build: '30',
      test: '45',
      'test-unit': '30',
      'test-integration': '45',
      'test-e2e': '60',
      lint: '20',
      coverage: '90',
    };

    const timeout = timeoutMap[jobType] || '30';

    // Find job definitions and add timeout
    return content.replace(/(runs-on: ubuntu-latest\n)/g, `$1    timeout-minutes: ${timeout}\n`);
  }

  generateCacheFix(content) {
    // Upgrade cache version and improve cache keys
    let fixed = content.replace(/uses: actions\/cache@v3/g, 'uses: actions/cache@v4');

    // Improve pnpm cache keys
    fixed = fixed.replace(
      /key: \$\{\{ runner\.os \}\}-pnpm-store-\$\{\{ hashFiles\('\*\*\/pnpm-lock\.yaml'\) \}\}/g,
      "key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml', '**/package.json') }}",
    );

    // Add restore-keys for pnpm
    fixed = fixed.replace(
      /(key: \$\{\{ runner\.os \}\}-pnpm-store-[^\n]+)/g,
      "$1\n          restore-keys: |\n            ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}-\n            ${{ runner.os }}-pnpm-store-",
    );

    return fixed;
  }

  async applyFixes() {
    this.log('Starting automated fixes...', 'fix');

    for (const issue of this.issues) {
      if (issue.severity === 'high') {
        await this.applyFix(issue);
      }
    }
  }

  async applyFix(issue) {
    const content = await this.checkWorkflowFile(issue.file);
    if (!content) return;

    let fixedContent = content;

    switch (issue.type) {
      case 'missing_job_timeout':
        const jobType = this.extractJobType(issue.file);
        fixedContent = this.generateTimeoutFix(content, jobType);
        break;

      case 'outdated_cache_version':
        fixedContent = this.generateCacheFix(content);
        break;

      case 'missing_nx_parallel':
        fixedContent = content.replace(
          /pnpm exec nx affected/g,
          'pnpm exec nx affected --parallel',
        );
        break;
    }

    if (fixedContent !== content) {
      await writeFile(issue.file, fixedContent);
      this.fixes.push(`Fixed ${issue.type} in ${issue.file}`);
      this.log(`Applied fix for ${issue.type} in ${issue.file}`, 'success');
    }
  }

  extractJobType(filePath) {
    const filename = filePath.split('/').pop().replace('.yml', '');
    if (filename.includes('test')) {
      if (filename.includes('unit')) return 'test-unit';
      if (filename.includes('integration')) return 'test-integration';
      if (filename.includes('e2e')) return 'test-e2e';
      return 'test';
    }
    if (filename.includes('lint')) return 'lint';
    if (filename.includes('coverage')) return 'coverage';
    return 'build';
  }

  async runPerformanceAnalysis() {
    this.log('Running pipeline performance analysis...');

    try {
      // Check Nx affected performance
      const result = execSync('pnpm exec nx show projects --type=app,lib', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      const projects = result.trim().split('\n').length;
      this.log(`Found ${projects} projects in the monorepo`);

      if (projects > 50) {
        this.warnings.push({
          type: 'large_monorepo',
          message: `Large monorepo with ${projects} projects - consider using affected builds and caching`,
        });
      }
    } catch (error) {
      this.log('Could not run performance analysis', 'error');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 PIPELINE ANALYSIS REPORT');
    console.log('='.repeat(60));

    console.log(`\n📊 Summary:`);
    console.log(`   Issues found: ${this.issues.length}`);
    console.log(`   Fixes applied: ${this.fixes.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);

    if (this.issues.length > 0) {
      console.log(`\n❌ Issues:`);
      this.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
        console.log(`      File: ${issue.file}`);
      });
    }

    if (this.fixes.length > 0) {
      console.log(`\n🔧 Fixes Applied:`);
      this.fixes.forEach((fix, i) => {
        console.log(`   ${i + 1}. ${fix}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      this.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning.message}`);
        if (warning.file) console.log(`      File: ${warning.file}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  }

  async run() {
    this.log('Starting Pipeline BuildFix & Automation Tool');

    // Analyze all workflow files
    const workflowFiles = [
      '.github/workflows/build.yml',
      '.github/workflows/test.yml',
      '.github/workflows/test-unit.yml',
      '.github/workflows/test-integration.yml',
      '.github/workflows/test-e2e.yml',
      '.github/workflows/test-coverage.yml',
      '.github/workflows/lint.yml',
    ];

    for (const file of workflowFiles) {
      await this.analyzeWorkflow(file);
    }

    await this.runPerformanceAnalysis();

    // Ask user if they want to apply fixes
    if (this.issues.length > 0) {
      console.log(`\n🔧 Found ${this.issues.length} issues. Apply automatic fixes? (y/N)`);

      // For automation, we'll apply high-severity fixes automatically
      await this.applyFixes();
    }

    this.generateReport();

    // Return exit code based on whether high-severity issues remain
    const highSeverityIssues = this.issues.filter((i) => i.severity === 'high');
    return highSeverityIssues.length > 0 ? 1 : 0;
  }
}

// CLI interface
async function main() {
  const optimizer = new PipelineOptimizer();

  try {
    const exitCode = await optimizer.run();
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Pipeline optimizer failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default PipelineOptimizer;
