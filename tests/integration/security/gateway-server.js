const fastify = require('fastify');

const app = fastify({ logger: true });

app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

app.get('/api/public', async (request, reply) => {
  return { message: 'Public endpoint accessible' };
});

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Fastify gateway listening on port 3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await app.close();
  process.exit(0);
});

start();
