---
uuid: "fcc926ce-5cec-45ca-a495-8f1ebefc74fd"
title: "mcp-template-system-2"
slug: "mcp-template-system-2"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T03:39:14.372Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

## 🗂 Source

- Path: docs/labeled/mcp-template-system-2.md

## 📝 Context Summary

---

title: 2025.10.02.16.48.54
filename: MCP Template System

  A new MCP tool package that enables asynchronous task delegation to Ollama,
  supporting template-based text generation with complex logic. Templates use
  S-expressions to define functions, variable insertion, and template calls. The
  system provides methods for managing Ollama jobs, conversations, and templates
  through asynchronous operations.
tags:
  - MCP
  - Ollama
  - templates
  - S-expressions
  - asynchronous
  - job management
  - text generation

references: []
---
Add a new MCP tool too packages/mcp that allow for the asyncronous delegation of tasks to ollama, which them selves are able to use the MCP tools provided by the mcp package, including to create new ollama jobs.
templates are s-expressions which include which allow for complex generation of text using a combination of allowed functions, variable insertion, and calls to other templates along with simple flow logic.
A template might look like:

It should allow you to:
- pull(modelName:string)
- listModels()
- listTemplates()
- enqueueGenerateJob(jobName?:string,modelName:string, prompt:string, suffix:string,options:OllamaOptions) -> {jobName, id

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs
