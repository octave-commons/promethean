#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

/**
 * Log Deduplication Utility
 *
 * This script analyzes log files and deduplicates entries by counting
 * duplicate instances and providing summary statistics.
 */

class LogDeduplicator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.groupBy = options.groupBy || 'exact'; // 'exact', 'pattern', 'timestamp'
    this.outputFormat = options.outputFormat || 'summary'; // 'summary', 'detailed', 'json'
  }

  /**
   * Process a single log file and deduplicate entries
   */
  async processLogFile(filePath) {
    console.log(`🔍 Processing log file: ${filePath}`);

    const logEntries = await this.readLogFile(filePath);
    const deduped = this.deduplicateEntries(logEntries);

    if (this.verbose) {
      console.log(`   📊 Total entries: ${logEntries.length}`);
      console.log(`   🔄 Unique entries: ${deduped.unique.size}`);
      console.log(`   📈 Duplicates found: ${deduped.duplicates.size}`);
    }

    return {
      filePath,
      ...deduped,
      totalEntries: logEntries.length,
      deduplicationRatio: deduped.unique.size / logEntries.length,
    };
  }

  /**
   * Read log file line by line to handle large files efficiently
   */
  async readLogFile(filePath) {
    const entries = [];

    try {
      const fileStream = createReadStream(filePath);
      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        if (line.trim()) {
          entries.push({
            raw: line,
            timestamp: this.extractTimestamp(line),
            level: this.extractLogLevel(line),
            content: this.extractContent(line),
            pattern: this.extractPattern(line),
          });
        }
      }

      await fileStream.close();
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error.message);
      throw error;
    }

    return entries;
  }

  /**
   * Deduplicate log entries based on grouping strategy
   */
  deduplicateEntries(entries) {
    const groups = new Map();
    const duplicates = new Map();

    for (const entry of entries) {
      const key = this.getGroupingKey(entry);

      if (!groups.has(key)) {
        groups.set(key, {
          entry,
          count: 0,
          indices: [],
        });
      }

      const group = groups.get(key);
      group.count++;
      group.indices.push(entries.indexOf(entry));

      if (group.count > 1) {
        duplicates.set(key, group);
      }
    }

    return {
      unique: groups,
      duplicates,
      mostFrequent: this.findMostFrequent(groups),
    };
  }

  /**
   * Get grouping key based on strategy
   */
  getGroupingKey(entry) {
    switch (this.groupBy) {
      case 'pattern':
        return entry.pattern || entry.content;
      case 'timestamp':
        // Group by minute-level timestamp
        return entry.timestamp ? entry.timestamp.substring(0, 16) : entry.content;
      case 'exact':
      default:
        return entry.content;
    }
  }

  /**
   * Extract timestamp from log entry
   */
  extractTimestamp(line) {
    // Common timestamp patterns
    const patterns = [
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[\d.]*Z?)/,
      /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/,
      /^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[\d.]*Z?)\]/,
      /^(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Extract log level from entry
   */
  extractLogLevel(line) {
    const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    const upperLine = line.toUpperCase();

    for (const level of levels) {
      if (upperLine.includes(level)) {
        return level;
      }
    }

    return 'INFO';
  }

  /**
   * Extract main content from log entry
   */
  extractContent(line) {
    // Remove timestamp if present
    let content = line.replace(/^[\d\-T:\.Z\s\[\]]+/, '').trim();

    // Remove log level if present
    content = content.replace(/^(ERROR|WARN|INFO|DEBUG|TRACE)[:\s]*/i, '').trim();

    return content;
  }

  /**
   * Extract pattern for pattern-based grouping
   */
  extractPattern(line) {
    let content = this.extractContent(line);

    // Replace common variable patterns with placeholders
    content = content
      .replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[\d.]*Z?\b/g, '[TIMESTAMP]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .replace(/\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi, '[UUID]')
      .replace(/\b[a-f0-9]{40,}\b/gi, '[HASH]')
      .replace(/\b\d+\b/g, '[NUMBER]')
      .replace(/\/[^\s]+\/[^\s]*/g, '[PATH]')
      .trim();

    return content;
  }

  /**
   * Find most frequent log entries
   */
  findMostFrequent(groups) {
    return Array.from(groups.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([key, group]) => ({
        key,
        count: group.count,
        entry: group.entry,
        percentage: (
          (group.count / Array.from(groups.values()).reduce((sum, g) => sum + g.count, 0)) *
          100
        ).toFixed(2),
      }));
  }

  /**
   * Generate output report
   */
  generateReport(results) {
    switch (this.outputFormat) {
      case 'json':
        return JSON.stringify(results, null, 2);
      case 'detailed':
        return this.generateDetailedReport(results);
      case 'summary':
      default:
        return this.generateSummaryReport(results);
    }
  }

  /**
   * Generate summary report
   */
  generateSummaryReport(results) {
    let report = '\n📊 Log Deduplication Summary\n';
    report += '='.repeat(50) + '\n\n';

    for (const result of results) {
      report += `📁 File: ${result.filePath}\n`;
      report += `   Total entries: ${result.totalEntries}\n`;
      report += `   Unique entries: ${result.unique.size}\n`;
      report += `   Duplicates: ${result.duplicates.size}\n`;
      report += `   Deduplication ratio: ${(result.deduplicationRatio * 100).toFixed(2)}%\n\n`;
    }

    // Overall statistics
    const totalEntries = results.reduce((sum, r) => sum + r.totalEntries, 0);
    const totalUnique = results.reduce((sum, r) => sum + r.unique.size, 0);
    const overallRatio = ((totalUnique / totalEntries) * 100).toFixed(2);

    report += '📈 Overall Statistics\n';
    report += '-'.repeat(30) + '\n';
    report += `Total entries across all files: ${totalEntries}\n`;
    report += `Total unique entries: ${totalUnique}\n`;
    report += `Overall deduplication ratio: ${overallRatio}%\n`;

    return report;
  }

  /**
   * Generate detailed report
   */
  generateDetailedReport(results) {
    let report = this.generateSummaryReport(results);

    report += '\n🔍 Top Duplicate Entries\n';
    report += '='.repeat(50) + '\n\n';

    for (const result of results) {
      if (result.mostFrequent.length > 0) {
        report += `📁 File: ${result.filePath}\n`;
        result.mostFrequent.forEach((item, index) => {
          report += `   ${index + 1}. (${item.count}x, ${item.percentage}%) ${item.entry.content.substring(0, 100)}${item.entry.content.length > 100 ? '...' : ''}\n`;
        });
        report += '\n';
      }
    }

    return report;
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node deduplicate-logs.js <log-file-or-directory> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --verbose           Show detailed processing information');
    console.log(
      '  --group-by <type>   Grouping strategy: exact, pattern, timestamp (default: exact)',
    );
    console.log('  --format <type>     Output format: summary, detailed, json (default: summary)');
    console.log('');
    console.log('Examples:');
    console.log('  node deduplicate-logs.js logs/ --verbose');
    console.log('  node deduplicate-logs.js app.log --group-by pattern --format detailed');
    process.exit(1);
  }

  const targetPath = args[0];
  const options = {
    verbose: args.includes('--verbose'),
    groupBy: args.includes('--group-by') ? args[args.indexOf('--group-by') + 1] : 'exact',
    outputFormat: args.includes('--format') ? args[args.indexOf('--format') + 1] : 'summary',
  };

  const deduplicator = new LogDeduplicator(options);
  const results = [];

  try {
    const stat = await fs.stat(targetPath);

    if (stat.isDirectory()) {
      // Process all .log files in directory
      const files = await fs.readdir(targetPath);
      const logFiles = files.filter((file) => file.endsWith('.log'));

      for (const file of logFiles) {
        const filePath = path.join(targetPath, file);
        const result = await deduplicator.processLogFile(filePath);
        results.push(result);
      }
    } else {
      // Process single file
      const result = await deduplicator.processLogFile(targetPath);
      results.push(result);
    }

    const report = deduplicator.generateReport(results);
    console.log(report);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { LogDeduplicator };
