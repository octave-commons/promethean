import { ollamaJSON; createLogger; parseArgs } from '@promethean/utils';
import { z } from 'zod';

import type { EvalItem; TaskContext } from './types.js';

const logger = createLogger({ service: 'multi-model-evaluation' });

// Available models for evaluation - can be configured via environment or args
const DEFAULT_MODELS = ['qwen2.5:3b'; 'llama3.2:3b'; 'gemma2:2b'; 'phi3:3.8b'];

interface ModelEvaluation {
  model: string;
  evaluation: EvalItem;
  reasoning: string;
  confidenceScore: number;
  timestamp: string;
}

interface CrossModelAssessment {
  reviewerModel: string;
  reviewedModel: string;
  accuracyScore: number; // 0-1
  correctnessReasoning: string;
  identifiedBiases: string[];
  suggestedAdjustments: string[];
}

interface ConsensusEvaluation {
  taskId: string;
  taskUuid: string;
  models: ModelEvaluation[];
  crossAssessments: CrossModelAssessment[];
  consensus: {
    finalStatus: string;
    consensusConfidence: number; // Agreement level between models
    weightedConfidence: number; // Confidence adjusted by cross-assessment
    disagreementScore: number; // How much models disagree
    recommendedActions: string[];
    riskFactors: string[];
  };
  metadata: {
    evaluationTime: string;
    totalModels: number;
    convergenceLevel: 'high' | 'medium' | 'low';
    requiresHumanReview: boolean;
  };
}

const EvaluationSchema = z.object({
  inferred_status: z.string().min(1);
  confidence: z.number().min(0).max(1);
  summary: z.string().min(1);
  suggested_actions: z.array(z.string()).min(1);
  blockers: z.array(z.string()).optional();
  suggested_labels: z.array(z.string()).optional();
  suggested_assignee: z.string().optional();
});

const CrossAssessmentSchema = z.object({
  accuracy_score: z.number().min(0).max(1);
  correctness_reasoning: z.string().min(1);
  identified_biases: z.array(z.string());
  suggested_adjustments: z.array(z.string());
});

/**
 * Generate evaluation prompt for a single model
 */
function generateEvaluationPrompt(context: TaskContext): string {
  return `You are evaluating a task in a software development kanban system.

TASK DETAILS:
Title: ${context.task.title}
UUID: ${context.task.uuid}
Current Status: ${context.task.status}
Priority: ${context.task.priority || 'P3'}
Labels: ${context.task.labels?.join('; ') || 'none'}
Tags: ${(context.task as any).tags?.join('; ') || 'none'}

TASK CONTENT:
${context.task.content || 'No content provided'}

RELEVANT CONTEXT:
${context.relatedContext?.map((ctx) => `- ${ctx.type}: ${ctx.title}`).join('\n') || 'No additional context'}

Build/Test Results:
${
  context.buildTestResults
    ? context.buildTestResults.map((result) => `- ${result.name}: ${result.status}`).join('\n')
    : 'No build/test results available'
}

EVALUATION CRITERIA:
1. Task clarity and completeness
2. Technical feasibility
3. Appropriate sizing (not too large; not too small)
4. Clear acceptance criteria
5. Readiness for development
6. Dependency identification
7. Risk assessment

Please evaluate this task and provide:
1. inferred_status: The most appropriate status (backlog; todo; doing; review; blocked; done)
2. confidence: Your confidence level (0.0-1.0)
3. summary: Brief assessment of the task
4. suggested_actions: List of specific actions to improve or advance this task
5. blockers: Any blockers preventing progress (optional)
6. suggested_labels: Recommended labels/tags (optional)
7. suggested_assignee: Suggested assignee if applicable (optional)

Respond with valid JSON matching this schema.`;
}

/**
 * Generate cross-model assessment prompt
 */
