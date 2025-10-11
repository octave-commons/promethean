---
uuid: "695632f6-8bb2-4051-bbbc-42dd6729fe8f"
title: "phase out proxy in favor of bridge service"
slug: "phase-out-proxy-in-favor-of-bridge-service"
status: "done"
priority: "P3"
labels: ["bridge", "phase", "proxy", "service"]
created_at: "2025-10-11T19:22:57.823Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




## 🛠️ Description

Retire the existing proxy layer and expose all external APIs through the broker-driven bridge service.

---

## 🎯 Goals

- Consolidate public access points into the bridge
- Ensure bridge speaks OpenAI-compatible API for LLM interactions

---

## 📦 Requirements

- [ ] Frontends route through bridge for API access
- [ ] LLM requests forwarded through broker to backend models
- [ ] STT and TTS endpoints available via bridge
- [ ] Access controlled via policy rules

---

## 📋 Subtasks

- [ ] Audit current proxy usage
- [ ] Extend bridge with OpenAI-compatible endpoints
- [ ] Migrate frontend/LLM/STT/TTS clients to bridge
- [ ] Remove legacy proxy code

---
## 🧮 Story Points

8

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

- [API spec](https://err-stealth-16-ai-studio-a1vgg.tailbe888a.ts.net/v1/openapi.json)
- [[kanban]]
```
#framework-core #Todo
```



