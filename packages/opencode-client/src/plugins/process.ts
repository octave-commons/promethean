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
      'process.start': {
        ...startProcessTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return startProcessTool.execute(args, enhancedContext);
        },
      },
      'process.stop': {
        ...stopProcessTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return stopProcessTool.execute(args, enhancedContext);
        },
      },
      'process.list': {
        ...listProcessesTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return listProcessesTool.execute(args, enhancedContext);
        },
      },
      'process.status': {
        ...processStatusTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return processStatusTool.execute(args, enhancedContext);
        },
      },
      'process.tailLogs': {
        ...tailProcessLogsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return tailProcessLogsTool.execute(args, enhancedContext);
        },
      },
      'process.tailError': {
        ...tailProcessErrorTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return tailProcessErrorTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
