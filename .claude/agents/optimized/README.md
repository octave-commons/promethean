# Optimized Agent Ecosystem

This directory contains the optimized agent definitions for the Promethean Framework, designed to eliminate role overlap, enforce minimal tool usage, and provide clear specialization boundaries.

## Architecture Overview

The optimized ecosystem consolidates 26 agents into 18 specialized roles with clear boundaries and minimal tool permissions:

### Consolidated Agents

| New Agent                   | Merged From                                                               | Focus Area                                                  |
| --------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **frontend-specialist**     | frontend-clojurescript-playwright-hacker + frontend-playwright-specialist | E2E testing, frontend automation, ClojureScript integration |
| **task-architect**          | task-author + task-board-manager + task-decomposer                        | Task creation, decomposition, and lifecycle management      |
| **work-prioritizer**        | task-prioritizer + kanban-prioritizer + board-task-reviewer               | Work prioritization and capacity management                 |
| **code-quality-specialist** | code-reviewer + kanban-code-reviewer                                      | Code quality assessment and technical review                |

### New Specialized Agents

| Agent                    | Focus Area                                                              |
| ------------------------ | ----------------------------------------------------------------------- |
| **security-specialist**  | Application security, vulnerability assessment, security implementation |
| **performance-engineer** | Performance optimization, monitoring, bottleneck analysis               |
| **ux-specialist**        | User experience, interface design, usability testing                    |

### Retained Optimized Agents

| Agent                     | Optimizations                                         |
| ------------------------- | ----------------------------------------------------- |
| **code-documenter**       | Removed WebFetch, focused on documentation-only tasks |
| **devsecops-engineer**    | Maintained for infrastructure security                |
| **kanban-board-enforcer** | Streamlined tool usage, focused on rule enforcement   |

## Agent Interaction Patterns

### Primary Workflows

#### 1. Feature Development Workflow

```
task-architect → work-prioritizer → [technical-agent] → code-quality-specialist → code-documenter → kanban-board-enforcer
```

#### 2. Code Review & Quality Workflow

```
[technical-agent] → code-quality-specialist → security-specialist → performance-engineer → code-documenter
```

#### 3. Frontend Development Workflow

```
ux-specialist → frontend-specialist → code-quality-specialist → performance-engineer
```

#### 4. Task Management Workflow

```
task-architect → work-prioritizer → kanban-board-enforcer
```

### Delegation Guidelines

#### When to Delegate to Specific Agents:

**task-architect**:

- Creating new tasks or breaking down large features
- Task lifecycle management and kanban integration
- Task structuring and dependency mapping

**work-prioritizer**:

- Deciding what to work on next
- Capacity management and WIP optimization
- Strategic task sequencing and dependency resolution

**code-quality-specialist**:

- Technical code review and quality assessment
- Architecture and design pattern evaluation
- Engineering standards compliance

**security-specialist**:

- Security vulnerability assessment
- Secure coding practices implementation
- Security architecture review

**performance-engineer**:

- Performance bottleneck analysis
- Optimization implementation
- Performance monitoring setup

**ux-specialist**:

- Interface usability analysis
- User experience design review
- Accessibility compliance assessment

**frontend-specialist**:

- E2E testing implementation
- Frontend automation and testing
- ClojureScript-specific issues

**code-documenter**:

- Documentation creation and improvement
- API documentation generation
- README and guide development

**kanban-board-enforcer**:

- Rule enforcement and WIP limit management
- Workflow compliance validation
- Board health monitoring

**devsecops-engineer**:

- Infrastructure security and deployment
- CI/CD pipeline security
- Container and orchestration security

## Tool Usage Optimization

### Minimal Tool Principles

Each agent is configured with the minimal set of tools required for their specific role:

- **Read-only agents** (quality specialists): Only analysis tools, no write capabilities
- **Creation agents** (task-architect, documenter): Write tools limited to their domain
- **Enforcement agents** (kanban-board-enforcer): Shell access only for kanban commands
- **Technical agents**: Domain-specific tools (Playwright for frontend, profiling for performance)

### Removed Excessive Permissions

- **WebFetch**: Removed from documentation agents to prevent unnecessary external access
- **Bash**: Removed from review-only agents to prevent unintended system modifications
- **Write access**: Limited to agents that actually need to create/modify content

## Boundary Enforcement

### Clear Role Boundaries

Each agent definition includes explicit "Process & Boundaries" sections that:

1. **Define Focus Areas**: Clear statement of what the agent handles
2. **List Exclusions**: Specific tasks that must be delegated
3. **Provide Delegation Guidance**: When and how to hand off to other agents
4. **Enforce Tool Limits**: Specific tool usage principles and restrictions

### Anti-Overlap Measures

- **No Duplicate Responsibilities**: Each capability is assigned to exactly one agent
- **Clear Handoff Points**: Defined transitions between agent responsibilities
- **Domain Isolation**: Agents cannot perform tasks outside their defined domain
- **Tool Constraints**: Tool permissions prevent scope creep

## Usage Guidelines

### For System Integrators

1. **Agent Selection**: Choose agents based on primary task requirement
2. **Workflow Planning**: Use defined interaction patterns for multi-agent tasks
3. **Boundary Respect**: Do not request tasks outside an agent's defined scope
4. **Tool Awareness**: Understand that agents have limited tool access by design

### For Agent Developers

1. **Boundary Maintenance**: When updating agents, preserve clear boundaries
2. **Tool Minimalism**: Only add tools that are essential for the agent's role
3. **Delegation First**: Design agents to delegate rather than expand scope
4. **Interaction Clarity**: Maintain clear handoff patterns and communication

## Quality Assurance

### Validation Checklist

- [ ] No overlapping responsibilities between agents
- [ ] Minimal tool permissions for each role
- [ ] Clear delegation guidelines in each agent
- [ ] Defined interaction patterns for common workflows
- [ ] Boundary enforcement in agent definitions
- [ ] Tool usage principles and restrictions

### Continuous Improvement

The optimized agent ecosystem is designed for:

- **Maintainability**: Clear boundaries make updates and improvements safer
- **Predictability**: Consistent interaction patterns reduce confusion
- **Efficiency**: Minimal tool usage reduces overhead and complexity
- **Reliability**: Clear boundaries prevent scope creep and role confusion

## Migration Guide

### From Legacy Agents

1. **Identify Corresponding Agent**: Find the optimized agent that handles the legacy role
2. **Update Workflows**: Modify existing workflows to use new agent names
3. **Adjust Expectations**: Understand that some agents may have more focused scope
4. **Utilize Delegations**: Use multi-agent workflows for complex tasks

### Example Migrations

```
Legacy: code-reviewer + kanban-code-reviewer
Optimized: code-quality-specialist

Legacy: task-author + task-decomposer + task-prioritizer
Optimized: task-architect + work-prioritizer

Legacy: frontend-clojurescript-playwright-hacker
Optimized: frontend-specialist
```

This optimized ecosystem provides a solid foundation for the Promethean Framework's modular cognitive architecture while eliminating the architectural issues identified in the analysis.
