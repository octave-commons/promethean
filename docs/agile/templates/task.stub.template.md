---
task-id: TASK-{{date}}
title: <verb> <thing> <qualifier>
state: New
prev:
txn: "{{ISO8601}}-{{rand4}}"
owner: err
priority: p3
size: m
epic: EPC-000
depends_on: []
labels:
  - board:auto
  - lang:ts
due:
links: []
artifacts: []
rationale:
proposed_transitions:
  - New->Accepted
  - Accepted->Breakdown
tags:
  - task/TASK-{{YYYYMMDD-hhmmss}}-{{rand4}}
  - board/kanban
  - state/New
  - owner/err
  - priority/p3
  - epic/EPC-000
---
<hr class="__chatgpt_plugin">

<span style="font-size: small;"> (llama3.2:latest)</span>
### role::assistant

Here's a suggested revision of your context section:

## Description
- **What changed?** [Describe the key changes that have occurred, e.g., updated requirements, new feature added]
- **Where is the impact?** [Specify the location or scope where these changes are relevant, e.g., specific project, department]
- **Why now?** [Explain why these changes are necessary at this time, e.g., due to deadline, feedback from stakeholders]
- **Supporting context** ([link or path] to relevant documentation, data, or assets)

## Goals
- [Outline the measurable outcomes or success criteria for this task]
- [List any dependencies, stakeholders, or milestones that must be coordinated]

## Requirements
- [ ] test X passes: [Briefly describe the testing scenario]
- [ ] doc Y updated: [Mention the specific documentation or resource that has been updated]
- [ ] PR merged: ([link to the PR] with a brief summary of changes)
- [ ] Additional constraints or non-functional requirements are addressed: [List or link to relevant specifications]

## Subtasks
1. … [Outline the high-level steps for completing this task, including any dependencies or resources required]
2. …
3. …

## Relevant Resources

You might find [this](link) useful while working on this task.

### Smart Connections Configuration
```smart-connections
{
  "render_markdown": true,
  "show_full_path": false,
  "exclude_blocks_from_source_connections": false,
  "exclude_frontmatter_blocks": true,
  "expanded_view": false,
  "results_limit": "20",
  "exclude_inlinks": false,
  "exclude_outlinks": false
}
```

### Smart ChatGPT Configuration
```smart-chatgpt
```
<hr class="__chatgpt_plugin">

### role::user

<% tp.file.title() %>

<% tp.app.commands.executeCommandById("chatgpt-md:call-chatgpt-api") %>

