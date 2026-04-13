import { serve } from 'bun';
import { app } from './api';

const PORT = process.env.CHRONOS_PORT || 5199;

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⏱️  CHRONOS - Time Tracker for Contracting              ║
║                                                           ║
║   Dashboard:  http://localhost:${PORT}                      ║
║   API:        http://localhost:${PORT}/api                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

serve({
  port: PORT,
  fetch: app.fetch,
  development: true
});