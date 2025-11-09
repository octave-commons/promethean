// Kanban Async Agent Coordination Script
// This script demonstrates the proper approach to spawn async agents for kanban tasks

import { tool } from '@opencode-ai/plugin/tool';

interface KanbanTask {
  uuid: string;
  title: string;
  priority: string;
  agentType: string;
  description: string;
  requirements: string[];
}

// Tasks currently in "in_progress" column from kanban board
const kanbanTasks: KanbanTask[] = [
  {
    uuid: "b6c5f483-0893-4144-a0cf-f97ffd2b6b74",
    title: "Complete breakdown for P0 security tasks",
    priority: "P0",
    agentType: "async-process-manager",
    description: "Complete comprehensive breakdowns for all P0 security tasks with proper coordination and implementation plans",
    requirements: [
      "Analyze all P0 security tasks across the system",
      "Create detailed implementation breakdowns", 
      "Ensure proper coordination and prioritization",
      "Establish clear execution plans"
    ]
  },
  {
    uuid: "3c6a52c7-ee4d-4aa5-9d51-69e3eb1fdf4a",
    title: "Fix critical path traversal vulnerability in indexer-service",
    priority: "P0", 
    agentType: "security-specialist",
    description: "Identify and fix critical path traversal vulnerability in indexer-service component",
    requirements: [
      "Examine indexer-service code for path traversal vulnerabilities",
      "Implement comprehensive fixes with proper input validation",
      "Add security tests to prevent regressions",
      "Document the security improvements made"
    ]
  },
  {
    uuid: "fbc2b53d-0878-44f8-a6a3-96ee83f0b492",
    title: "Implement Automated Compliance Monitoring System",
    priority: "P0",
    agentType: "fullstack-developer", 
    description: "Implement comprehensive automated compliance monitoring with real-time alerting",
    requirements: [
      "Design real-time compliance monitoring architecture",
      "Create automated alerting system for violations",
      "Integrate with existing kanban and security systems",
      "Provide comprehensive reporting and dashboards"
    ]
  },
  {
    uuid: "a666f910-5767-47b8-a8a8-d210411784f9",
    title: "Implement WIP Limit Enforcement Gate",
    priority: "P0",
    agentType: "fullstack-developer",
    description: "Implement WIP limit enforcement gate for kanban capacity management",
    requirements: [
      "Implement WIP limit enforcement for kanban columns",
      "Create automated capacity management system", 
      "Integrate with kanban CLI for enforcement",
      "Provide real-time monitoring and alerts"
    ]
  },
  {
    uuid: "9bbfd24e-c609-4e56-b70f-569404ff83fc",
    title: "plugin-parity-001-event-driven-hooks",
    priority: "P0",
    agentType: "task-architect",
    description: "Implement event-driven plugin hooks as part of plugin parity system",
    requirements: [
      "Design event-driven plugin architecture",
      "Create comprehensive hook system for plugin integration",
      "Ensure plugin parity across different platforms",
      "Implement proper event handling and dispatch"
    ]
  },
  {
    uuid: "15540e0a-54b4-4392-8fd4-b8fe18623adf", 
    title: "security-gates-monitoring-coordination-status",
    priority: "P0",
    agentType: "async-process-manager",
    description: "Coordinate integration status of security gates and monitoring systems",
    requirements: [
      "Coordinate security gates implementation across the system",
      "Monitor integration status and progress",
      "Ensure proper communication between security components",
      "Provide status reporting and dashboards"
    ]
  },
  {
    uuid: "0c3189e4-4c58-4be4-b9b0-8e69474e0047",
    title: "Design Agent OS Core Message Protocol", 
    priority: "P0",
    agentType: "task-architect",
    description: "Design core message protocol for Agent OS system",
    requirements: [
      "Design comprehensive message protocol for Agent OS",
      "Define message formats, types, and structures",
      "Ensure reliable and efficient message passing",
      "Support various communication patterns"
    ]
  },
  {
    uuid: "3ca4b85d-0c71-4e45-bf4a-01a16b990a70",
    title: "Implement LLM Integration for Context Enhancement",
    priority: "P1",
    agentType: "fullstack-developer",
    description: "Integrate LLM capabilities to enhance context building and understanding",
    requirements: [
      "Integrate LLM services for context enhancement",
      "Implement intelligent context building and analysis", 
      "Create seamless integration with existing workflows",
      "Ensure proper error handling and fallbacks"
    ]
  },
  {
    uuid: "86765f2a-9539-4443-baa2-a0bd37195385",
    title: "Implement MCP Authentication & Authorization Layer",
    priority: "P0", 
    agentType: "security-specialist",
    description: "Implement comprehensive authentication and authorization for MCP system",
    requirements: [
      "Design comprehensive authentication and authorization architecture",
      "Implement secure authentication mechanisms",
      "Create authorization framework with RBAC",
      "Integrate with existing MCP and kanban systems"
    ]
  },
  {
    uuid: "02c78938-cf9c-45a0-b5ff-6e7a212fb043",
    title: "Fix Kanban Column Underscore Normalization Bug",
    priority: "P0",
    agentType: "fullstack-developer", 
    description: "Fix underscore normalization bug in kanban column handling",
    requirements: [
      "Analyze kanban column handling code for normalization issues",
      "Identify root cause of underscore bug",
      "Implement comprehensive fix with proper validation",
      "Add tests to prevent regressions"
    ]
  },
  {
    uuid: "ca84477b-20d4-4d49-8457-96d3e9749b6a",
    title: "Implement Scar Context Builder",
    priority: "P1",
    agentType: "fullstack-developer",
    description: "Implement Scar Context Builder as part of heal-command initiatives",
    requirements: [
      "Design the Scar Context Builder architecture",
      "Implement context aggregation and analysis algorithms",
      "Create integration with heal-command workflows",
      "Add caching and optimization mechanisms"
    ]
  }
];

