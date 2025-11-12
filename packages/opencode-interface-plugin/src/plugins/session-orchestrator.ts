// SPDX-License-Identifier: GPL-3.0-only
// Session Orchestrator plugin combines session indexing + agent orchestration

import type { Plugin, PluginInput } from '@opencode-ai/plugin';

import { createPluginRuntime } from '../shared/runtime.js';
import { createContextTools } from '../tools/context.js';
import { createEventTools } from '../tools/events.js';
import { createReadOnlyMessageTools, createMessageMutationTools } from '../tools/messages.js';
import { createSessionTools } from '../tools/sessions.js';

export const SessionOrchestratorPlugin: Plugin = async (pluginContext: PluginInput) => {
  const runtime = await createPluginRuntime(pluginContext);

  return {
    tool: {
      ...createContextTools(),
      ...createEventTools(),
      ...createReadOnlyMessageTools(runtime.opencodeClient),
      ...createSessionTools(runtime.opencodeClient),
      ...createMessageMutationTools(runtime.opencodeClient),
    },
  };
};

export default SessionOrchestratorPlugin;