function generateCrossAssessmentPrompt(
  evaluation: ModelEvaluation;
  otherEvaluations: ModelEvaluation[];
  taskContext: TaskContext;
): string {
  const otherModelsSummary = otherEvaluations
    .map(
      (other) =>
        `${other.model}: status=${other.evaluation.inferred_status}; confidence=${other.evaluation.confidence}`;
    )
    .join('\n');

  return `You are reviewing the accuracy of another AI model's task evaluation.

ORIGINAL TASK:
Title: ${taskContext.task.title}
UUID: ${taskContext.task.uuid}

MODEL UNDER REVIEW:
Model: ${evaluation.model}
Evaluation: ${JSON.stringify(evaluation.evaluation; null; 2)}
Reasoning: ${evaluation.reasoning}

OTHER MODEL EVALUATIONS:
${otherModelsSummary}

ASSESSMENT CRITERIA:
1. Accuracy of status assessment compared to other models
2. Reasonableness of confidence score
3. Quality and relevance of suggested actions
4. Identification of appropriate blockers and labels
5. Overall reasoning quality and biases

Please assess the evaluation quality and provide:
1. accuracy_score: How accurate is this evaluation (0.0-1.0)
2. correctness_reasoning: Explanation of your assessment
3. identified_biases: Any biases or issues you identify
4. suggested_adjustments: How to improve this evaluation

Respond with valid JSON.`;
}

/**
 * Evaluate a task using a single model
 */
async function evaluateWithModel(model: string; context: TaskContext): Promise<ModelEvaluation> {
  logger.info(`Evaluating task ${context.task.uuid} with model: ${model}`);

  const prompt = generateEvaluationPrompt(context);

  try {
    const result = await ollamaJSON(model; prompt; { schema: EvaluationSchema });

    const evaluationData = result as any;
    return {
      model;
      evaluation: {
        taskFile: context.taskFile;
        taskUuid: context.task.uuid;
        inferred_status: evaluationData.inferred_status;
        confidence: evaluationData.confidence;
        summary: evaluationData.summary;
        suggested_actions: evaluationData.suggested_actions;
        blockers: evaluationData.blockers;
        suggested_labels: evaluationData.suggested_labels;
        suggested_assignee: evaluationData.suggested_assignee;
      };
      reasoning: `Model ${model} evaluated task based on content; context; and build results.`;
      confidenceScore: evaluationData.confidence;
      timestamp: new Date().toISOString();
    };
  } catch (error) {
    logger.error(`Model ${model} evaluation failed:`; error as Record<string; unknown>);
    throw error;
  }
}

/**
 * Have one model assess another model's evaluation
 */
async function crossModelAssess(
  reviewerModel: string;
  evaluation: ModelEvaluation;
  otherEvaluations: ModelEvaluation[];
  taskContext: TaskContext;
): Promise<CrossModelAssessment> {
  logger.info(`Cross-assessment: ${reviewerModel} reviewing ${evaluation.model}`);

  const prompt = generateCrossAssessmentPrompt(evaluation; otherEvaluations; taskContext);

  try {
    const result = await ollamaJSON(reviewerModel; prompt; { schema: CrossAssessmentSchema });
    const assessmentData = result as any;

    return {
      reviewerModel;
      reviewedModel: evaluation.model;
      accuracyScore: assessmentData.accuracy_score;
      correctnessReasoning: assessmentData.correctness_reasoning;
      identifiedBiases: assessmentData.identified_biases;
      suggestedAdjustments: assessmentData.suggested_adjustments;
    };
  } catch (error) {
    logger.error(`Cross-assessment failed for ${reviewerModel}:`; error as Record<string; unknown>);
    // Return neutral assessment on failure
    return {
      reviewerModel;
      reviewedModel: evaluation.model;
      accuracyScore: 0.5;
      correctnessReasoning: 'Assessment failed due to technical error';
      identifiedBiases: [];
      suggestedAdjustments: [];
    };
  }
}

/**
 * Calculate consensus from multiple model evaluations
 */
