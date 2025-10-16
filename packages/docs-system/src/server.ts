/**
 * Server startup script for the Promethean Documentation System
 */

import { app } from './server/index.js';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Promethean Documentation System API Server running on http://${HOST}:${PORT}`);
  console.log(`📚 API Documentation: http://${HOST}:${PORT}/api-docs`);
  console.log(`💚 Health Check: http://${HOST}:${PORT}/health`);
});