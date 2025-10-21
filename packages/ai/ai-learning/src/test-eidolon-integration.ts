// Test file to verify eidolon field integration
import { EidolonFieldClassifier } from './eidolon-field-classifier.js';

async function testEidolonIntegration(): Promise<void> {
  console.log('Testing Eidolon Field Integration...');

  const classifier = new EidolonFieldClassifier(1536, 8);

  try {
    // Add some test tasks
    await classifier.addTask('task1', 'Implement user authentication', 'security', 0.8);
    await classifier.addTask('task2', 'Create database schema', 'database', 0.9);
    await classifier.addTask('task3', 'Build REST API endpoints', 'backend', 0.7);
    await classifier.addTask('task4', 'Design user interface', 'frontend', 0.6);

    console.log('Added 4 test tasks');

    // Classify a new task
    const result = await classifier.classifyTask('task5', 'Implement login functionality');
    console.log('Classification result:', result);

    // Get field stats
    const stats = await classifier.getFieldStats();
    console.log('Field stats:', stats);

    console.log('✅ Eidolon field integration test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  testEidolonIntegration().catch(console.error);
}

export { testEidolonIntegration };
