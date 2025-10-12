---
uuid: "5e02a76a-4b66-4dbb-8a93-16fdbee83283"
title: "gpt bridge fuzzy lookup should return multiple matches when it is used"
slug: "gpt-bridge-fuzzy-lookup-should-return-multiple-matches-when-it-is-used"
status: "done"
priority: "P3"
labels: ["bridge", "fuzzy", "gpt", "matches"]
created_at: "2025-10-12T02:22:05.428Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































## 🛠️ Description
```
**Status:** blocked
```
Update the GPT bridge fuzzy lookup so it returns multiple potential matches instead of only the first result.

---

## 🎯 Goals

- Provide a ranked list of candidates for fuzzy searches.
- Allow users to select from the list when ambiguity exists.

---

## 📦 Requirements

- [ ] Search endpoint returns top N matches with relevance scores.
- [ ] Client can display and choose among suggestions.
- [ ] Unit tests cover multi-match scenarios.

---

## 📋 Subtasks

- [ ] Audit current fuzzy lookup implementation.
- [ ] Modify search logic to emit a list of matches.
- [ ] Expose new response format through bridge API.
- [ ] Add selection handling to consuming clients.
- [ ] Write tests for ranking and selection.
- [ ] Document the updated behaviour.

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

#accepted

## Blockers
- No active owner or unclear scope

#breakdown








































































































