---
uuid: (uuidgen)
title: Implement multi-model evaluation for boardrev
status: icebox
priority: P2
labels: [enhancement, boardrev, ai, evaluation]
created_at: 2025-10-06T12:00:00Z
---

# Implement multi-model evaluation for boardrev

## Description
Current implementation uses single Ollama model (qwen3:4b) for all evaluations. Need model ensemble for different evaluation aspects and improved accuracy.

## Proposed Solution
- Light model for initial task triage and filtering
- Strong model for complex task analysis
- Specialized model for blocker detection and risk assessment
- Model confidence aggregation and voting system
- Fallback strategies for unavailable models

## Benefits
- Better evaluation accuracy through model specialization
- Improved confidence calibration
- Graceful degradation when models unavailable
- Cost optimization through appropriate model selection
- Redundancy and reliability improvements

## Acceptance Criteria
- [ ] Model selection strategy implemented
- [ ] Confidence aggregation algorithm
- [ ] Specialized evaluation prompts for different models
- [ ] Fallback and retry mechanisms
- [ ] Performance benchmarks showing accuracy improvement
- [ ] Cost analysis and optimization

## Technical Details
- **Files to modify**: `src/05-evaluate.ts`, `src/types.ts`
- **New components**: `ModelSelector`, `ConfidenceAggregator`, `EvaluationEnsemble`
- **Model configuration**: JSON config file with model endpoints and capabilities
- **Aggregation strategies**: Weighted voting, confidence-weighted averaging, Bayesian model combination

## Notes
Should maintain current single-model behavior as default while adding multi-model capabilities as optional enhancement.
