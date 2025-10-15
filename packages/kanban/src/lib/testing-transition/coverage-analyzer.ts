import fs from 'fs';
import type { TestCoverageRequest, TestCoverageResult } from './types.js';
import { parseStringPromise } from 'xml2js';

/**
 * Analyze test coverage based on given report format.
 */
export async function analyzeCoverage(req: TestCoverageRequest): Promise<TestCoverageResult> {
  const data = fs.readFileSync(req.reportPath, 'utf-8');

  switch (req.format) {
    case 'lcov':
      return parseLcov(data);
    case 'cobertura':
      return parseCobertura(data);
    case 'json':
      return parseJsonCoverage(data);
    default:
      throw new Error(`Unsupported format: ${req.format}`);
  }
}

function parseLcov(raw: string): TestCoverageResult {
  // Basic LCOV parser: counts total and covered lines
  const fileCoverage: Record<string, number> = {};
  let currentFile = '';
  let totalLines = 0;
  let coveredLines = 0;

  raw.split(/\r?\n/).forEach((line) => {
    if (line.startsWith('SF:')) {
      currentFile = line.substring(3).trim();
      fileCoverage[currentFile] = 0;
    } else if (line.startsWith('DA:')) {
      const parts = line.substring(3).split(',');
      const hits = parseInt(parts[1] || '0', 10);
      totalLines++;
      if (hits > 0) {
        coveredLines++;
        fileCoverage[currentFile] = (fileCoverage[currentFile] || 0) + 1;
      }
    }
  });

  const totalCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  // Normalize per-file percentages
  Object.keys(fileCoverage).forEach((file) => {
    // Note: This is rough; ideally count per-file totals
    fileCoverage[file] = Math.min(100, ((fileCoverage[file] || 0) / totalLines) * 100);
  });

  return { totalCoverage, fileCoverage };
}

async function parseCobertura(raw: string): Promise<TestCoverageResult> {
  const xml = await parseStringPromise(raw);
  // Expect xml coverage report root
  const packages = xml?.coverage?.packages?.[0]?.package || [];
  let totalLines = 0;
  let coveredLines = 0;
  const fileCoverage: Record<string, number> = {};

  packages.forEach((pkg: any) => {
    (pkg.classes?.[0]?.class || []).forEach((cls: any) => {
      const fileName = cls.$.filename;
      const lines = cls.lines?.[0]?.line || [];
      let fileTotal = 0;
      let fileCovered = 0;
      lines.forEach((ln: any) => {
        fileTotal++;
        if (parseInt(ln.$.hits, 10) > 0) {
          fileCovered++;
        }
      });
      totalLines += fileTotal;
      coveredLines += fileCovered;
      fileCoverage[fileName] = fileTotal > 0 ? (fileCovered / fileTotal) * 100 : 0;
    });
  });

  const totalCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  return { totalCoverage, fileCoverage };
}

function parseJsonCoverage(raw: string): TestCoverageResult {
  // Assume Jest-like JSON coverage format
  const data = JSON.parse(raw);
  const totals = data.total || {};
  const totalCoverage = totals.lines?.pct ?? 0;
  const fileCoverage: Record<string, number> = {};

  if (data.coverageMap) {
    Object.entries(data.coverageMap).forEach(([file, cov]: any) => {
      fileCoverage[file] = cov.lines.pct;
    });
  }

  return { totalCoverage, fileCoverage };
}
