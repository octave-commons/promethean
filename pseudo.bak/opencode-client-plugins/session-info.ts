// SPDX-License-Identifier: GPL-3.0-only
// Session Info plugin - wraps session info tool with client injection

import type { Plugin } from '@opencode-ai/plugin';
import sessionInfoTool from '../tools/session-info.js';

export const SessionInfoPlugin: Plugin = async ({ client }) => {
  return {
    tool: {
      'session_info': {
        ...sessionInfoTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return sessionInfoTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