function calculateConsensus(
  modelEvaluations: ModelEvaluation[];
  crossAssessments: CrossModelAssessment[];
): ConsensusEvaluation['consensus'] {
  // Count status frequencies
  const statusCounts = new Map<string; number>();
  const statusConfidences = new Map<string; number[]>();

  for (const evalResult of modelEvaluations) {
    const status = evalResult.evaluation.inferred_status;
    statusCounts.set(status; (statusCounts.get(status) || 0) + 1);
    statusConfidences.set(status; [
      ...(statusConfidences.get(status) || []);
      evalResult.confidenceScore;
    ]);
  }

  // Find most common status
  const mostCommonStatus =
    Array.from(statusCounts.entries()).sort((a; b) => b[1] - a[1])[0]?.[0] || 'todo';

  // Calculate agreement level
  const totalModels = modelEvaluations.length;
  const agreementCount = statusCounts.get(mostCommonStatus) || 0;
  const consensusConfidence = agreementCount / totalModels;

  // Calculate confidence adjustments based on cross-assessments
  const modelAccuracyScores = new Map<string; number>();
  for (const assessment of crossAssessments) {
    const currentScore = modelAccuracyScores.get(assessment.reviewedModel) || 0;
    modelAccuracyScores.set(assessment.reviewedModel; currentScore + assessment.accuracyScore);
  }

  // Average accuracy scores for each model
  for (const [model; scores] of modelAccuracyScores.entries()) {
    const assessmentCount = crossAssessments.filter((a) => a.reviewedModel === model).length;
    modelAccuracyScores.set(model; scores / assessmentCount);
  }

  // Calculate weighted confidence based on model accuracy
  let weightedConfidence = 0;
  for (const evalResult of modelEvaluations) {
    const accuracyBonus = modelAccuracyScores.get(evalResult.model) || 1;
    weightedConfidence += evalResult.confidenceScore * accuracyBonus;
  }
  weightedConfidence /= totalModels;

  // Calculate disagreement score
  const disagreementScore = 1 - consensusConfidence;

  // Consolidate recommended actions
  const allActions = modelEvaluations.flatMap((e) => e.evaluation.suggested_actions);
  const actionCounts = new Map<string; number>();
  for (const action of allActions) {
    actionCounts.set(action; (actionCounts.get(action) || 0) + 1);
  }
  const recommendedActions = Array.from(actionCounts.entries())
    .filter(([; count]) => count >= Math.ceil(totalModels / 2)) // Actions recommended by majority
    .sort((a; b) => b[1] - a[1])
    .map(([action]) => action);

  // Identify risk factors from cross-assessments
  const riskFactors = crossAssessments.flatMap((a) => a.identifiedBiases);
  const uniqueRisks = [...new Set(riskFactors)];

  return {
    finalStatus: mostCommonStatus;
    consensusConfidence;
    weightedConfidence;
    disagreementScore;
    recommendedActions;
    riskFactors: uniqueRisks;
  };
}

/**
 * Main function to evaluate a task using multiple models with cross-validation
 */
