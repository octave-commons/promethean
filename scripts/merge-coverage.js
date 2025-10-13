#!/usr/bin/env node

/**
 * Merge coverage reports from different test types (unit, integration, e2e)
 * Usage: node scripts/merge-coverage.js [output-dir]
 */

const fs = require('fs');
const path = require('path');

const COVERAGE_TYPES = ['unit', 'integration', 'e2e'];
const DEFAULT_OUTPUT_DIR = 'coverage';

function mergeCoverageObjects(coverage1, coverage2) {
  const merged = { ...coverage1 };

  for (const [filename, fileData] of Object.entries(coverage2)) {
    if (merged[filename]) {
      // Merge coverage data for the same file
      const existing = merged[filename];
      const incoming = fileData;

      merged[filename] = {
        path: existing.path,
        statementMap: { ...existing.statementMap, ...incoming.statementMap },
        s: { ...existing.s, ...incoming.s },
        branchMap: { ...existing.branchMap, ...incoming.branchMap },
        b: mergeBranchCoverage(existing.b, incoming.b),
        fnMap: { ...existing.fnMap, ...incoming.fnMap },
        f: { ...existing.f, ...incoming.f },
      };
    } else {
      merged[filename] = fileData;
    }
  }

  return merged;
}

function mergeBranchCoverage(b1, b2) {
  const merged = { ...b1 };

  for (const [branchId, branchData] of Object.entries(b2)) {
    if (merged[branchId]) {
      // Merge branch coverage arrays
      merged[branchId] = merged[branchId].map((count, index) => count + (branchData[index] || 0));
    } else {
      merged[branchId] = branchData;
    }
  }

  return merged;
}

function loadCoverageFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.warn(`Failed to load coverage from ${filePath}:`, error.message);
  }
  return null;
}

function mergeCoverageReports(outputDir = DEFAULT_OUTPUT_DIR) {
  console.log('Merging coverage reports...');

  let mergedCoverage = {};
  const foundTypes = [];

  for (const type of COVERAGE_TYPES) {
    const typeCoverageDir = path.join(outputDir, type);
    const coverageFile = path.join(typeCoverageDir, 'coverage-final.json');

    const coverage = loadCoverageFile(coverageFile);
    if (coverage) {
      console.log(`Found ${type} coverage: ${Object.keys(coverage).length} files`);
      mergedCoverage = mergeCoverageObjects(mergedCoverage, coverage);
      foundTypes.push(type);
    } else {
      console.log(`No ${type} coverage found at ${coverageFile}`);
    }
  }

  if (foundTypes.length === 0) {
    console.error('No coverage reports found to merge');
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write merged coverage
  const mergedFile = path.join(outputDir, 'coverage-final.json');
  fs.writeFileSync(mergedFile, JSON.stringify(mergedCoverage, null, 2));

  console.log(`✅ Merged coverage written to ${mergedFile}`);
  console.log(
    `📊 Merged ${foundTypes.join(', ')} coverage for ${Object.keys(mergedCoverage).length} files`,
  );

  // Generate a summary report
  const summary = {
    timestamp: new Date().toISOString(),
    types: foundTypes,
    totalFiles: Object.keys(mergedCoverage).length,
    outputFile: mergedFile,
  };

  const summaryFile = path.join(outputDir, 'coverage-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log(`📋 Coverage summary written to ${summaryFile}`);
}

// CLI interface
if (require.main === module) {
  const outputDir = process.argv[2] || DEFAULT_OUTPUT_DIR;
  mergeCoverageReports(outputDir);
}

module.exports = { mergeCoverageReports };
