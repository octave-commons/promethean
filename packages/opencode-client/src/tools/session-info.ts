import { tool } from '@opencode-ai/plugin/tool';

export default tool({
  description: 'Get project and session information',
  args: {},
  async execute(_args, context) {
    // Access context information
    const { agent, sessionID, messageID } = context;
    return `Agent: ${agent}, Session: ${sessionID}, Message: ${messageID}`;
  },
});
