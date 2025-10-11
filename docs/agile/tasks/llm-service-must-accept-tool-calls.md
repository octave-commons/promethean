---
uuid: "c858464b-c43b-4521-80b9-12fa3d5cd464"
title: "llm service must accept tool calls"
slug: "llm-service-must-accept-tool-calls"
status: "done"
priority: "P3"
labels: ["calls", "llm", "service", "tool"]
created_at: "2025-10-11T19:22:57.823Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🛠️ Description

Extend the LLM service to support tool/function calls so agents can request structured actions.

---

## 🎯 Goals

- Allow clients to register callable tools with schema
- Route tool invocation requests through broker to appropriate service

---

## 📦 Requirements

- [ ] API accepts OpenAI-style tool definitions
- [ ] Service returns tool call payloads when requested
- [ ] Executed tool results fed back into conversation flow
- [ ] Tests cover tool registration and invocation

---

## 📋 Subtasks

- [ ] Define tool-call schema in bridge and LLM service
- [ ] Implement tool selection logic in LLM adapter
- [ ] Integrate broker messaging for tool execution
- [ ] Add end-to-end tests for sample tool

---

## 🔗 Related Epics
```
#framework-core
```
---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[kanban]]
```
#framework-core #Ready #ready
```



