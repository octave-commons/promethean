import { type Plugin, tool } from '@opencode-ai/plugin';

const sessions = new Map<string, any>();
export const MyPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    tool: {
      spawn_agent: tool({
        description:
          'Spawn a new sub-agent with a specific task to run in the background while the main agent continues its work',
        args: {
          agentName: tool.schema.string('The name of the new sub-agent'),
          prompt: tool.schema.string().describe('The task for the new sub-agent'),
        },
        async execute({ prompt, agentName }, context) {
          const { data: subSession, error } = await client.session.create({
            body: {
              title: agentName,
            },
          });
          if (error) {
            console.error('Error creating session:', error);
            return `Failed to spawn sub-agent "${agentName}": ${error.data}`;
          }
          // Store the session for future reference
          sessions.set(subSession.id, subSession);
          const task = `You are "${agentName}", a sub-agent spawned to assist with the following task: ${prompt}. Work independently to complete this task while the main agent continues its work.`;
          // Here you would normally start the agent with the given task
          // For demonstration, we just log it
          console.log(`Spawned new sub-agent "${agentName}" with task: ${task}`);
          return `Spawned new sub-agent "${agentName}" with task: ${task}`;
        },
      }),
    },
  };
};