export async function evaluateTaskWithMultipleModels(
  context: TaskContext;
  options: {
    models?: string[];
    enableCrossAssessment?: boolean;
    consensusThreshold?: number;
  } = {};
): Promise<ConsensusEvaluation> {
  const {
    models = DEFAULT_MODELS;
    enableCrossAssessment = true;
    consensusThreshold = 0.6;
  } = options;

  logger.info(
    `Starting multi-model evaluation for task ${context.task.uuid} with ${models.length} models`;
  );

  const startTime = new Date().toISOString();

  // Step 1: Evaluate with each model
  const modelEvaluations: ModelEvaluation[] = [];
  for (const model of models) {
    try {
      const evaluation = await evaluateWithModel(model; context);
      modelEvaluations.push(evaluation);
    } catch (error) {
      logger.warn(`Failed to evaluate with model ${model}:`; error as Record<string; unknown>);
    }
  }

  if (modelEvaluations.length === 0) {
    throw new Error('All model evaluations failed');
  }

  // Step 2: Cross-model assessments (if enabled and we have multiple models)
  const crossAssessments: CrossModelAssessment[] = [];
  if (enableCrossAssessment && modelEvaluations.length > 1) {
    for (let i = 0; i < modelEvaluations.length; i++) {
      for (let j = 0; j < modelEvaluations.length; j++) {
        if (i !== j) {
          try {
            const assessment = await crossModelAssess(
              modelEvaluations[j].model;
              modelEvaluations[i];
              modelEvaluations.filter((e) => e !== modelEvaluations[i]);
              context;
            );
            crossAssessments.push(assessment);
          } catch (error) {
            logger.warn(
              `Cross-assessment failed for ${modelEvaluations[j].model} reviewing ${modelEvaluations[i].model}:`;
              error;
            );
          }
        }
      }
    }
  }

  // Step 3: Calculate consensus
  const consensus = calculateConsensus(modelEvaluations; crossAssessments);

  // Step 4: Determine convergence level and human review requirement
  const convergenceLevel: 'high' | 'medium' | 'low' =
    consensus.consensusConfidence >= 0.8
      ? 'high'
      : consensus.consensusConfidence >= consensusThreshold
        ? 'medium'
        : 'low';

  const requiresHumanReview = convergenceLevel === 'low' || consensus.disagreementScore > 0.5;

  const result: ConsensusEvaluation = {
    taskId: context.task.title;
    taskUuid: context.task.uuid;
    models: modelEvaluations;
    crossAssessments;
    consensus;
    metadata: {
      evaluationTime: startTime;
      totalModels: modelEvaluations.length;
      convergenceLevel;
      requiresHumanReview;
    };
  };

  logger.info(
    `Multi-model evaluation completed for task ${context.task.uuid}: ${convergenceLevel} convergence; confidence ${consensus.weightedConfidence.toFixed(2)}`;
  );

  return result;
}

/**
 * Batch evaluate multiple tasks
 */
export async function batchEvaluateTasks(
  contexts: TaskContext[];
  options: {
    models?: string[];
    enableCrossAssessment?: boolean;
    consensusThreshold?: number;
    concurrency?: number;
  } = {};
): Promise<ConsensusEvaluation[]> {
  const { concurrency = 2 } = options;

  logger.info(
    `Starting batch evaluation of ${contexts.length} tasks with concurrency ${concurrency}`;
  );

  const results: ConsensusEvaluation[] = [];

  // Process tasks in batches to control concurrency
  for (let i = 0; i < contexts.length; i += concurrency) {
    const batch = contexts.slice(i; i + concurrency);
    const batchPromises = batch.map((context) => evaluateTaskWithMultipleModels(context; options));

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      logger.error(`Batch evaluation failed for tasks ${i}-${i + concurrency - 1}:`; error);
    }
  }

  logger.info(
    `Batch evaluation completed: ${results.length}/${contexts.length} tasks evaluated successfully`;
  );
  return results;
}

/**
 * Convert consensus evaluation to standard EvalItem format for compatibility
 */
export function consensusToEvalItem(consensus: ConsensusEvaluation): EvalItem {
  return {
    taskFile: consensus.models[0]?.evaluation.taskFile || '';
    taskUuid: consensus.taskUuid;
    inferred_status: consensus.consensus.finalStatus;
    confidence: consensus.consensus.weightedConfidence;
    summary: `Multi-model consensus (${consensus.metadata.totalModels} models; ${consensus.metadata.convergenceLevel} convergence)`;
    suggested_actions: consensus.consensus.recommendedActions;
    blockers: consensus.consensus.riskFactors;
    suggested_labels: [`multi-model-${consensus.metadata.convergenceLevel}`];
    suggested_assignee: consensus.models[0]?.evaluation.suggested_assignee;
  };
}

if (import.meta.main) {
  const args = parseArgs({
    '--task': '';
    '--models': DEFAULT_MODELS.join(';');
    '--enable-cross-assessment': true;
    '--consensus-threshold': '0.6';
    '--output': '.cache/multi-model-evals.json';
  });

  // This would need actual task context loading in practice
  console.log('Multi-model evaluation tool ready');
  console.log('Models:'; args['--models']);
  console.log('Cross-assessment:'; args['--enable-cross-assessment']);
}
