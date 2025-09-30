---
promptId: smart_task_templater_md
name: <% tp.title %>
description: A task on the kanban of the promethean system.
author: Aaron Beavers
tags:
  - prompt-refinement
  - promptcompiler
  - "#metaprogramming"
  - "#metacompiler"
version: 0.0.1
disableProvider: false
provider: ollama
commands: generate
mode: replace
streaming: "true"
model: ollama@llama3.2:latest
prompt: <% tp.title %>
task-id: TASK-<% tp.date("YYYY-MM-DD:hh:mm:ss") %>
priority: p3
system_commands:
  - You are a helpful assistant.
frequency_penalty: 0
max_tokens: 40000
presence_penalty: 0
stream: true
temperature: 0.7
---
<hr class="__chatgpt_plugin">

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

### Related notes 
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

Using this title write a reasonable task kanban task document: <% tp.file.title %>

<%* 



await sleep(20)
app.commands.executeCommandById("chatgpt-md:call-chatgpt-api")
%> 
