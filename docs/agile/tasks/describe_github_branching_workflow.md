---
uuid: e72a8ed9-7efa-4817-bf55-0b65fd84e5d2
title: create and push a feature branch
status: todo
priority: P3
labels: []
created_at: '2025-09-15T02:02:58.510Z'
---
## 🛠️ Description

Merging straight into `main` caused instability. This task documents a
structured Git branching workflow where features land on `dev`, are
promoted to `staging`, and finally reach `main` once validated. The
document also specifies branch naming conventions, merge gates, and CI
expectations.

### Branch Naming Conventions

- `feature/<summary>` – new features
- `fix/<summary>` – bug fixes
- `docs/<summary>` – documentation changes
- `chore/<summary>` – refactors or maintenance

### Merge Requirements

1. **Feature branch → `dev`**
   - Rebase on latest `origin/dev`.
   - `make format lint test` must succeed before opening a PR.
2. **`dev` → `staging`**
   - All `dev` CI checks are green.
   - Run `make build` and any integration tests.
3. **`staging` → `main`**
   - Staging has been manually verified.
   - Full CI suite passes (`make lint test build`).

### CI Expectations

- **`dev`**: linting and unit tests.
- **`staging`**: linting, unit tests, integration tests, and build.
- **`main`**: full test suite plus manual verification.

### Example Commands

```bash
# create and push a feature branch
git checkout -b feature/add-auth
make format lint test
git push origin feature/add-auth

# promote through the environments
git checkout staging
git merge dev && git push origin staging

git checkout main
git merge staging && git push origin main
```

See the [[README|contribution guidelines]] for general workflow
details.

---

## 🎯 Goals

- Document branch naming conventions.
- Define merge requirements from `dev` → `staging` → `main`.
- Clarify CI expectations for each stage.
- Provide example commands and link to contribution docs.

---

## 📦 Requirements

- [ ] Branch names follow `<type>/<summary>`.
- [ ] `make format lint test` passes before merging to `dev`.
- [ ] `make build` and integration tests run before merging to `staging`.
- [ ] Full CI suite passes before merging to `main`.

---

## 📋 Subtasks

- [ ] Draft branch naming section.
- [ ] Document merge gates and CI requirements.
- [ ] Add example git commands.
- [ ] Link to contribution docs.

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

- [[kanban]]
#agent-thinking
#Breakdown


