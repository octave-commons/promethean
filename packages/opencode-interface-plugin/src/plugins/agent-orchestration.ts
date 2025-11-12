// SPDX-License-Identifier: GPL-3.0-only
// Agent Orchestration plugin (session lifecycle + prompts)

import type { Plugin, PluginInput } from '@opencode-ai/plugin';

import { createPluginRuntime } from '../shared/runtime.js';
import { createSessionTools } from '../tools/sessions.js';
import { createMessageMutationTools } from '../tools/messages.js';

export const AgentOrchestrationPlugin: Plugin = async (pluginContext: PluginInput) => {
  const runtime = await createPluginRuntime(pluginContext);

  return {
    tool: {
      ...createSessionTools(runtime.opencodeClient),
      ...createMessageMutationTools(runtime.opencodeClient),
    },
  };
};

export default AgentOrchestrationPlugin;
