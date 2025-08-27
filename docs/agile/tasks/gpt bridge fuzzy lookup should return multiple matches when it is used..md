## 🛠️ Description
**Status:** blocked

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

#framework-core

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [kanban](../boards/kanban.md)

#accepted

## Blockers
- No active owner or unclear scope

#breakdown
