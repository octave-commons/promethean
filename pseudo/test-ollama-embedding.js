// Test script for Ollama embedding integration
async function testOllamaEmbedding() {
  console.log('Testing Ollama embedding integration...');

  try {
    // Test submitting an embedding job
    console.log('Submitting embedding job...');
    const jobResponse = await ollamaQueueSubmitJob({
      jobName: `test-embedding-${Date.now()}`,
      modelName: 'nomic-embed-text:latest',
      jobType: 'embedding',
      input: 'This is a test prompt for embedding generation',
      priority: 'medium',
      options: {
        temperature: 0.0,
      },
    });

    console.log('Job submitted:', jobResponse);

    if (!jobResponse || !jobResponse.jobId) {
      throw new Error('Failed to submit embedding job');
    }

    const jobId = jobResponse.jobId;
    console.log('Job ID:', jobId);

    // Wait for job completion
    console.log('Waiting for job completion...');
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const status = await ollamaQueueGetJobStatus({ jobId });
      console.log(`Attempt ${attempts + 1}: Status =`, status);

      if (status.status === 'completed') {
        console.log('Job completed!');
        const result = await ollamaQueueGetJobResult({ jobId });
        console.log('Embedding result:', result);

        if (result && result.embedding) {
          const embedding = Array.isArray(result.embedding)
            ? result.embedding
            : result.embedding.data;
          console.log(`Embedding dimension: ${embedding.length}`);
          console.log('First 5 values:', embedding.slice(0, 5));
          return true;
        } else {
          throw new Error('No embedding in result');
        }
      }

      if (status.status === 'failed') {
        throw new Error(`Job failed: ${status.error || 'Unknown error'}`);
      }

      if (status.status === 'canceled') {
        throw new Error('Job was canceled');
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Job timed out');
  } catch (error) {
    console.error('Error testing Ollama embedding:', error);
    return false;
  }
}

// Run the test
testOllamaEmbedding()
  .then((success) => {
    console.log('Test result:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test error:', error);
    process.exit(1);
  });
