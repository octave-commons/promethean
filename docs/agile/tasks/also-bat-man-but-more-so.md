---
promptId: smart_task_templater_md
name: "{{title}}"
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
prompt: "{{title}}"
task-id: TASK-{{date}}
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

<span style="font-size: small;"> (llama3.2:latest)</span>
### role::assistant

Here's a suggested revision of your context section:

## Context
### Changes and Updates
- **What changed?**: [Describe the key changes that have occurred, e.g., updated requirements, new feature added]
- **Where?**: [Specify the location or scope where these changes are relevant, e.g., specific project, department]
- **Why now?**: [Explain why these changes are necessary at this time, e.g., due to deadline, feedback from stakeholders]

## Inputs / Artifacts
- ([link or path] to relevant documentation, data, or assets)

## Definition of Done
- [ ] test X passes: [ Briefly describe the testing scenario]
- [ ] doc Y updated: [Mention the specific documentation or resource that has been updated]
- [ ] PR merged: ([link to the PR] with a brief summary of changes)

## Plan
1. … [ Outline the high-level steps for completing this task, including any dependencies or resources required]
2. …

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

Using this title write a reasonable task kanban task document:

 


<hr class="__chatgpt_plugin">

### role::assistant<span style="font-size: small;"> (llama3.2:latest)</span>

**Task:** Research and Integration of New Knowledge Management Tool

**Description:**

* Objective: To research and integrate a new knowledge management tool to enhance the personal note-taking system within Obsidian.
* Tasks:
	1. **Research New Tools**
		+ Identify potential tools that meet the requirements for knowledge management (e.g., organization, tagging, linking)
		+ Read reviews, documentation, and user feedback for each tool
	2. **Evaluate Tool Features**
		+ Compare features of identified tools against existing Obsidian functionality
		+ Prioritize features based on importance and feasibility of integration
	3. **Integrate Tool with Obsidian**
		+ Set up new tool within Obsidian (if necessary)
		+ Configure any required settings or plugins
		+ Test integration with sample notes to ensure seamless linking and tagging
	4. **Document Experience**
		+ Write a comprehensive review of the integrated tool's features and performance
		+ Share findings with relevant stakeholders (e.g., team members, project managers)
* **Dependencies:**
	+ Access to Obsidian vault and tools for integration testing
	+ Basic understanding of Markdown formatting and Obsidian functionality
* **Estimated Time:** 4-6 hours

**Ready For:** [Insert team member or stakeholder name] to review and approve the integration plan.

<hr class="__chatgpt_plugin">

### role::user

