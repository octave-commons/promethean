/**
 * Sintel Test Suite
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// ============================================================================
// Core Types Tests
// ============================================================================

describe('Core Types', () => {
  it('should define strategy tiers', async () => {
    const { TIER_AUTHORIZATION } = await import('../dist/index.js');
    assert.ok(TIER_AUTHORIZATION.passive);
    assert.ok(TIER_AUTHORIZATION.bounded);
    assert.ok(TIER_AUTHORIZATION.unrestricted);
  });

  it('should define confidence weight factors', async () => {
    const { STRATEGY_TRUST_WEIGHTS, STRATEGY_FRESHNESS_FACTORS } = await import('../dist/index.js');
    assert.strictEqual(STRATEGY_TRUST_WEIGHTS.passive, 0.9);
    assert.strictEqual(STRATEGY_TRUST_WEIGHTS.bounded, 0.7);
    assert.strictEqual(STRATEGY_TRUST_WEIGHTS.unrestricted, 0.4);
  });
});

// ============================================================================
// Workflow Engine Tests
// ============================================================================

describe('Workflow Engine', () => {
  it('should create a workflow', async () => {
    const { WorkflowEngine, InMemoryWorkflowStore } = await import('../dist/index.js');
    
    const store = new InMemoryWorkflowStore();
    const engine = new WorkflowEngine(store);
    
    const workflow = await engine.create({
      goal: 'Test workflow',
      strategy: 'passive',
      exclusions: { global: [], org: [], workflow: [], effective: [] },
      created_by: 'test-user'
    });
    
    assert.ok(workflow.id);
    assert.strictEqual(workflow.state, 'dormant');
    assert.strictEqual(workflow.strategy, 'passive');
  });

  it('should transition workflow states', async () => {
    const { WorkflowEngine, InMemoryWorkflowStore } = await import('../dist/index.js');
    
    const store = new InMemoryWorkflowStore();
    const engine = new WorkflowEngine(store);
    
    const workflow = await engine.create({
      goal: 'Test transitions',
      strategy: 'passive',
      exclusions: { global: [], org: [], workflow: [], effective: [] },
      created_by: 'test-user'
    });
    
    // dormant -> discovering
    await engine.transition(workflow.id, 'discovering', 'test-user');
    const discovering = await store.get(workflow.id);
    assert.strictEqual(discovering?.state, 'discovering');
    
    // discovering -> verifying
    await engine.transition(workflow.id, 'verifying', 'test-user');
    const verifying = await store.get(workflow.id);
    assert.strictEqual(verifying?.state, 'verifying');
  });

  it('should reject invalid transitions', async () => {
    const { WorkflowEngine, InMemoryWorkflowStore } = await import('../dist/index.js');
    
    const store = new InMemoryWorkflowStore();
    const engine = new WorkflowEngine(store);
    
    const workflow = await engine.create({
      goal: 'Invalid transitions',
      strategy: 'passive',
      exclusions: { global: [], org: [], workflow: [], effective: [] },
      created_by: 'test-user'
    });
    
    // dormant -> resolved is invalid
    await assert.rejects(
      async () => engine.transition(workflow.id, 'resolved', 'test-user'),
      /Invalid transition/
    );
  });
});

// ============================================================================
// Exclusion Policy Tests
// ============================================================================

describe('Exclusion Policy', () => {
  it('should have constitutional exclusions', async () => {
    const { CONSTITUTIONAL_EXCLUSIONS } = await import('../dist/index.js');
    
    assert.ok(CONSTITUTIONAL_EXCLUSIONS.length >= 5);
    assert.ok(CONSTITUTIONAL_EXCLUSIONS.some(e => e.category === 'private_residential'));
    assert.ok(CONSTITUTIONAL_EXCLUSIONS.some(e => e.category === 'healthcare'));
    assert.ok(CONSTITUTIONAL_EXCLUSIONS.some(e => e.category === 'critical_infrastructure'));
  });

  it('should check exclusion patterns', async () => {
    const { ExclusionPolicy, InMemoryExclusionStore, CONSTITUTIONAL_EXCLUSIONS } = await import('../dist/index.js');
    
    const store = new (InMemoryExclusionStore as any)();
    const policy = new ExclusionPolicy(store);
    
    // Use constitutional exclusions as effective
    const exclusions = {
      global: CONSTITUTIONAL_EXCLUSIONS,
      org: [],
      workflow: [],
      effective: CONSTITUTIONAL_EXCLUSIONS
    };
    
    // Educational domain should be excluded
    const eduTarget = {
      id: 'test-1',
      hostname: 'test.university.edu',
      scope: 'test'
    };
    
    const excluded = policy.isExcluded(eduTarget, exclusions);
    assert.ok(excluded);
    assert.strictEqual(excluded?.exclusion.category, 'educational_institutions');
  });
});

// ============================================================================
// Signal Aggregator Tests
// ============================================================================

describe('Signal Aggregator', () => {
  it('should create aggregator', async () => {
    const { createAggregator } = await import('../dist/index.js');
    
    const aggregator = createAggregator({});
    assert.ok(aggregator);
  });

  it('should aggregate signals for target', async () => {
    const { SignalAggregator, CONSTITUTIONAL_EXCLUSIONS } = await import('../dist/index.js');
    
    const aggregator = new SignalAggregator({
      passive_sources: ['dns'],
      bounded_sources: []
    });
    
    const target = {
      id: 'test-target-1',
      hostname: 'example.com',
      scope: 'test'
    };
    
    const exclusions = {
      global: CONSTITUTIONAL_EXCLUSIONS,
      org: [],
      workflow: [],
      effective: CONSTITUTIONAL_EXCLUSIONS
    };
    
    const result = await aggregator.aggregate(target, exclusions);
    
    assert.ok(result.target);
    assert.ok(Array.isArray(result.signals));
    assert.ok(Array.isArray(result.observations));
  });

  it('should exclude targets matching exclusion patterns', async () => {
    const { SignalAggregator, CONSTITUTIONAL_EXCLUSIONS } = await import('../dist/index.js');
    
    const aggregator = new SignalAggregator({});
    
    // Educational target should be excluded
    const target = {
      id: 'test-edu',
      hostname: 'test.k12.school.edu',
      scope: 'test'
    };
    
    const exclusions = {
      global: CONSTITUTIONAL_EXCLUSIONS,
      org: [],
      workflow: [],
      effective: CONSTITUTIONAL_EXCLUSIONS
    };
    
    const result = await aggregator.aggregate(target, exclusions);
    
    assert.strictEqual(result.combined_confidence, 0);
    assert.ok(result.risk_indicators.some(r => r.name === 'excluded'));
  });
});

// ============================================================================
// Entity Promotion Tests
// ============================================================================

describe('Entity Promotion', () => {
  it('should check promotion requirements', async () => {
    const { PromotionEngine, InMemoryEntityStore, PROMOTION_REQUIREMENTS } = await import('../dist/index.js');
    
    const store = new (InMemoryEntityStore as any)();
    const engine = new PromotionEngine(store);
    
    // Low confidence observation should fail
    const lowConfidence = {
      id: 'test-obs-1',
      workflow_id: 'test-wf-1',
      provenance: {
        collector_id: 'test-collector',
        collector_name: 'Test',
        strategy: 'passive',
        exclusions_snapshot: { global: [], org: [], workflow: [], effective: [] },
        started_at: new Date().toISOString()
      },
      evidence: {
        type: 'dns_record',
        raw: {},
        metadata: {},
        collected_at: new Date().toISOString()
      },
      confidence: {
        source_trust: 0.5,
        freshness: 0.5,
        corroboration: 0,
        strategy_risk: 0.1,
        overall: 0.3
      },
      state: 'raw',
      created_at: new Date().toISOString()
    };
    
    const check = engine.checkPromotion(lowConfidence);
    assert.strictEqual(check.can_promote, false);
    assert.ok(check.reason.includes('Confidence'));
  });
});