// SPDX-License-Identifier: GPL-3.0-only
// Process plugin - wraps all process factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import { processToolFactories } from '../factories/index.js';

export const ProcessPlugin: Plugin = async ({ client }) => {
  // Inject client into all process tools
  const startProcessTool = processToolFactories.createStartProcessTool();
  const stopProcessTool = processToolFactories.createStopProcessTool();
  const listProcessesTool = processToolFactories.createListProcessesTool();
  const processStatusTool = processToolFactories.createProcessStatusTool();
  const tailProcessLogsTool = processToolFactories.createTailProcessLogsTool();
  const tailProcessErrorTool = processToolFactories.createTailProcessErrorTool();

  return {
    tool: {
      'process_start': {
        ...startProcessTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return startProcessTool.execute(args, enhancedContext);
        },
      },
      'process_stop': {
        ...stopProcessTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return stopProcessTool.execute(args, enhancedContext);
        },
      },
      'process_list': {
        ...listProcessesTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return listProcessesTool.execute(args, enhancedContext);
        },
      },
      'process_status': {
        ...processStatusTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return processStatusTool.execute(args, enhancedContext);
        },
      },
      'process_tailLogs': {
        ...tailProcessLogsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return tailProcessLogsTool.execute(args, enhancedContext);
        },
      },
      'process_tailError': {
        ...tailProcessErrorTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return tailProcessErrorTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