// Agent spawning coordination function
export async function coordinateKanbanAgentSpawning(client: any) {
  console.log(`🚀 Starting coordinated agent spawning for ${kanbanTasks.length} kanban tasks`);
  
  // Sort tasks by priority (P0 first, then P1, etc.)
  const sortedTasks = kanbanTasks.sort((a, b) => {
    const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2 };
    return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
  });

  const spawnedAgents: Array<{taskId: string, agentId: string, agentType: string}> = [];

  // Spawn agents for each task
  for (const task of sortedTasks) {
    try {
      console.log(`📋 Spawning ${task.agentType} for task: ${task.title}`);
      
      // Create the agent session
      const { data: agentSession, error } = await client.session.create({
        body: { 
          title: `${task.agentType}-${task.uuid.substring(0, 8)}`,
        },
      });

      if (error) {
        console.error(`❌ Failed to create agent session for task ${task.uuid}:`, error);
        continue;
      }

      // Prepare task context
      const taskContext = `
You are a ${task.agentType} agent working on the following kanban task:

**Task Title:** ${task.title}
**Task UUID:** ${task.uuid}
**Priority:** ${task.priority}
**Description:** ${task.description}

**Key Requirements:**
${task.requirements.map(req => `- ${req}`).join('\n')}

**Context:**
- This task is currently in the "in_progress" column on the kanban board
- You should work independently to complete this task
- Use the available tools to examine the codebase, implement solutions, and validate results
- Focus on delivering high-quality, production-ready solutions
- Document your progress and any decisions made
- Update task status when complete

**Available Tools:**
- File system tools: read, write, edit, glob, grep
- Code analysis tools: get_symbols_overview, find_symbol, find_referencing_symbols
- Build tools: execute_shell_command for package-specific commands
- Memory tools: write_memory, read_memory for context storage
- Kanban tools: kanban commands for task management

Please begin working on this task immediately and provide regular progress updates.
      `.trim();

      // Send initial prompt to the agent
      await client.session.prompt({
        path: { id: agentSession.id },
        body: { 
          parts: [{ 
            type: 'text' as const, 
            text: taskContext 
          }] 
        },
      });

      spawnedAgents.push({
        taskId: task.uuid,
        agentId: agentSession.id,
        agentType: task.agentType
      });

      console.log(`✅ Spawned ${task.agentType} agent (session: ${agentSession.id}) for task: ${task.title}`);

      // Small delay between spawns to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Error spawning agent for task ${task.uuid}:`, error);
    }
  }

  console.log(`\n🎯 Agent Spawning Summary:`);
  console.log(`Total tasks processed: ${kanbanTasks.length}`);
  console.log(`Agents successfully spawned: ${spawnedAgents.length}`);
  console.log(`Failed spawns: ${kanbanTasks.length - spawnedAgents.length}`);

  if (spawnedAgents.length > 0) {
    console.log(`\n📊 Spawned Agents:`);
    spawnedAgents.forEach(agent => {
      console.log(`- ${agent.agentType}: ${agent.agentId} (task: ${agent.taskId})`);
    });

    console.log(`\n🔍 To monitor agents, use the monitor_agents tool`);
    console.log(`📝 To send messages, use the send_agent_message tool`);
    console.log(`📊 To check status, use the get_agent_status tool`);
  }

  return spawnedAgents;
}

// Monitoring function for spawned agents
export async function monitorKanbanAgents(client: any, agentIds: string[]) {
  console.log(`🔍 Starting monitoring of ${agentIds.length} kanban agents`);
  
  const monitoringInterval = setInterval(async () => {
    try {
      console.log(`\n📊 Agent Status Check - ${new Date().toISOString()}`);
      
      for (const agentId of agentIds) {
        try {
          const { data: messages } = await client.session.messages({
            path: { id: agentId },
          });

          const messageCount = messages?.length || 0;
          const lastMessage = messages?.[messages.length - 1];
          
          let status = 'active';
          if (lastMessage) {
            const lastMessageTime = new Date(lastMessage.created_at).getTime();
            const timeSinceLastMessage = Date.now() - lastMessageTime;
            
            if (timeSinceLastMessage > 30 * 60 * 1000) { // 30 minutes
              status = 'idle';
            } else if (timeSinceLastMessage > 5 * 60 * 1000) { // 5 minutes
              status = 'waiting_for_input';
            }
          }

          console.log(`  ${agentId}: ${status} (${messageCount} messages)`);
        } catch (error) {
          console.log(`  ${agentId}: error checking status`);
        }
      }
    } catch (error) {
      console.error('Error in monitoring loop:', error);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes

  return monitoringInterval;
}

// Usage example:
// const agents = await coordinateKanbanAgentSpawning(client);
// const monitor = monitorKanbanAgents(client, agents.map(a => a.agentId));