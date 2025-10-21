import { BuildFixBenchmark } from './index.js';

async function quickTest() {
  const benchmark = new BuildFixBenchmark('./benchmark-temp');

  try {
    console.log('🧪 Quick test with qwen3:4b on one fixture');

    await benchmark.setup();

    // Test just one fixture and one model
    const { fixtures } = await import('./fixtures.js');
    const fixture = fixtures[0]; // missing-export
    if (!fixture) {
      throw new Error('No fixtures found');
    }

    const result = await benchmark.runSingleBenchmark(
      fixture,
      {
        name: 'qwen3:4b',
        model: 'qwen3:4b',
      },
      1,
    );

    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await benchmark.cleanup();
  }
}

quickTest();
