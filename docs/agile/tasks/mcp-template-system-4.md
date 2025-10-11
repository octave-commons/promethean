---
uuid: "406fb89b-37be-41b5-a236-36e779f9ad4f"
title: "mcp-template-system-4"
slug: "mcp-template-system-4"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T01:03:32.221Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🗂 Source

- Path: docs/labeled/mcp-template-system-4.md

## 📝 Context Summary

---
uuid: 59a92c76-41f3-4fe0-bf77-8fd492df38ec
created_at: '2025-10-02T16:48:54Z'
title: 2025.10.02.16.48.54
filename: MCP Template System
description: >-
  A new MCP tool package that enables asynchronous task delegation to Ollama,
  using S-expression templates for complex text generation workflows. It
  supports template definition, job enqueuing, conversation management, and
  real-time queue monitoring with Ollama integration.
tags:
  - MCP
  - Ollama
  - S-expression
  - async
  - templates
  - job
  - queue
  - conversation
  - workflow
---
Add a new MCP tool too packages/mcp that allow for the asyncronous delegation of tasks to ollama, which them selves are able to use the MCP tools provided by the mcp package, including to create new ollama jobs.
templates are s-expressions which include which allow for complex generation of text using a combination of allowed functions, variable insertion, and calls to other templates along with simple flow logic.
A template might look like:

It should allow you to:
- pull(modelName:string)
- listModels()
- listTemplates()
- enqueueGenerateJob(jobName?:string,modelName:string, prompt:string, suffix:string,options:OllamaOptions) -> {jobNam

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs

























