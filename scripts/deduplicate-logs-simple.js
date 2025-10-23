#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Simple Log Deduplication Utility
 *
 * Lightweight version for processing large log directories without memory issues
 */

class SimpleLogDeduplicator {
  constructor() {
    this.results = [];
  }

  /**
   * Process log files with memory-efficient approach
   */
  async processLogFiles(logDir) {
    console.log('🔍 Scanning log directory:', logDir);

    const files = await fs.readdir(logDir);
    const logFiles = files.filter((file) => file.endsWith('.log'));

    console.log(`📁 Found ${logFiles.length} log files`);

    for (const file of logFiles) {
      const filePath = path.join(logDir, file);
      await this.processSingleFile(filePath);
    }

    this.generateSummary();
  }

  /**
   * Process a single log file efficiently
   */
  async processSingleFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n').filter((line) => line.trim());

      const lineCounts = new Map();

      // Count duplicate lines
      for (const line of lines) {
        const count = lineCounts.get(line) || 0;
        lineCounts.set(line, count + 1);
      }

      // Calculate statistics
      const totalLines = lines.length;
      const uniqueLines = lineCounts.size;
      const duplicates = Array.from(lineCounts.entries()).filter(([_, count]) => count > 1);
      const duplicateCount = duplicates.length;

      // Find most frequent duplicates
      const topDuplicates = duplicates
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([line, count]) => ({
          line: line.substring(0, 100) + (line.length > 100 ? '...' : ''),
          count,
          percentage: ((count / totalLines) * 100).toFixed(2),
        }));

      const result = {
        filePath: path.basename(filePath),
        totalLines,
        uniqueLines,
        duplicateCount,
        deduplicationRatio: ((uniqueLines / totalLines) * 100).toFixed(2),
        topDuplicates,
      };

      this.results.push(result);

      console.log(
        `✅ Processed ${result.filePath}: ${totalLines} lines, ${uniqueLines} unique (${result.deduplicationRatio}% unique)`,
      );
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    console.log('\n📊 Log Deduplication Summary');
    console.log('='.repeat(60));

    let totalLines = 0;
    let totalUnique = 0;

    // Per-file details
    for (const result of this.results) {
      totalLines += result.totalLines;
      totalUnique += result.uniqueLines;

      console.log(`\n📁 ${result.filePath}`);
      console.log(`   Total lines: ${result.totalLines}`);
      console.log(`   Unique lines: ${result.uniqueLines}`);
      console.log(`   Duplicates: ${result.duplicateCount}`);
      console.log(`   Unique ratio: ${result.deduplicationRatio}%`);

      if (result.topDuplicates.length > 0) {
        console.log(`   Top duplicates:`);
        result.topDuplicates.forEach((dup, index) => {
          console.log(`     ${index + 1}. (${dup.count}x, ${dup.percentage}%) ${dup.line}`);
        });
      }
    }

    // Overall statistics
    const overallRatio = totalLines > 0 ? ((totalUnique / totalLines) * 100).toFixed(2) : 0;

    console.log('\n📈 Overall Statistics');
    console.log('-'.repeat(30));
    console.log(`Total lines across all files: ${totalLines}`);
    console.log(`Total unique lines: ${totalUnique}`);
    console.log(`Overall unique ratio: ${overallRatio}%`);

    // Find files with highest duplication
    const mostDuplicated = this.results
      .filter((r) => r.duplicateCount > 0)
      .sort((a, b) => b.totalLines - b.uniqueLines - (a.totalLines - a.uniqueLines))
      .slice(0, 3);

    if (mostDuplicated.length > 0) {
      console.log('\n🔍 Files with most duplication:');
      mostDuplicated.forEach((result, index) => {
        const duplicateLines = result.totalLines - result.uniqueLines;
        console.log(`  ${index + 1}. ${result.filePath}: ${duplicateLines} duplicate lines`);
      });
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node deduplicate-logs-simple.js <log-directory>');
    console.log('');
    console.log('Example: node deduplicate-logs-simple.js logs/');
    process.exit(1);
  }

  const logDir = args[0];
  const deduplicator = new SimpleLogDeduplicator();

  try {
    await deduplicator.processLogFiles(logDir);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SimpleLogDeduplicator };
