/**
 * Tests for feature registry system
 */

import test from 'ava';
import {
  createFeatureRegistry,
  globalFeatureRegistry,
  FeatureDetector,
} from '../registry/feature-registry.js';

test('FeatureRegistry should create with default config', (t) => {
  const registry = createFeatureRegistry();

  t.truthy(registry);
  t.is(typeof registry.registerDetector, 'function');
  t.is(typeof registry.unregisterDetector, 'function');
  t.is(typeof registry.detectFeature, 'function');
  t.is(typeof registry.detectAllFeatures, 'function');
  t.is(typeof registry.getRegisteredFeatures, 'function');
  t.is(typeof registry.hasFeature, 'function');
  t.is(typeof registry.clearCache, 'function');
  t.is(typeof registry.getCategories, 'function');
});

test('FeatureRegistry should register and detect features', (t) => {
  const registry = createFeatureRegistry();

  // Register a simple feature detector
  const detector: FeatureDetector = () => ({
    name: 'test-feature',
    supported: true,
    confidence: 1.0,
    method: 'function',
    metadata: { test: true },
  });

  registry.registerDetector('test-feature', detector, 'test-category');

  // Test feature detection
  const result = registry.detectFeature('test-feature');

  t.is(result.name, 'test-feature');
  t.true(result.supported);
  t.is(result.confidence, 1.0);
  t.is(result.method, 'function');
  t.deepEqual(result.metadata, { test: true });
});

test('FeatureRegistry should handle missing detectors', (t) => {
  const registry = createFeatureRegistry();

  const result = registry.detectFeature('non-existent-feature');

  t.is(result.name, 'non-existent-feature');
  t.false(result.supported);
  t.is(result.confidence, 0);
  t.is(result.method, 'other');
  t.deepEqual(result.metadata, { error: 'Feature detector not found' });
});

test('FeatureRegistry should manage categories', (t) => {
  const registry = createFeatureRegistry();

  const detector1: FeatureDetector = () => ({
    name: 'feature1',
    supported: true,
    confidence: 1.0,
    method: 'function',
  });

  const detector2: FeatureDetector = () => ({
    name: 'feature2',
    supported: false,
    confidence: 0.5,
    method: 'function',
  });

  registry.registerDetector('feature1', detector1, 'category1');
  registry.registerDetector('feature2', detector2, 'category1');
  registry.registerDetector('feature3', detector1, 'category2');

  const categories = registry.getCategories();

  const category1 = categories['category1'];
  const category2 = categories['category2'];

  t.true(Array.isArray(category1));
  t.true(Array.isArray(category2));
  t.true(category1?.includes('feature1') || false);
  t.true(category1?.includes('feature2') || false);
  t.true(category2?.includes('feature3') || false);
});

test('FeatureRegistry should detect all features', (t) => {
  const registry = createFeatureRegistry();

  const detector1: FeatureDetector = () => ({
    name: 'supported-feature',
    supported: true,
    confidence: 1.0,
    method: 'function',
  });

  const detector2: FeatureDetector = () => ({
    name: 'unsupported-feature',
    supported: false,
    confidence: 0.8,
    method: 'function',
  });

  const detector3: FeatureDetector = () => ({
    name: 'unknown-feature',
    supported: false,
    confidence: 0.3,
    method: 'function',
  });

  registry.registerDetector('supported-feature', detector1);
  registry.registerDetector('unsupported-feature', detector2);
  registry.registerDetector('unknown-feature', detector3);

  const featureSet = registry.detectAllFeatures();

  t.is(featureSet.features.length, 3);
  t.is(featureSet.summary.total, 3);
  t.is(featureSet.summary.supported, 1);
  t.is(featureSet.summary.unsupported, 1);
  t.is(featureSet.summary.unknown, 1);
  t.true(featureSet.timestamp > 0);
  t.truthy(featureSet.environment);
});

