import test from 'ava';

import { analyzeWithAI } from '../lib/testing-transition/ai-analyzer.js';

const sampleRequest = {
  tests: ['tests/example.spec.ts'],
  coverageResult: {
    overallCoverage: 88,
    totalCoverage: 88,
    packageCoverage: { '@promethean-os/sample': 87 },
    fileCoverage: { 'src/example.ts': 85 },
    uncoveredLines: { 'src/example.ts': [42, 43] },
    meetsThreshold: false,
    coverageGap: 4,
  },
  qualityScore: {
    score: 82,
    details: {
      complexity: 60,
      passRate: 78,
      flakiness: 5,
      assertionQuality: 72,
      edgeCaseCoverage: 70,
    },
  },
  mappings: [
    { requirementId: 'REQ-1', testIds: ['tests/example.spec.ts'], isCovered: true },
    { requirementId: 'REQ-2', testIds: [], isCovered: false },
  ],
} as const;

test('analyzeWithAI generates deterministic Pantheon insights', async (t) => {
  const result = await analyzeWithAI(sampleRequest);

  t.true(Array.isArray(result.insights));
  t.true(result.insights.length >= 2);
  t.true(result.recommendations.some((rec) => rec.toLowerCase().includes('coverage')));

  const expectedScore = Math.round(88 * 0.4 + 82 * 0.4 + (50) * 0.2);
  t.is(result.overallScore, expectedScore);
});
