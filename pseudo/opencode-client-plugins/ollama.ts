// SPDX-License-Identifier: GPL-3.0-only
// Ollama plugin - wraps all ollama factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import { ollamaToolFactories } from '../factories/index.js';

export const OllamaPlugin: Plugin = async ({ client }) => {
  // Inject client into all ollama tools
  const submitJobTool = ollamaToolFactories.createSubmitJobTool();
  const getJobStatusTool = ollamaToolFactories.createGetJobStatusTool();
  const getJobResultTool = ollamaToolFactories.createGetJobResultTool();
  const listJobsTool = ollamaToolFactories.createListJobsTool();
  const cancelJobTool = ollamaToolFactories.createCancelJobTool();
  const listModelsTool = ollamaToolFactories.createListModelsTool();
  const getQueueInfoTool = ollamaToolFactories.createGetQueueInfoTool();
  const manageCacheTool = ollamaToolFactories.createManageCacheTool();
  const submitFeedbackTool = ollamaToolFactories.createSubmitFeedbackTool();

  return {
    tool: {
      'ollama_submitJob': {
        ...submitJobTool,
        async execute(args: any, context: any) {
          // Inject client into context
          const enhancedContext = { ...context, client };
          return submitJobTool.execute(args, enhancedContext);
        },
      },
      'ollama_getJobStatus': {
        ...getJobStatusTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getJobStatusTool.execute(args, enhancedContext);
        },
      },
      'ollama_getJobResult': {
        ...getJobResultTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getJobResultTool.execute(args, enhancedContext);
        },
      },
      'ollama_listJobs': {
        ...listJobsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return listJobsTool.execute(args, enhancedContext);
        },
      },
      'ollama_cancelJob': {
        ...cancelJobTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return cancelJobTool.execute(args, enhancedContext);
        },
      },
      'ollama_listModels': {
        ...listModelsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return listModelsTool.execute(args, enhancedContext);
        },
      },
      'ollama_getQueueInfo': {
        ...getQueueInfoTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getQueueInfoTool.execute(args, enhancedContext);
        },
      },
      'ollama_manageCache': {
        ...manageCacheTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return manageCacheTool.execute(args, enhancedContext);
        },
      },
      'ollama_submitFeedback': {
        ...submitFeedbackTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return submitFeedbackTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
