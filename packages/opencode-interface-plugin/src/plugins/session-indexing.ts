// SPDX-License-Identifier: GPL-3.0-only
// Session Indexing plugin (read-only tooling)

import type { Plugin, PluginInput } from '@opencode-ai/plugin';

import { createPluginRuntime } from '../shared/runtime.js';
import { createContextTools } from '../tools/context.js';
import { createEventTools } from '../tools/events.js';
import { createReadOnlyMessageTools } from '../tools/messages.js';

export const SessionIndexingPlugin: Plugin = async (pluginContext: PluginInput) => {
  const runtime = await createPluginRuntime(pluginContext);

  return {
    tool: {
      ...createContextTools(),
      ...createEventTools(),
      ...createReadOnlyMessageTools(runtime.opencodeClient),
    },
  };
};

export default SessionIndexingPlugin;