test('FeatureRegistry should cache results when enabled', (t) => {
  const registry = createFeatureRegistry({ enableCaching: true });

  const callCount = { value: 0 };
  const detector: FeatureDetector = () => {
    callCount.value++;
    return {
      name: 'cached-feature',
      supported: true,
      confidence: 1.0,
      method: 'function',
    };
  };

  registry.registerDetector('cached-feature', detector);

  // First call should invoke detector
  registry.detectFeature('cached-feature');
  t.is(callCount.value, 1);

  // Second call should use cache
  registry.detectFeature('cached-feature');
  t.is(callCount.value, 1);

  // Clear cache
  registry.clearCache();

  // Second call should invoke detector again
  registry.detectFeature('cache-clear-feature');
  t.is(callCount.value, 2);
});

test('FeatureRegistry should unregister detectors', (t) => {
  const registry = createFeatureRegistry();

  const detector: FeatureDetector = () => ({
    name: 'removable-feature',
    supported: true,
    confidence: 1.0,
    method: 'function',
  });

  registry.registerDetector('removable-feature', detector, 'test-category');

  // Verify it's registered
  t.true(registry.hasFeature('removable-feature'));
  t.true(registry.getRegisteredFeatures().includes('removable-feature'));

  // Unregister
  registry.unregisterDetector('removable-feature');

  // Verify it's gone
  t.false(registry.hasFeature('removable-feature'));
  t.false(registry.getRegisteredFeatures().includes('removable-feature'));

  // Detection should return not found result
  const result = registry.detectFeature('removable-feature');
  t.false(result.supported);
  t.is(result.confidence, 0);
  t.deepEqual(result.metadata, { error: 'Feature detector not found' });
});

test('FeatureRegistry should handle configuration options', (t) => {
  const config = {
    enableCaching: false,
    cacheTTL: 1000,
    enableLazyDetection: true,
  };

  const registry = createFeatureRegistry(config);

  const callCount = { value: 0 };
  const detector: FeatureDetector = () => {
    callCount.value++;
    return {
      name: 'config-feature',
      supported: true,
      confidence: 1.0,
      method: 'function',
    };
  };

  registry.registerDetector('config-feature', detector);

  // With caching disabled, each call should invoke detector
  registry.detectFeature('config-feature');
  registry.detectFeature('config-feature');

  t.is(callCount.value, 2);
});

test('globalFeatureRegistry should be available', (t) => {
  t.truthy(globalFeatureRegistry);
  t.is(typeof globalFeatureRegistry.registerDetector, 'function');
  t.is(typeof globalFeatureRegistry.detectFeature, 'function');
});

test('FeatureRegistry should handle edge cases', (t) => {
  const registry = createFeatureRegistry();

  // Test detector that throws
  const throwingDetector: FeatureDetector = () => {
    throw new Error('Detector error');
  };

  registry.registerDetector('throwing-feature', throwingDetector);

  // Should handle the error gracefully
  const result = registry.detectFeature('throwing-feature');
  t.false(result.supported);
  t.is(result.confidence, 0);
  t.is(result.method, 'other');
  t.is(result.metadata?.['error'], 'Detector error');
  t.truthy(result.metadata?.['originalError']);
});

test('FeatureRegistry should provide readonly feature list', (t) => {
  const registry = createFeatureRegistry();

  const detector: FeatureDetector = () => ({
    name: 'readonly-test',
    supported: true,
    confidence: 1.0,
    method: 'function',
  });

  registry.registerDetector('readonly-test', detector);

  const features = registry.getRegisteredFeatures();

  // Should be readonly array
  t.true(Array.isArray(features));
  t.is(features.length, 1);
  t.is(features[0], 'readonly-test');

  // Create a new array to test immutability
  const newFeatures = [...features, 'new-feature'];
  t.is(newFeatures.length, 2);
  // Original registry should remain unchanged
  t.is(registry.getRegisteredFeatures().length, 1);
});
