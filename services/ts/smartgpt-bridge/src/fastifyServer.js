import { configDotenv } from 'dotenv';
import { buildFastifyApp } from './fastifyApp.js';

try {
    configDotenv();
} catch {}

const PORT = Number(process.env.PORT || 3210);
const ROOT_PATH = process.env.ROOT_PATH || process.cwd();
const app = buildFastifyApp(ROOT_PATH);

app.listen({ port: PORT, host: '0.0.0.0' })
    .then(() => {
        console.log(`SmartGPT bridge (fastify) listening on http://0.0.0.0:${PORT}`);
    })
    .catch((err) => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
