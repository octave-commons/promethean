// SPDX-License-Identifier: GPL-3.0-only
// Direct Process plugin - wraps direct process tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import * as directProcessTools from '../tools/process.js';

export const DirectProcessPlugin: Plugin = async ({ client }) => {
  // Extract all direct process tools
  const { start, stop, list, status, tail, err } = directProcessTools;

  return {
    tool: {
      'directProcess.start': {
        ...start,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return start.execute(args, enhancedContext);
        },
      },
      'directProcess.stop': {
        ...stop,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return stop.execute(args, enhancedContext);
        },
      },
      'directProcess.list': {
        ...list,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return list.execute(args, enhancedContext);
        },
      },
      'directProcess.status': {
        ...status,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return status.execute(args, enhancedContext);
        },
      },
      'directProcess.tail': {
        ...tail,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return tail.execute(args, enhancedContext);
        },
      },
      'directProcess.err': {
        ...err,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return err.execute(args, enhancedContext);
        },
      },
    },
  };
};
