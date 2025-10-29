import test from 'ava';

import { createAISecurityEvaluator, createMockOpenCodeAdapter } from '../ai-security-evaluator.js';

test('evaluateSecurityThreat allows benign input', async (t) => {
  const llmPort = {
    complete: async (messages: any[], opts?: any) => {
      return {
        role: 'assistant',
        content: JSON.stringify({
          isThreat: false,
          confidence: 0.0,
          threatType: null,
          explanation: 'No threat detected',
          patterns: [],
          riskFactors: [],
        }),
      };
    },
  } as any;
  const evaluator = createAISecurityEvaluator({
    llmPort,
    model: 'test-model',
    temperature: 0.2,
    blockThreshold: 0.8,
    warnThreshold: 0.5,
    enableUserConfirmation: false,
  });

  const assessment = await evaluator.evaluateSecurityThreat('README.md', 'filename');

  t.false(assessment.isThreat);
  t.true(assessment.confidence >= 0);
  t.is(assessment.suggestedAction, 'allow');
});

test('evaluateSecurityThreat blocks dangerous input', async (t) => {
  const llmPort = {
    complete: async (messages: any[], opts?: any) => {
      return {
        role: 'assistant',
        content: JSON.stringify({
          isThreat: false,
          confidence: 0.0,
          threatType: null,
          explanation: 'No threat detected',
          patterns: [],
          riskFactors: [],
        }),
      };
    },
  } as any;
  const evaluator = createAISecurityEvaluator({
    llmPort,
    model: 'test-model',
    temperature: 0.2,
    blockThreshold: 0.8,
    warnThreshold: 0.5,
    enableUserConfirmation: false,
  });

  const assessment = await evaluator.evaluateSecurityThreat('../etc/passwd', 'filepath');

  t.true(assessment.isThreat);
  t.true(assessment.confidence > 0);
  t.not(assessment.suggestedAction, 'allow');
});
