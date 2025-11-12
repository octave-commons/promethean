// SPDX-License-Identifier: GPL-3.0-only
// Re-export Session Orchestrator plugin implementations from the shared package

export {
  SessionOrchestratorPlugin,
  SessionIndexingPlugin,
  AgentOrchestrationPlugin,
  SessionOrchestratorPlugin as OpencodeInterfacePlugin,
} from '@promethean-os/opencode-interface-plugin';

export { default } from '@promethean-os/opencode-interface-plugin';
