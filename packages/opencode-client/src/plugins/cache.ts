// SPDX-License-Identifier: GPL-3.0-only
// Cache plugin - wraps all cache factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import { cacheToolFactories } from '../factories/index.js';

export const CachePlugin: Plugin = async ({ client }) => {
  // Inject client into all cache tools
  const initializeCacheTool = cacheToolFactories.createInitializeCacheTool();
  const checkCacheTool = cacheToolFactories.createCheckCacheTool();
  const createCacheKeyTool = cacheToolFactories.createCreateCacheKeyTool();
  const storeInCacheTool = cacheToolFactories.createStoreInCacheTool();
  const manageCacheTool = cacheToolFactories.createManageCacheTool();

  return {
    tool: {
      'cache.initialize': {
        ...initializeCacheTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return initializeCacheTool.execute(args, enhancedContext);
        },
      },
      'cache.check': {
        ...checkCacheTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return checkCacheTool.execute(args, enhancedContext);
        },
      },
      'cache.createKey': {
        ...createCacheKeyTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return createCacheKeyTool.execute(args, enhancedContext);
        },
      },
      'cache.store': {
        ...storeInCacheTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return storeInCacheTool.execute(args, enhancedContext);
        },
      },
      'cache.manage': {
        ...manageCacheTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return manageCacheTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
