#!/usr/bin/env node

/**
 * CLI interface for Scar file healing system
 */

import { program } from 'commander';
import { promises as fs } from 'fs';
import { ScarContext } from '../core/scar-context.js';
import { ScarConfig } from '../types/index.js';

interface CliOptions {
  recursive?: boolean;
  backup?: boolean;
  autoHeal?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  output?: string;
  type?: string;
  severity?: string;
}

const setupProgram = () => {
  program
    .name('scar')
    .description('Scar file healing system - detects and fixes file corruptions')
    .version('1.0.0');

  // Analyze command
  program
    .command('analyze')
    .description('Analyze files or directories for corruptions')
    .argument('<path>', 'Path to file or directory to analyze')
    .option('-r, --recursive', 'Analyze directories recursively', false)
    .option('-t, --type <type>', 'Filter by corruption type')
    .option('-s, --severity <severity>', 'Filter by severity level')
    .option('-o, --output <file>', 'Output results to file')
    .option('-v, --verbose', 'Verbose output', false)
    .action(async (path: string, options: CliOptions) => {
      try {
        await handleAnalyze(path, options);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  // Heal command
  program
    .command('heal')
    .description('Heal corrupted files')
    .argument('<path>', 'Path to file or directory to heal')
    .option('-r, --recursive', 'Heal directories recursively', false)
    .option('-b, --backup', 'Create backups before healing', true)
    .option('--no-backup', 'Do not create backups')
    .option('--no-auto-heal', 'Disable automatic healing')
    .option('--dry-run', 'Show what would be healed without making changes', false)
    .option('-v, --verbose', 'Verbose output', false)
    .action(async (path: string, options: CliOptions) => {
      try {
        await handleHeal(path, options);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  // Report command
  program
    .command('report')
    .description('Generate scar healing report')
    .option('-o, --output <file>', 'Output report to file')
    .action(async (options: CliOptions) => {
      try {
        await handleReport(options);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  // Clear command
  program
    .command('clear')
    .description('Clear scar records for a file')
    .argument('<path>', 'Path to file to clear scars for')
    .action(async (path: string) => {
      try {
        await handleClear(path);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  // Status command
  program
    .command('status')
    .description('Show scar system status and statistics')
    .option('-v, --verbose', 'Verbose output', false)
    .action(async (options: CliOptions) => {
      try {
        await handleStatus(options);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
};

const createConfig = (options: CliOptions): Partial<ScarConfig> => {
  return {
    autoHeal: options.autoHeal !== false,
    backupEnabled: options.backup !== false,
    dryRun: options.dryRun || false,
    logLevel: options.verbose ? 'debug' : 'info',
  };
};

const handleAnalyze = async (path: string, options: CliOptions) => {
  const config = createConfig(options);
  const context = new ScarContext(config);

  console.log(`🔍 Analyzing: ${path}`);

  const stats = await fs.stat(path);
  let results;

  if (stats.isFile()) {
    results = [await context.analyzeFile(path)];
  } else if (stats.isDirectory()) {
    results = await context.analyzeDirectory(path, options.recursive);
  } else {
    throw new Error('Path must be a file or directory');
  }

  // Filter results if specified
  if (options.type || options.severity) {
    results = filterResults(results, options);
  }

  // Output results
  const output = formatAnalysisResults(results, options.verbose);

  if (options.output) {
    await fs.writeFile(options.output, output, 'utf-8');
    console.log(`📄 Results written to: ${options.output}`);
  } else {
    console.log(output);
  }

  // Summary
  const corruptedFiles = results.filter((r) => r.isCorrupted).length;
  const totalCorruptions = results.reduce((sum, r) => sum + r.corruptions.length, 0);

  console.log(`\n📊 Summary:`);
  console.log(`   Files analyzed: ${results.length}`);
  console.log(`   Corrupted files: ${corruptedFiles}`);
  console.log(`   Total corruptions: ${totalCorruptions}`);
};

const handleHeal = async (path: string, options: CliOptions) => {
  const config = createConfig(options);
  const context = new ScarContext(config);

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }

  console.log(`🔧 Healing: ${path}`);

  const stats = await fs.stat(path);
  let results;

  if (stats.isFile()) {
    results = new Map([[path, await context.healFile(path, options.backup)]]);
  } else if (stats.isDirectory()) {
    results = await context.healDirectory(path, options.recursive);
  } else {
    throw new Error('Path must be a file or directory');
  }

  // Output results
  const output = formatHealingResults(results, options.verbose);
  console.log(output);

  // Summary
  let totalHealed = 0;
  let totalFailed = 0;
  let totalManualReview = 0;

  for (const [, fileResults] of results) {
    for (const result of fileResults) {
      if (result.success) {
        totalHealed++;
      } else {
        totalFailed++;
      }
      if (result.requiresManualReview) {
        totalManualReview++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${results.size}`);
  console.log(`   Successful healings: ${totalHealed}`);
  console.log(`   Failed healings: ${totalFailed}`);
  console.log(`   Require manual review: ${totalManualReview}`);
};

const handleReport = async (options: CliOptions) => {
  const context = new ScarContext();
  const report = await context.generateScarReport();

  if (options.output) {
    await fs.writeFile(options.output, report, 'utf-8');
    console.log(`📄 Report written to: ${options.output}`);
  } else {
    console.log(report);
  }
};

const handleClear = async (path: string) => {
  const context = new ScarContext();
  await context.clearScarsForFile(path);
  console.log(`🧹 Cleared scar records for: ${path}`);
};

const handleStatus = async (options: CliOptions) => {
  const context = new ScarContext();
  const allScars = await context.getAllScars();

  let totalScars = 0;
  let totalFiles = 0;
  const severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
  const typeCount: Record<string, number> = {};

  for (const [, scars] of allScars) {
    totalFiles++;
    totalScars += scars.length;

    for (const scarRecord of scars) {
      const scar = scarRecord.scar;
      severityCount[scar.severity]++;
      typeCount[scar.type] = (typeCount[scar.type] || 0) + 1;
    }
  }

  console.log('📈 Scar System Status');
  console.log('====================');
  console.log(`Total files with scars: ${totalFiles}`);
  console.log(`Total scars: ${totalScars}`);

  if (options.verbose) {
    console.log('\nBy Severity:');
    Object.entries(severityCount).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}`);
    });

    console.log('\nBy Type:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  }
};

const filterResults = (results: any[], options: CliOptions) => {
  return results.filter((result) => {
    if (!result.isCorrupted) return false;

    if (options.type) {
      const hasType = result.corruptions.some((c: any) => c.type === options.type);
      if (!hasType) return false;
    }

    if (options.severity) {
      const hasSeverity = result.corruptions.some((c: any) => c.severity === options.severity);
      if (!hasSeverity) return false;
    }

    return true;
  });
};

const formatAnalysisResults = (results: any[], verbose: boolean = false): string => {
  let output = '';

  for (const result of results) {
    if (result.isCorrupted) {
      output += `\n🚨 ${result.filePath}\n`;

      for (const corruption of result.corruptions) {
        output += `   ${corruption.severity.toUpperCase()}: ${corruption.description}\n`;
        output += `   Type: ${corruption.type}\n`;
        output += `   Auto-healable: ${corruption.autoHealable ? 'Yes' : 'No'}\n`;

        if (verbose && corruption.evidence) {
          output += `   Evidence: ${corruption.evidence.join(', ')}\n`;
        }
        output += '\n';
      }
    } else if (verbose) {
      output += `✅ ${result.filePath} - No corruptions detected\n`;
    }
  }

  return output || 'No corruptions found.';
};

const formatHealingResults = (results: Map<string, any[]>, verbose: boolean = false): string => {
  let output = '';

  for (const [filePath, fileResults] of results) {
    output += `\n🔧 ${filePath}\n`;

    for (const result of fileResults) {
      if (result.success) {
        output += `   ✅ Healing successful\n`;
        if (result.changesMade && result.changesMade.length > 0) {
          output += `   Changes made:\n`;
          for (const change of result.changesMade) {
            output += `     - ${change}\n`;
          }
        }
      } else {
        output += `   ❌ Healing failed: ${result.errorMessage}\n`;
      }

      if (result.requiresManualReview) {
        output += `   ⚠️  Requires manual review\n`;
      }

      if (verbose) {
        output += `   Strategy: ${result.strategy || 'Unknown'}\n`;
      }
      output += '\n';
    }
  }

  return output || 'No healing operations performed.';
};

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProgram();
  program.parse();
}
