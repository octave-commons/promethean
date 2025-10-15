#!/usr/bin/env node

import { analyzeCoverage } from './packages/kanban/dist/lib/testing-transition/coverage-analyzer.js';

async function testCoverageAnalysis() {
  console.log('🧪 Testing Coverage Analysis Integration\n');

  const testCases = [
    {
      name: 'LCOV Format',
      request: {
        format: 'lcov',
        reportPath: './test-coverage.lcov'
      }
    },
    {
      name: 'JSON Format', 
      request: {
        format: 'json',
        reportPath: './test-coverage.json'
      }
    },
    {
      name: 'Cobertura Format',
      request: {
        format: 'cobertura', 
        reportPath: './test-coverage.xml'
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📊 Testing ${testCase.name}...`);
      const result = await analyzeCoverage(testCase.request);
      
      console.log(`✅ ${testCase.name} Analysis Results:`);
      console.log(`   Total Coverage: ${result.totalCoverage.toFixed(2)}%`);
      console.log(`   Files Analyzed: ${Object.keys(result.fileCoverage).length}`);
      
      Object.entries(result.fileCoverage).forEach(([file, coverage]) => {
        console.log(`   ${file}: ${coverage.toFixed(2)}%`);
      });
      
      console.log('');
      
      // Validate thresholds
      const hardBlockThreshold = 90;
      const softBlockThreshold = 75;
      
      if (result.totalCoverage < hardBlockThreshold) {
        console.log(`🚫 HARD BLOCK: Coverage ${result.totalCoverage.toFixed(2)}% < ${hardBlockThreshold}%`);
      } else if (result.totalCoverage < softBlockThreshold) {
        console.log(`⚠️  SOFT BLOCK: Coverage ${result.totalCoverage.toFixed(2)}% < ${softBlockThreshold}%`);
      } else {
        console.log(`✅ PASS: Coverage ${result.totalCoverage.toFixed(2)}% >= ${softBlockThreshold}%`);
      }
      
    } catch (error) {
      console.error(`❌ ${testCase.name} failed:`, error.message);
    }
    
    console.log('---\n');
  }
}

testCoverageAnalysis().catch(console.error);