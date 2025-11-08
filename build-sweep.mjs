#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = join(ROOT_DIR, 'packages');

async function getPackageNames() {
  if (!existsSync(PACKAGES_DIR)) {
    console.error('❌ packages directory not found');
    process.exit(1);
  }

  return readdirSync(PACKAGES_DIR)
    .filter(item => {
      const itemPath = join(PACKAGES_DIR, item);
      return existsSync(itemPath) && !item.startsWith('.');
    })
    .sort();
}

function buildPackage(packageName) {
  const startTime = Date.now();
  
  try {
    console.log(`🔨 Building @promethean-os/${packageName}...`);
    
    execSync(
      `pnpm --filter @promethean-os/${packageName} build`,
      { 
        cwd: ROOT_DIR,
        stdio: 'pipe',
        timeout: 60000, // 60 second timeout
        encoding: 'utf8'
      }
    );
    
    const duration = Date.now() - startTime;
    console.log(`✅ @promethean-os/${packageName} built successfully (${duration}ms)`);
    
    return {
      package: packageName,
      status: 'success',
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error.stderr || error.stdout || error.message || 'Unknown error';
    
    console.log(`❌ @promethean-os/${packageName} failed (${duration}ms)`);
    
    return {
      package: packageName,
      status: 'failed',
      error: errorMsg.trim().split('\n').slice(0, 3).join('\n'), // First 3 lines of error
      duration
    };
  }
}

function printSummary(summary) {
  console.log('\n' + '='.repeat(80));
  console.log('🏗️  BUILD SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total packages: ${summary.total}`);
  console.log(`Successful: ${summary.successful} ✅`);
  console.log(`Failed: ${summary.failed} ❌`);
  console.log(`Success rate: ${((summary.successful / summary.total) * 100).toFixed(1)}%`);
  
  if (summary.failed > 0) {
    console.log('\n❌ FAILED PACKAGES:');
    summary.results
      .filter(r => r.status === 'failed')
      .forEach(r => {
        console.log(`\n📦 @promethean-os/${r.package}:`);
        if (r.error) {
          console.log(`   ${r.error}`);
        }
      });
  }

  console.log('\n✅ SUCCESSFUL PACKAGES:');
  summary.results
    .filter(r => r.status === 'success')
    .forEach(r => {
      console.log(`   📦 @promethean-os/${r.package} (${r.duration}ms)`);
    });

  console.log('\n' + '='.repeat(80));
}

function generateMarkdownReport(summary) {
  const timestamp = new Date().toISOString();
  let report = `# Build Sweep Report\n\nGenerated: ${timestamp}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Total packages**: ${summary.total}\n`;
  report += `- **Successful**: ${summary.successful} ✅\n`;
  report += `- **Failed**: ${summary.failed} ❌\n`;
  report += `- **Success rate**: ${((summary.successful / summary.total) * 100).toFixed(1)}%\n\n`;

  if (summary.failed > 0) {
    report += `## Failed Packages ❌\n\n`;
    summary.results
      .filter(r => r.status === 'failed')
      .forEach(r => {
        report += `### @promethean-os/${r.package}\n\n`;
        if (r.error) {
          report += '```\n' + r.error + '\n```\n\n';
        }
      });
  }

  report += `## Successful Packages ✅\n\n`;
  summary.results
    .filter(r => r.status === 'success')
    .forEach(r => {
      report += `- **@promethean-os/${r.package}** (${r.duration}ms)\n`;
    });

  return report;
}

async function main() {
  console.log('🚀 Starting Promethean monorepo build sweep...\n');
  
  const packages = await getPackageNames();
  const summary = {
    total: packages.length,
    successful: 0,
    failed: 0,
    results: []
  };

  console.log(`📦 Found ${packages.length} packages to build\n`);

  // Build packages sequentially to avoid resource conflicts
  for (const packageName of packages) {
    const result = buildPackage(packageName);
    summary.results.push(result);
    
    if (result.status === 'success') {
      summary.successful++;
    } else {
      summary.failed++;
    }
  }

  printSummary(summary);

  // Save markdown report
  const markdown = generateMarkdownReport(summary);
  const reportPath = join(ROOT_DIR, `build-sweep-report-${Date.now()}.md`);
  writeFileSync(reportPath, markdown);
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Exit with error code if any builds failed
  process.exit(summary.failed > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
