// Agent layer adapter for OpenCode hub
import type { AgentPlan, ChatMessage, Repo } from "../types.js";

export interface AgentDeps {
  planFromMessage(msg: ChatMessage, repos: Repo[]): Promise<AgentPlan>;
  commitPlan(plan: AgentPlan): Promise<void>;
}

// Simple rule-based agent for development
export class SimpleAgent implements AgentDeps {
  async planFromMessage(msg: ChatMessage, repos: Repo[]): Promise<AgentPlan> {
    // Simple logic: if user mentions repo name, target that repo; else all repos
    const targets = repos.filter(r => msg.text.includes(r.name)).map(r => r.id);
    const targetRepos = targets.length ? targets : repos.map(r => r.id);
    const tasks = targetRepos.map((rid, i) => ({
      id: `${msg.id}:t${i}`,
      title: `Implement "${msg.text}" in ${rid}`,
      repoId: rid
    }));
    return { id: `plan:${msg.id}`, title: `Auto-plan for: ${msg.text}`, targetRepos, tasks };
  }

  async commitPlan(plan: AgentPlan): Promise<void> {
    // Log the plan for now - in future would integrate with kanban
    console.log(`Committing plan: ${plan.title}`);
    for (const task of plan.tasks) {
      console.log(`  Task: ${task.title} (repo: ${task.repoId})`);
    }
  }
}

// Placeholder for future Pantheon integration
export class PrometheanAgent implements AgentDeps {
  async planFromMessage(msg: ChatMessage, repos: Repo[]): Promise<AgentPlan> {
    // TODO: Integrate with @promethean-os/pantheon
    console.log("PrometheanAgent: planFromMessage not implemented yet");
    return new SimpleAgent().planFromMessage(msg, repos);
  }

  async commitPlan(plan: AgentPlan): Promise<void> {
    // TODO: Integrate with @promethean-os/kanban
    console.log("PrometheanAgent: commitPlan not implemented yet");
    return new SimpleAgent().commitPlan(plan);
  }
}