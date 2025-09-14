---
promptId: smart_task_templater_md
name: add-docker-compose-files-to-services
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
prompt: add-docker-compose-files-to-services
task-id: TASK-2025-08-30
priority: p3
system_commands:
  - You are a helpful assistant.
frequency_penalty: 0
max_tokens: 400
odel:
presence_penalty: 0
stream: true
temperature: 0.7
---
<hr class="__chatgpt_plugin">

We want for each service to be basically a config file.