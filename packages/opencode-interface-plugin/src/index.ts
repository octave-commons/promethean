// SPDX-License-Identifier: GPL-3.0-only
// Public exports for the Session Orchestrator plugin package

import { SessionOrchestratorPlugin } from './plugins/session-orchestrator.js';

export { SessionOrchestratorPlugin } from './plugins/session-orchestrator.js';
export { SessionIndexingPlugin } from './plugins/session-indexing.js';
export { AgentOrchestrationPlugin } from './plugins/agent-orchestration.js';

// Backwards compatibility alias until external consumers migrate
export const OpencodeInterfacePlugin = SessionOrchestratorPlugin;

export default SessionOrchestratorPlugin;
