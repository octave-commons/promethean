# Proper Async Agent Management Solution

## Issue Identified
The initial spawn-session attempts were successful but the sessions weren't appearing in the dual store properly. This is because the basic spawn-session tool doesn't integrate with the full agent task management system.

## Proper Solution Found
The file `/home/err/devel/promethean/.opencode/pseudo/async-sub-agents-final.ts` contains the complete async agent management system with:

1. **Agent Task Management**: Full lifecycle tracking with status updates
2. **Dual Store Integration**: Proper storage and retrieval of agent tasks
3. **Inter-Agent Communication**: Message passing between agents
4. **Monitoring and Cleanup**: Automated task monitoring and cleanup
5. **Event Processing**: Real-time session event handling

## Key Components
- **AgentTaskManager**: Creates, tracks, and manages agent tasks
- **SessionUtils**: Handles session operations and message processing
- **MessageProcessor**: Processes messages and detects task completion
- **EventProcessor**: Handles session events (idle, updated, message updates)
- **InterAgentMessenger**: Enables communication between agents

## Proper Agent Spawning Process
1. Use the `spawn_session` tool from the plugin
2. Create agent task with proper tracking
3. Send initial prompt with task description
4. Monitor status through the agent task management system
5. Handle completion detection and cleanup

## Next Steps
1. Use the proper opencode plugin system to spawn agents
2. Integrate with the existing agent task management
3. Monitor progress through the proper monitoring tools
4. Ensure proper cleanup and status tracking

## Agent Types Available
Based on the `.opencode/agent/` directory:
- async-process-manager (for complex workflows)
- security-specialist (for security tasks)
- task-architect (for design tasks)
- fullstack-developer (for implementation)
- integration-tester (for testing)
- session-manager (for coordination)
- And others specialized agents

## Implementation Strategy
1. Create a session-manager agent to coordinate the overall effort
2. Spawn specialized agents for each task type
3. Use inter-agent communication for coordination
4. Monitor progress through the agent task management system
5. Handle completion and cleanup properly